import {
  BadRequestException,
  Inject,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { and, desc, eq, gte, lte, sql } from 'drizzle-orm';
import {
  BaseQueryResponse,
  CreateInventoryTransactionDto,
  InventoryTransactionDto,
  QueryInventoryTransactionRequest,
  TransactionType,
} from 'nest-shared/contracts';
import { DrizzleService } from '../../db/drizzle.service';
import { inventoryItems, inventoryTransactions } from '../../db/schema';

@Injectable()
export class InventoryTransactionsService {
  private readonly logger = new Logger(InventoryTransactionsService.name);

  constructor(private readonly drizzle: DrizzleService) {}

  async create(
    dto: CreateInventoryTransactionDto,
  ): Promise<InventoryTransactionDto> {
    try {
      // Validate inventory item exists
      await this.validateInventoryItem(dto.inventoryItemId);

      const [newTransaction] = await this.drizzle.client
        .insert(inventoryTransactions)
        .values({
          inventoryItemId: dto.inventoryItemId,
          quantity: dto.quantity,
          type: dto.type,
          referenceId: dto.referenceId,
          referenceType: dto.referenceType,
          notes: dto.notes,
        })
        .returning();

      this.logger.log(`Created inventory transaction: ${newTransaction.id}`);

      return this.transformToInventoryTransactionDto(newTransaction);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(
        `Failed to create inventory transaction: ${error.message}`,
        error.stack,
      );
      throw new BadRequestException(
        `Failed to create inventory transaction: ${error.message}`,
      );
    }
  }

  async findAll(
    query: QueryInventoryTransactionRequest,
  ): Promise<BaseQueryResponse<InventoryTransactionDto>> {
    try {
      const {
        page = 1,
        limit = 20,
        inventoryItemId,
        type,
        referenceId,
        referenceType,
        startDate,
        endDate,
        sortField = 'createdAt',
        sortOrder = 'desc',
      } = query;

      const offset = (page - 1) * limit;

      // Build where conditions
      const whereConditions = [];

      if (inventoryItemId) {
        whereConditions.push(
          eq(inventoryTransactions.inventoryItemId, inventoryItemId),
        );
      }

      if (type) {
        whereConditions.push(eq(inventoryTransactions.type, type));
      }

      if (referenceId) {
        whereConditions.push(
          eq(inventoryTransactions.referenceId, referenceId),
        );
      }

      if (referenceType) {
        whereConditions.push(
          eq(inventoryTransactions.referenceType, referenceType),
        );
      }

      if (startDate) {
        whereConditions.push(gte(inventoryTransactions.createdAt, startDate));
      }

      if (endDate) {
        whereConditions.push(lte(inventoryTransactions.createdAt, endDate));
      }

      const whereClause =
        whereConditions.length > 0 ? and(...whereConditions) : undefined;

      // Build order clause
      let orderClause;
      switch (sortField) {
        case 'quantity':
          orderClause =
            sortOrder === 'asc'
              ? inventoryTransactions.quantity
              : desc(inventoryTransactions.quantity);
          break;
        case 'type':
          orderClause =
            sortOrder === 'asc'
              ? inventoryTransactions.type
              : desc(inventoryTransactions.type);
          break;
        default: // createdAt
          orderClause =
            sortOrder === 'asc'
              ? inventoryTransactions.createdAt
              : desc(inventoryTransactions.createdAt);
      }

      // Get transactions
      const items =
        await this.drizzle.client.query.inventoryTransactions.findMany({
          where: whereClause,
          limit,
          offset,
          orderBy: orderClause,
          with: {
            inventoryItem: {
              with: {
                warehouse: true,
              },
            },
          },
        });

      // Get total count for pagination
      const countResult = await this.drizzle.client
        .select({ count: sql`count(*)` })
        .from(inventoryTransactions)
        .where(whereClause);

      const total = Number(countResult[0].count) || 0;
      const totalPages = Math.ceil(total / limit);

      // Transform to DTOs
      const transactionDtos = items.map((item) =>
        this.transformToInventoryTransactionDto(item),
      );

      return BaseQueryResponse.create({
        data: transactionDtos,
        page,
        limit,
        totalCount: total,
      });
    } catch (error) {
      this.logger.error(
        `Failed to find inventory transactions: ${error.message}`,
        error.stack,
      );
      throw new BadRequestException(
        `Failed to list inventory transactions: ${error.message}`,
      );
    }
  }

  async findOne(id: string): Promise<InventoryTransactionDto> {
    try {
      const transaction =
        await this.drizzle.client.query.inventoryTransactions.findFirst({
          where: eq(inventoryTransactions.id, id),
          with: {
            inventoryItem: {
              with: {
                warehouse: true,
              },
            },
          },
        });

      if (!transaction) {
        throw new NotFoundException(
          `Inventory transaction with ID ${id} not found`,
        );
      }

      return this.transformToInventoryTransactionDto(transaction);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(
        `Failed to find inventory transaction ${id}: ${error.message}`,
        error.stack,
      );
      throw new BadRequestException(
        `Failed to get inventory transaction: ${error.message}`,
      );
    }
  }

  async findByInventoryItem(
    inventoryItemId: string,
  ): Promise<InventoryTransactionDto[]> {
    try {
      // Validate inventory item exists
      await this.validateInventoryItem(inventoryItemId);

      const transactions =
        await this.drizzle.client.query.inventoryTransactions.findMany({
          where: eq(inventoryTransactions.inventoryItemId, inventoryItemId),
          orderBy: desc(inventoryTransactions.createdAt),
          with: {
            inventoryItem: {
              with: {
                warehouse: true,
              },
            },
          },
        });

      return transactions.map((transaction) =>
        this.transformToInventoryTransactionDto(transaction),
      );
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(
        `Failed to find transactions for inventory item ${inventoryItemId}: ${error.message}`,
        error.stack,
      );
      throw new BadRequestException(
        `Failed to get transactions for inventory item: ${error.message}`,
      );
    }
  }

  async getTransactionSummary(inventoryItemId: string): Promise<{
    totalPurchases: number;
    totalSales: number;
    totalReturns: number;
    totalAdjustments: number;
    totalTransfers: number;
  }> {
    try {
      await this.validateInventoryItem(inventoryItemId);

      const summary = await this.drizzle.client
        .select({
          type: inventoryTransactions.type,
          totalQuantity: sql<number>`sum(${inventoryTransactions.quantity})`,
        })
        .from(inventoryTransactions)
        .where(eq(inventoryTransactions.inventoryItemId, inventoryItemId))
        .groupBy(inventoryTransactions.type);

      const result = {
        totalPurchases: 0,
        totalSales: 0,
        totalReturns: 0,
        totalAdjustments: 0,
        totalTransfers: 0,
      };

      for (const row of summary) {
        switch (row.type) {
          case TransactionType.PURCHASE:
            result.totalPurchases = Number(row.totalQuantity) || 0;
            break;
          case TransactionType.SALE:
            result.totalSales = Number(row.totalQuantity) || 0;
            break;
          case TransactionType.RETURN:
            result.totalReturns = Number(row.totalQuantity) || 0;
            break;
          case TransactionType.ADJUSTMENT:
            result.totalAdjustments = Number(row.totalQuantity) || 0;
            break;
          case TransactionType.TRANSFER:
            result.totalTransfers = Number(row.totalQuantity) || 0;
            break;
        }
      }

      return result;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(
        `Failed to get transaction summary for inventory item ${inventoryItemId}: ${error.message}`,
        error.stack,
      );
      throw new BadRequestException(
        `Failed to get transaction summary: ${error.message}`,
      );
    }
  }

  private async validateInventoryItem(inventoryItemId: string): Promise<void> {
    const inventoryItem =
      await this.drizzle.client.query.inventoryItems.findFirst({
        where: eq(inventoryItems.id, inventoryItemId),
      });

    if (!inventoryItem) {
      throw new NotFoundException(
        `Inventory item with ID ${inventoryItemId} not found`,
      );
    }
  }

  private transformToInventoryTransactionDto(
    transaction: any,
  ): InventoryTransactionDto {
    return new InventoryTransactionDto({
      id: transaction.id,
      inventoryItemId: transaction.inventoryItemId,
      quantity: transaction.quantity,
      type: transaction.type,
      referenceId: transaction.referenceId,
      referenceType: transaction.referenceType,
      notes: transaction.notes,
      createdAt: transaction.createdAt,
      createdBy: transaction.createdBy,
    });
  }
}
