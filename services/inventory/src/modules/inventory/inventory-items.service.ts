import {
  BadRequestException,
  Inject,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { and, desc, eq, sql } from 'drizzle-orm';
import {
  AdjustQuantityDto,
  BaseQueryResponse,
  CreateInventoryItemDto,
  InventoryItemDto,
  InventoryItemProductDto,
  InventoryStatus,
  QueryInventoryItemRequest,
  UpdateInventoryItemDto,
} from 'nest-shared/contracts';
import { DrizzleService } from '../../db/drizzle.service';
import { inventoryItems, inventoryProducts, warehouses } from '../../db/schema';

@Injectable()
export class InventoryItemsService {
  private readonly logger = new Logger(InventoryItemsService.name);

  constructor(private readonly drizzle: DrizzleService) {}

  async create(dto: CreateInventoryItemDto): Promise<InventoryItemDto> {
    try {
      // Validate warehouse exists
      await this.validateWarehouse(dto.warehouseId);

      const [newInventoryItem] = await this.drizzle.client
        .insert(inventoryItems)
        .values({
          warehouseId: dto.warehouseId,
          quantity: dto.quantity,
          reservedQuantity: 0,
          status: dto.status ?? InventoryStatus.AVAILABLE,
          reorderPoint: dto.reorderPoint,
          reorderQuantity: dto.reorderQuantity,
        })
        .returning();

      this.logger.log(`Created inventory item: ${newInventoryItem.id}`);

      return this.transformToInventoryItemDto(newInventoryItem);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(
        `Failed to create inventory item: ${error.message}`,
        error.stack,
      );
      throw new BadRequestException(
        `Failed to create inventory item: ${error.message}`,
      );
    }
  }

  async findAll(
    query: QueryInventoryItemRequest,
  ): Promise<BaseQueryResponse<InventoryItemDto>> {
    try {
      const {
        page = 1,
        limit = 20,
        warehouseId,
        productId,
        status,
        lowStock,
        outOfStock,
        sortField = 'updatedAt',
        sortOrder = 'desc',
      } = query;

      const offset = (page - 1) * limit;

      // Build where conditions
      const whereConditions = [];

      if (warehouseId) {
        whereConditions.push(eq(inventoryItems.warehouseId, warehouseId));
      }

      if (productId) {
        // Join with inventory_products to filter by product
        const itemsWithProduct = this.drizzle.client
          .select({ inventoryItemId: inventoryItems.id })
          .from(inventoryItems)
          .innerJoin(
            sql`inventory_products`,
            sql`inventory_products.inventory_item_id = inventory_items.id`,
          )
          .where(sql`inventory_products.product_id = ${productId}`);

        whereConditions.push(sql`${inventoryItems.id} IN ${itemsWithProduct}`);
      }

      if (status) {
        whereConditions.push(eq(inventoryItems.status, status));
      }

      if (lowStock) {
        whereConditions.push(
          sql`${inventoryItems.quantity} <= ${inventoryItems.reorderPoint}`,
        );
      }

      if (outOfStock) {
        whereConditions.push(eq(inventoryItems.quantity, 0));
      }

      const whereClause =
        whereConditions.length > 0 ? and(...whereConditions) : undefined;

      // Build order clause
      let orderClause;
      switch (sortField) {
        case 'quantity':
          orderClause =
            sortOrder === 'asc'
              ? inventoryItems.quantity
              : desc(inventoryItems.quantity);
          break;
        case 'status':
          orderClause =
            sortOrder === 'asc'
              ? inventoryItems.status
              : desc(inventoryItems.status);
          break;
        default: // updatedAt
          orderClause =
            sortOrder === 'asc'
              ? inventoryItems.updatedAt
              : desc(inventoryItems.updatedAt);
      }

      // Get inventory items
      const items = await this.drizzle.client.query.inventoryItems.findMany({
        where: whereClause,
        limit,
        offset,
        orderBy: orderClause,
        with: {
          warehouse: true,
          product: true,
        },
      });

      // Get total count for pagination
      const countResult = await this.drizzle.client
        .select({ count: sql`count(*)` })
        .from(inventoryItems)
        .where(whereClause);

      const total = Number(countResult[0].count) || 0;
      const totalPages = Math.ceil(total / limit);

      // Transform to DTOs
      const inventoryItemDtos = items.map((item) =>
        this.transformToInventoryItemDto(item),
      );

      return BaseQueryResponse.create({
        data: inventoryItemDtos,
        page,
        limit,
        totalCount: total,
      });
    } catch (error) {
      this.logger.error(
        `Failed to find inventory items: ${error.message}`,
        error.stack,
      );
      throw new BadRequestException(
        `Failed to list inventory items: ${error.message}`,
      );
    }
  }

  async findOne(id: string): Promise<InventoryItemDto> {
    try {
      const inventoryItem =
        await this.drizzle.client.query.inventoryItems.findFirst({
          where: eq(inventoryItems.id, id),
          with: {
            warehouse: true,
            product: true,
          },
        });

      if (!inventoryItem) {
        throw new NotFoundException(`Inventory item with ID ${id} not found`);
      }

      return this.transformToInventoryItemDto(inventoryItem);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(
        `Failed to find inventory item ${id}: ${error.message}`,
        error.stack,
      );
      throw new BadRequestException(
        `Failed to get inventory item: ${error.message}`,
      );
    }
  }

  async update(
    id: string,
    dto: UpdateInventoryItemDto,
  ): Promise<InventoryItemDto> {
    try {
      // Check if inventory item exists
      await this.findOne(id);

      if (dto.warehouseId) {
        await this.validateWarehouse(dto.warehouseId);
      }

      await this.drizzle.client
        .update(inventoryItems)
        .set({
          ...(dto.quantity !== undefined && { quantity: dto.quantity }),
          ...(dto.status && { status: dto.status }),
          ...(dto.reorderPoint !== undefined && {
            reorderPoint: dto.reorderPoint,
          }),
          ...(dto.reorderQuantity !== undefined && {
            reorderQuantity: dto.reorderQuantity,
          }),
          ...(dto.warehouseId !== undefined && {
            warehouseId: dto.warehouseId,
          }),
          updatedAt: new Date(),
        })
        .where(eq(inventoryItems.id, id));

      this.logger.log(`Updated inventory item: ${id}`);

      return this.findOne(id);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(
        `Failed to update inventory item ${id}: ${error.message}`,
        error.stack,
      );
      throw new BadRequestException(
        `Failed to update inventory item: ${error.message}`,
      );
    }
  }

  async adjustQuantity(
    id: string,
    dto: AdjustQuantityDto,
  ): Promise<InventoryItemDto> {
    try {
      const inventoryItem = await this.findOne(id);

      const newQuantity = inventoryItem.quantity + dto.quantity;

      if (newQuantity < 0) {
        throw new BadRequestException(
          `Insufficient stock. Current quantity: ${inventoryItem.quantity}, requested adjustment: ${dto.quantity}`,
        );
      }

      await this.drizzle.client
        .update(inventoryItems)
        .set({
          quantity: newQuantity,
          updatedAt: new Date(),
        })
        .where(eq(inventoryItems.id, id));

      this.logger.log(
        `Adjusted quantity for inventory item ${id}: ${dto.quantity} (new total: ${newQuantity})`,
      );

      return this.findOne(id);
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      this.logger.error(
        `Failed to adjust quantity for inventory item ${id}: ${error.message}`,
        error.stack,
      );
      throw new BadRequestException(
        `Failed to adjust quantity: ${error.message}`,
      );
    }
  }

  async findByWarehouse(warehouseId: string): Promise<InventoryItemDto[]> {
    try {
      // Validate warehouse exists
      await this.validateWarehouse(warehouseId);

      const items = await this.drizzle.client.query.inventoryItems.findMany({
        where: eq(inventoryItems.warehouseId, warehouseId),
        with: {
          warehouse: true,
          product: true,
        },
      });

      return items.map((item) => this.transformToInventoryItemDto(item));
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(
        `Failed to find inventory items for warehouse ${warehouseId}: ${error.message}`,
        error.stack,
      );
      throw new BadRequestException(
        `Failed to get inventory items for warehouse: ${error.message}`,
      );
    }
  }

  async findByProduct(productId: string): Promise<InventoryItemDto[]> {
    try {
      const items = await this.drizzle.client
        .select({
          inventoryItem: inventoryItems,
          product: inventoryProducts,
        })
        .from(inventoryItems)
        .innerJoin(
          inventoryProducts,
          eq(inventoryProducts.id, inventoryItems.inventoryProductId),
        )
        .where(eq(inventoryProducts.productId, productId));

      return items.map((item) =>
        this.transformToInventoryItemDto({
          ...item.inventoryItem,
          product: item.product,
        }),
      );
    } catch (error) {
      this.logger.error(
        `Failed to find inventory items for product ${productId}: ${error.message}`,
        error.stack,
      );
      throw new BadRequestException(
        `Failed to get inventory items for product: ${error.message}`,
      );
    }
  }

  async remove(id: string): Promise<InventoryItemDto> {
    try {
      const inventoryItem = await this.findOne(id);

      await this.drizzle.client
        .delete(inventoryItems)
        .where(eq(inventoryItems.id, id));

      this.logger.log(`Deleted inventory item: ${id}`);

      return inventoryItem;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(
        `Failed to delete inventory item ${id}: ${error.message}`,
        error.stack,
      );
      throw new BadRequestException(
        `Failed to delete inventory item: ${error.message}`,
      );
    }
  }

  private async validateWarehouse(warehouseId: string): Promise<void> {
    const warehouse = await this.drizzle.client.query.warehouses.findFirst({
      where: eq(warehouses.id, warehouseId),
    });

    if (!warehouse) {
      throw new NotFoundException(`Warehouse with ID ${warehouseId} not found`);
    }

    if (!warehouse.isActive) {
      throw new BadRequestException(`Warehouse ${warehouseId} is not active`);
    }
  }

  private transformToInventoryItemDto(inventoryItem: any): InventoryItemDto {
    const product = inventoryItem.product
      ? new InventoryItemProductDto({
          id: inventoryItem.product.id,
          productId: inventoryItem.product.productId,
          sku: inventoryItem.product.sku,
          name: inventoryItem.product.name,
          isActive: inventoryItem.product.isActive,
          mediaUrl: inventoryItem.product.mediaUrl ?? undefined,
          lastUpdated: inventoryItem.product.lastUpdated,
        })
      : undefined;

    return new InventoryItemDto({
      id: inventoryItem.id,
      warehouseId: inventoryItem.warehouseId,
      quantity: inventoryItem.quantity,
      reservedQuantity: inventoryItem.reservedQuantity,
      status: inventoryItem.status,
      reorderPoint: inventoryItem.reorderPoint,
      reorderQuantity: inventoryItem.reorderQuantity,
      inventoryProductId: inventoryItem.inventoryProductId,
      product,
      updatedAt: inventoryItem.updatedAt,
    });
  }
}
