import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { and, desc, eq, gte, lte, sql } from 'drizzle-orm';
import {
  BaseQueryResponse,
  CancelReservationDto,
  CreateInventoryReservationDto,
  FulfillReservationDto,
  InventoryReservationDto,
  QueryInventoryReservationRequest,
  ReservationStatus,
  UpdateInventoryReservationDto,
} from 'nest-shared/contracts';
import { DrizzleService } from '../../db/drizzle.service';
import { inventoryItems, inventoryReservations } from '../../db/schema';

@Injectable()
export class InventoryReservationsService {
  private readonly logger = new Logger(InventoryReservationsService.name);

  constructor(private readonly drizzle: DrizzleService) {}

  async create(
    dto: CreateInventoryReservationDto,
  ): Promise<InventoryReservationDto> {
    try {
      // Validate inventory item exists and has sufficient stock
      await this.validateInventoryItem(dto.inventoryItemId, dto.quantity);

      const [newReservation] = await this.drizzle.client
        .insert(inventoryReservations)
        .values({
          inventoryItemId: dto.inventoryItemId,
          quantity: dto.quantity,
          orderId: dto.orderId,
          expiresAt: dto.expiresAt,
          status: ReservationStatus.ACTIVE,
        })
        .returning();

      // Update reserved quantity in inventory item
      await this.updateReservedQuantity(
        dto.inventoryItemId,
        dto.quantity,
        'add',
      );

      this.logger.log(`Created inventory reservation: ${newReservation.id}`);

      return this.transformToInventoryReservationDto(newReservation);
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      this.logger.error(
        `Failed to create inventory reservation: ${error.message}`,
        error.stack,
      );
      throw new BadRequestException(
        `Failed to create inventory reservation: ${error.message}`,
      );
    }
  }

  async findAll(
    query: QueryInventoryReservationRequest,
  ): Promise<BaseQueryResponse<InventoryReservationDto>> {
    try {
      const {
        page = 1,
        limit = 20,
        inventoryItemId,
        orderId,
        status,
        expired,
        sortField = 'createdAt',
        sortOrder = 'desc',
      } = query;

      const offset = (page - 1) * limit;

      // Build where conditions
      const whereConditions = [];

      if (inventoryItemId) {
        whereConditions.push(
          eq(inventoryReservations.inventoryItemId, inventoryItemId),
        );
      }

      if (orderId) {
        whereConditions.push(eq(inventoryReservations.orderId, orderId));
      }

      if (status) {
        whereConditions.push(eq(inventoryReservations.status, status));
      }

      if (expired) {
        whereConditions.push(
          and(
            eq(inventoryReservations.status, ReservationStatus.ACTIVE),
            lte(inventoryReservations.expiresAt, new Date()),
          ),
        );
      }

      const whereClause =
        whereConditions.length > 0 ? and(...whereConditions) : undefined;

      // Build order clause
      let orderClause;
      switch (sortField) {
        case 'quantity':
          orderClause =
            sortOrder === 'asc'
              ? inventoryReservations.quantity
              : desc(inventoryReservations.quantity);
          break;
        case 'status':
          orderClause =
            sortOrder === 'asc'
              ? inventoryReservations.status
              : desc(inventoryReservations.status);
          break;
        case 'expiresAt':
          orderClause =
            sortOrder === 'asc'
              ? inventoryReservations.expiresAt
              : desc(inventoryReservations.expiresAt);
          break;
        default: // createdAt
          orderClause =
            sortOrder === 'asc'
              ? inventoryReservations.createdAt
              : desc(inventoryReservations.createdAt);
      }

      // Get reservations
      const items =
        await this.drizzle.client.query.inventoryReservations.findMany({
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
        .from(inventoryReservations)
        .where(whereClause);

      const total = Number(countResult[0].count) || 0;
      const totalPages = Math.ceil(total / limit);

      // Transform to DTOs
      const reservationDtos = items.map((item) =>
        this.transformToInventoryReservationDto(item),
      );

      return BaseQueryResponse.create({
        data: reservationDtos,
        page,
        limit,
        totalCount: total,
      });
    } catch (error) {
      this.logger.error(
        `Failed to find inventory reservations: ${error.message}`,
        error.stack,
      );
      throw new BadRequestException(
        `Failed to list inventory reservations: ${error.message}`,
      );
    }
  }

  async findOne(id: string): Promise<InventoryReservationDto> {
    try {
      const reservation =
        await this.drizzle.client.query.inventoryReservations.findFirst({
          where: eq(inventoryReservations.id, id),
          with: {
            inventoryItem: {
              with: {
                warehouse: true,
              },
            },
          },
        });

      if (!reservation) {
        throw new NotFoundException(
          `Inventory reservation with ID ${id} not found`,
        );
      }

      return this.transformToInventoryReservationDto(reservation);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(
        `Failed to find inventory reservation ${id}: ${error.message}`,
        error.stack,
      );
      throw new BadRequestException(
        `Failed to get inventory reservation: ${error.message}`,
      );
    }
  }

  async update(
    id: string,
    dto: UpdateInventoryReservationDto,
  ): Promise<InventoryReservationDto> {
    try {
      const existingReservation = await this.findOne(id);

      if (existingReservation.status !== ReservationStatus.ACTIVE) {
        throw new BadRequestException(
          `Cannot update reservation with status ${existingReservation.status}`,
        );
      }

      // If quantity is being changed, validate and update reserved quantity
      if (dto.quantity && dto.quantity !== existingReservation.quantity) {
        await this.validateInventoryItem(
          existingReservation.inventoryItemId,
          dto.quantity,
        );

        const quantityDifference = dto.quantity - existingReservation.quantity;
        await this.updateReservedQuantity(
          existingReservation.inventoryItemId,
          Math.abs(quantityDifference),
          quantityDifference > 0 ? 'add' : 'subtract',
        );
      }

      await this.drizzle.client
        .update(inventoryReservations)
        .set({
          ...(dto.quantity && { quantity: dto.quantity }),
          ...(dto.expiresAt && { expiresAt: dto.expiresAt }),
          updatedAt: new Date(),
        })
        .where(eq(inventoryReservations.id, id));

      this.logger.log(`Updated inventory reservation: ${id}`);

      return this.findOne(id);
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      this.logger.error(
        `Failed to update inventory reservation ${id}: ${error.message}`,
        error.stack,
      );
      throw new BadRequestException(
        `Failed to update inventory reservation: ${error.message}`,
      );
    }
  }

  async fulfill(
    id: string,
    dto: FulfillReservationDto,
  ): Promise<InventoryReservationDto> {
    try {
      const reservation = await this.findOne(id);

      if (reservation.status !== ReservationStatus.ACTIVE) {
        throw new BadRequestException(
          `Cannot fulfill reservation with status ${reservation.status}`,
        );
      }

      // Check if reservation has expired
      if (reservation.expiresAt && reservation.expiresAt < new Date()) {
        throw new BadRequestException('Cannot fulfill expired reservation');
      }

      await this.drizzle.client.transaction(async (tx) => {
        // Update reservation status
        await tx
          .update(inventoryReservations)
          .set({
            status: ReservationStatus.FULFILLED,
            updatedAt: new Date(),
          })
          .where(eq(inventoryReservations.id, id));

        // Update inventory item quantities
        await tx
          .update(inventoryItems)
          .set({
            quantity: sql`${inventoryItems.quantity} - ${reservation.quantity}`,
            reservedQuantity: sql`${inventoryItems.reservedQuantity} - ${reservation.quantity}`,
            updatedAt: new Date(),
          })
          .where(eq(inventoryItems.id, reservation.inventoryItemId));
      });

      this.logger.log(`Fulfilled inventory reservation: ${id}`);

      return this.findOne(id);
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      this.logger.error(
        `Failed to fulfill inventory reservation ${id}: ${error.message}`,
        error.stack,
      );
      throw new BadRequestException(
        `Failed to fulfill inventory reservation: ${error.message}`,
      );
    }
  }

  async cancel(
    id: string,
    dto: CancelReservationDto,
  ): Promise<InventoryReservationDto> {
    try {
      const reservation = await this.findOne(id);

      if (reservation.status !== ReservationStatus.ACTIVE) {
        throw new BadRequestException(
          `Cannot cancel reservation with status ${reservation.status}`,
        );
      }

      await this.drizzle.client.transaction(async (tx) => {
        // Update reservation status
        await tx
          .update(inventoryReservations)
          .set({
            status: ReservationStatus.CANCELLED,
            updatedAt: new Date(),
          })
          .where(eq(inventoryReservations.id, id));

        // Update reserved quantity in inventory item
        await tx
          .update(inventoryItems)
          .set({
            reservedQuantity: sql`${inventoryItems.reservedQuantity} - ${reservation.quantity}`,
            updatedAt: new Date(),
          })
          .where(eq(inventoryItems.id, reservation.inventoryItemId));
      });

      this.logger.log(`Cancelled inventory reservation: ${id}`);

      return this.findOne(id);
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      this.logger.error(
        `Failed to cancel inventory reservation ${id}: ${error.message}`,
        error.stack,
      );
      throw new BadRequestException(
        `Failed to cancel inventory reservation: ${error.message}`,
      );
    }
  }

  async remove(id: string): Promise<InventoryReservationDto> {
    try {
      const reservation = await this.findOne(id);

      await this.drizzle.client
        .delete(inventoryReservations)
        .where(eq(inventoryReservations.id, id));

      this.logger.log(`Deleted inventory reservation: ${id}`);

      return reservation;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(
        `Failed to delete inventory reservation ${id}: ${error.message}`,
        error.stack,
      );
      throw new BadRequestException(
        `Failed to delete inventory reservation: ${error.message}`,
      );
    }
  }

  async processExpiredReservations(): Promise<number> {
    try {
      const expiredReservations =
        await this.drizzle.client.query.inventoryReservations.findMany({
          where: and(
            eq(inventoryReservations.status, ReservationStatus.ACTIVE),
            lte(inventoryReservations.expiresAt, new Date()),
          ),
        });

      let processedCount = 0;

      for (const reservation of expiredReservations) {
        try {
          await this.cancel(reservation.id, { reason: 'Reservation expired' });
          processedCount++;
        } catch (error) {
          this.logger.error(
            `Failed to process expired reservation ${reservation.id}: ${error.message}`,
          );
        }
      }

      this.logger.log(`Processed ${processedCount} expired reservations`);

      return processedCount;
    } catch (error) {
      this.logger.error(
        `Failed to process expired reservations: ${error.message}`,
        error.stack,
      );
      throw new BadRequestException(
        `Failed to process expired reservations: ${error.message}`,
      );
    }
  }

  private async validateInventoryItem(
    inventoryItemId: string,
    requiredQuantity: number,
  ): Promise<void> {
    const inventoryItem =
      await this.drizzle.client.query.inventoryItems.findFirst({
        where: eq(inventoryItems.id, inventoryItemId),
      });

    if (!inventoryItem) {
      throw new NotFoundException(
        `Inventory item with ID ${inventoryItemId} not found`,
      );
    }

    const availableQuantity =
      inventoryItem.quantity - inventoryItem.reservedQuantity;

    if (availableQuantity < requiredQuantity) {
      throw new BadRequestException(
        `Insufficient available stock. Required: ${requiredQuantity}, Available: ${availableQuantity}`,
      );
    }
  }

  private async updateReservedQuantity(
    inventoryItemId: string,
    quantity: number,
    operation: 'add' | 'subtract',
  ): Promise<void> {
    const operator = operation === 'add' ? '+' : '-';

    await this.drizzle.client
      .update(inventoryItems)
      .set({
        reservedQuantity: sql`${inventoryItems.reservedQuantity} ${operator} ${quantity}`,
        updatedAt: new Date(),
      })
      .where(eq(inventoryItems.id, inventoryItemId));
  }

  private transformToInventoryReservationDto(
    reservation: any,
  ): InventoryReservationDto {
    return new InventoryReservationDto({
      id: reservation.id,
      inventoryItemId: reservation.inventoryItemId,
      quantity: reservation.quantity,
      orderId: reservation.orderId,
      expiresAt: reservation.expiresAt,
      status: reservation.status,
      createdAt: reservation.createdAt,
      updatedAt: reservation.updatedAt,
    });
  }
}
