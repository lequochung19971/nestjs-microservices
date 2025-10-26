import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { and, desc, eq, ilike, or, sql } from 'drizzle-orm';
import {
  BaseQueryResponse,
  CreateWarehouseDto,
  QueryWarehouseRequest,
  UpdateWarehouseDto,
  WarehouseDto,
} from 'nest-shared/contracts';
import { DrizzleService } from '../../db/drizzle.service';
import { warehouses } from '../../db/schema';

@Injectable()
export class WarehousesService {
  private readonly logger = new Logger(WarehousesService.name);

  constructor(private readonly drizzle: DrizzleService) {}

  async create(dto: CreateWarehouseDto): Promise<WarehouseDto> {
    try {
      // Check if warehouse with same name already exists
      const existingWarehouse =
        await this.drizzle.client.query.warehouses.findFirst({
          where: eq(warehouses.name, dto.name),
        });

      if (existingWarehouse) {
        throw new ConflictException(
          `Warehouse with name '${dto.name}' already exists`,
        );
      }

      const [newWarehouse] = await this.drizzle.client
        .insert(warehouses)
        .values({
          name: dto.name,
          address: dto.address,
          isActive: dto.isActive ?? true,
        })
        .returning();

      this.logger.log(`Created warehouse: ${newWarehouse.id}`);

      return this.transformToWarehouseDto(newWarehouse);
    } catch (error) {
      if (error instanceof ConflictException) {
        throw error;
      }
      this.logger.error(
        `Failed to create warehouse: ${error.message}`,
        error.stack,
      );
      throw new BadRequestException(
        `Failed to create warehouse: ${error.message}`,
      );
    }
  }

  async findAll(
    query: QueryWarehouseRequest,
  ): Promise<BaseQueryResponse<WarehouseDto>> {
    try {
      const {
        page = 1,
        limit = 20,
        search,
        isActive,
        sortField = 'createdAt',
        sortOrder = 'desc',
      } = query;

      const offset = (page - 1) * limit;

      // Build where conditions
      const whereConditions = [];

      if (search) {
        whereConditions.push(
          or(
            ilike(warehouses.name, `%${search}%`),
            ilike(warehouses.address, `%${search}%`),
          ),
        );
      }

      if (isActive !== undefined) {
        whereConditions.push(eq(warehouses.isActive, isActive));
      }

      const whereClause =
        whereConditions.length > 0 ? and(...whereConditions) : undefined;

      // Build order clause
      let orderClause;
      switch (sortField) {
        case 'name':
          orderClause =
            sortOrder === 'asc' ? warehouses.name : desc(warehouses.name);
          break;
        case 'updatedAt':
          orderClause =
            sortOrder === 'asc'
              ? warehouses.updatedAt
              : desc(warehouses.updatedAt);
          break;
        default: // createdAt
          orderClause =
            sortOrder === 'asc'
              ? warehouses.createdAt
              : desc(warehouses.createdAt);
      }

      // Get warehouses
      const items = await this.drizzle.client.query.warehouses.findMany({
        where: whereClause,
        limit,
        offset,
        orderBy: orderClause,
      });

      // Get total count for pagination
      const countResult = await this.drizzle.client
        .select({ count: sql`count(*)` })
        .from(warehouses)
        .where(whereClause);

      const total = Number(countResult[0].count) || 0;
      const totalPages = Math.ceil(total / limit);

      // Transform to DTOs
      const warehouseDtos = items.map((item) =>
        this.transformToWarehouseDto(item),
      );

      return BaseQueryResponse.create({
        data: warehouseDtos,
        page,
        limit,
        totalCount: total,
      });
    } catch (error) {
      this.logger.error(
        `Failed to find warehouses: ${error.message}`,
        error.stack,
      );
      throw new BadRequestException(
        `Failed to list warehouses: ${error.message}`,
      );
    }
  }

  async findOne(id: string): Promise<WarehouseDto> {
    try {
      const warehouse = await this.drizzle.client.query.warehouses.findFirst({
        where: eq(warehouses.id, id),
      });

      if (!warehouse) {
        throw new NotFoundException(`Warehouse with ID ${id} not found`);
      }

      return this.transformToWarehouseDto(warehouse);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(
        `Failed to find warehouse ${id}: ${error.message}`,
        error.stack,
      );
      throw new BadRequestException(
        `Failed to get warehouse: ${error.message}`,
      );
    }
  }

  async update(id: string, dto: UpdateWarehouseDto): Promise<WarehouseDto> {
    try {
      // Check if warehouse exists
      const existingWarehouse = await this.findOne(id);

      // Check name uniqueness if name is being updated
      if (dto.name && dto.name !== existingWarehouse.name) {
        const nameExists = await this.drizzle.client.query.warehouses.findFirst(
          {
            where: and(
              eq(warehouses.name, dto.name),
              sql`${warehouses.id} != ${id}`,
            ),
          },
        );

        if (nameExists) {
          throw new ConflictException(
            `Warehouse with name '${dto.name}' already exists`,
          );
        }
      }

      await this.drizzle.client
        .update(warehouses)
        .set({
          ...(dto.name && { name: dto.name }),
          ...(dto.address !== undefined && { address: dto.address }),
          ...(dto.isActive !== undefined && { isActive: dto.isActive }),
          updatedAt: new Date(),
        })
        .where(eq(warehouses.id, id));

      this.logger.log(`Updated warehouse: ${id}`);

      return this.findOne(id);
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof ConflictException
      ) {
        throw error;
      }
      this.logger.error(
        `Failed to update warehouse ${id}: ${error.message}`,
        error.stack,
      );
      throw new BadRequestException(
        `Failed to update warehouse: ${error.message}`,
      );
    }
  }

  async remove(id: string): Promise<WarehouseDto> {
    try {
      const warehouse = await this.findOne(id);

      // Soft delete by setting isActive to false
      await this.drizzle.client
        .update(warehouses)
        .set({
          isActive: false,
          updatedAt: new Date(),
        })
        .where(eq(warehouses.id, id));

      this.logger.log(`Soft deleted warehouse: ${id}`);

      return warehouse;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(
        `Failed to delete warehouse ${id}: ${error.message}`,
        error.stack,
      );
      throw new BadRequestException(
        `Failed to delete warehouse: ${error.message}`,
      );
    }
  }

  private transformToWarehouseDto(warehouse: any): WarehouseDto {
    return new WarehouseDto({
      id: warehouse.id,
      name: warehouse.name,
      address: warehouse.address,
      isActive: warehouse.isActive,
      createdAt: warehouse.createdAt,
      updatedAt: warehouse.updatedAt,
    });
  }
}
