import { Injectable, Logger } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import {
  OrderCreatedEvent,
  OrderCancelledEvent,
  OrderShippedEvent,
} from 'nest-shared/events';
import { ReservationStatus, TransactionType } from 'nest-shared/contracts';
import { DrizzleService } from '../../db/drizzle.service';
import { inventoryReservations } from '../../db/schema';
import { InventoryItemsService } from './inventory-items.service';
import { InventoryReservationsService } from './inventory-reservations.service';
import { InventoryTransactionsService } from './inventory-transactions.service';
import { InventoryPublishers } from './inventory-publishers';

@Injectable()
export class InventoryOrderHandlerService {
  private readonly logger = new Logger(InventoryOrderHandlerService.name);

  constructor(
    private readonly drizzle: DrizzleService,
    private readonly inventoryItemsService: InventoryItemsService,
    private readonly inventoryReservationsService: InventoryReservationsService,
    private readonly inventoryTransactionsService: InventoryTransactionsService,
    private readonly inventoryPublishers: InventoryPublishers,
  ) {}

  /**
   * Handle order created event - reserve inventory for all order items
   */
  async handleOrderCreated(event: OrderCreatedEvent): Promise<void> {
    const { id: orderId, items } = event.data;

    this.logger.log(
      `Processing order created event for order: ${orderId} with ${items.length} items`,
    );

    // Set reservation expiry to 24 hours from now
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24);

    for (const item of items) {
      try {
        // Find inventory items for this product
        const inventoryItems = await this.inventoryItemsService.findByProduct(
          item.productId,
        );

        if (inventoryItems.length === 0) {
          this.logger.warn(
            `No inventory items found for product: ${item.productId}`,
          );
          await this.inventoryPublishers.publishInventoryReservationFailed({
            orderId,
            productId: item.productId,
            reason: 'No inventory items found for product',
          });
          continue;
        }

        // Filter for available inventory items with sufficient stock
        const availableItems = inventoryItems.filter((invItem) => {
          const availableQuantity = invItem.quantity - invItem.reservedQuantity;
          return (
            invItem.status === 'AVAILABLE' && availableQuantity >= item.quantity
          );
        });

        if (availableItems.length === 0) {
          this.logger.warn(
            `Insufficient inventory for product: ${item.productId}, required: ${item.quantity}`,
          );
          await this.inventoryPublishers.publishInventoryReservationFailed({
            orderId,
            productId: item.productId,
            reason: `Insufficient inventory. Required: ${item.quantity}`,
          });
          continue;
        }

        // Select the inventory item with the highest available quantity
        const selectedItem = availableItems.sort((a, b) => {
          const availableA = a.quantity - a.reservedQuantity;
          const availableB = b.quantity - b.reservedQuantity;
          return availableB - availableA;
        })[0];

        this.logger.log(
          `Selected inventory item: ${selectedItem.id} for product: ${item.productId}`,
        );

        // Create reservation
        const reservation = await this.inventoryReservationsService.create({
          inventoryItemId: selectedItem.id,
          quantity: item.quantity,
          orderId,
          expiresAt,
        });

        this.logger.log(
          `Created reservation: ${reservation.id} for order: ${orderId}`,
        );

        // Publish success event
        await this.inventoryPublishers.publishInventoryReserved({
          reservationId: reservation.id,
          inventoryItemId: selectedItem.id,
          orderId,
          productId: item.productId,
          quantity: item.quantity,
          expiresAt: expiresAt.toISOString(),
        });
      } catch (error) {
        this.logger.error(
          `Failed to reserve inventory for product ${item.productId} in order ${orderId}: ${error.message}`,
          error.stack,
        );
        await this.inventoryPublishers.publishInventoryReservationFailed({
          orderId,
          productId: item.productId,
          reason: `Failed to create reservation: ${error.message}`,
        });
      }
    }

    this.logger.log(`Completed processing order created event for: ${orderId}`);
  }

  /**
   * Handle order cancelled event - release all reservations
   */
  async handleOrderCancelled(event: OrderCancelledEvent): Promise<void> {
    const { id: orderId, reason } = event.data;

    this.logger.log(`Processing order cancelled event for order: ${orderId}`);

    try {
      // Find all active reservations for this order
      const reservations =
        await this.drizzle.client.query.inventoryReservations.findMany({
          where: eq(inventoryReservations.orderId, orderId),
        });

      const activeReservations = reservations.filter(
        (r) => r.status === ReservationStatus.ACTIVE,
      );

      this.logger.log(
        `Found ${activeReservations.length} active reservations for order: ${orderId}`,
      );

      for (const reservation of activeReservations) {
        try {
          // Cancel the reservation
          await this.inventoryReservationsService.cancel(reservation.id, {
            reason: reason || 'Order cancelled',
          });

          this.logger.log(`Cancelled reservation: ${reservation.id}`);

          // Publish released event
          await this.inventoryPublishers.publishInventoryReleased({
            reservationId: reservation.id,
            inventoryItemId: reservation.inventoryItemId,
            orderId,
            quantity: reservation.quantity,
            reason: reason || 'Order cancelled',
          });
        } catch (error) {
          this.logger.error(
            `Failed to cancel reservation ${reservation.id} for order ${orderId}: ${error.message}`,
            error.stack,
          );
        }
      }

      this.logger.log(
        `Completed processing order cancelled event for: ${orderId}`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to handle order cancelled event for order ${orderId}: ${error.message}`,
        error.stack,
      );
    }
  }

  /**
   * Handle order shipped event - fulfill reservations and create transactions
   */
  async handleOrderShipped(event: OrderShippedEvent): Promise<void> {
    const { id: orderId } = event.data;

    this.logger.log(`Processing order shipped event for order: ${orderId}`);

    try {
      // Find all active reservations for this order
      const reservations =
        await this.drizzle.client.query.inventoryReservations.findMany({
          where: eq(inventoryReservations.orderId, orderId),
        });

      const activeReservations = reservations.filter(
        (r) => r.status === ReservationStatus.ACTIVE,
      );

      this.logger.log(
        `Found ${activeReservations.length} active reservations to fulfill for order: ${orderId}`,
      );

      for (const reservation of activeReservations) {
        try {
          // Fulfill the reservation (this deducts from both quantity and reservedQuantity)
          await this.inventoryReservationsService.fulfill(reservation.id, {});

          this.logger.log(
            `Fulfilled reservation: ${reservation.id} for order: ${orderId}`,
          );

          // Create a SALE transaction for tracking
          await this.inventoryTransactionsService.create({
            inventoryItemId: reservation.inventoryItemId,
            quantity: reservation.quantity,
            type: TransactionType.SALE,
            referenceId: orderId,
            referenceType: 'ORDER',
            notes: `Order ${orderId} shipped`,
          });

          this.logger.log(
            `Created SALE transaction for inventory item: ${reservation.inventoryItemId}`,
          );
        } catch (error) {
          this.logger.error(
            `Failed to fulfill reservation ${reservation.id} for order ${orderId}: ${error.message}`,
            error.stack,
          );
        }
      }

      this.logger.log(
        `Completed processing order shipped event for: ${orderId}`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to handle order shipped event for order ${orderId}: ${error.message}`,
        error.stack,
      );
    }
  }
}
