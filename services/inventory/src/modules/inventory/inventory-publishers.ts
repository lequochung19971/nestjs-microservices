import { Injectable, Logger } from '@nestjs/common';
import {
  BaseMessagingService,
  Exchange,
  RabbitMQService,
  RoutingKey,
} from 'nest-shared/rabbitmq';
import {
  InventoryReservedEvent,
  InventoryReleasedEvent,
  InventoryReservationFailedEvent,
  InventoryUpdatedEvent,
  LowStockAlertEvent,
} from 'nest-shared/events';

@Injectable()
export class InventoryPublishers extends BaseMessagingService {
  protected readonly logger = new Logger(InventoryPublishers.name);

  constructor(rabbitMQService: RabbitMQService) {
    super(rabbitMQService);
  }

  async onAssertExchanges() {
    await this.rabbitMQService.channel.assertExchange(
      Exchange.EVENTS,
      'topic',
      {
        durable: true,
      },
    );
  }

  /**
   * Publish an event when inventory is updated
   */
  async publishInventoryUpdated(data: {
    inventoryItemId: string;
    warehouseId: string;
    productId: string;
    quantity: number;
    reservedQuantity: number;
    status: string;
  }) {
    try {
      const event = new InventoryUpdatedEvent({
        inventoryItemId: data.inventoryItemId,
        warehouseId: data.warehouseId,
        productId: data.productId,
        quantity: data.quantity,
        reservedQuantity: data.reservedQuantity,
        status: data.status,
      });

      await this.rabbitMQService.publish(
        Exchange.EVENTS,
        RoutingKey.INVENTORY_UPDATED,
        event,
      );

      this.logger.log(
        `Inventory updated event published for inventory item: ${data.inventoryItemId}`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to publish inventory updated event for inventory item: ${data.inventoryItemId}`,
        error,
      );
      throw error;
    }
  }

  /**
   * Publish an event when stock falls below reorder point
   */
  async publishLowStockAlert(data: {
    inventoryItemId: string;
    warehouseId: string;
    productId: string;
    currentQuantity: number;
    reorderPoint: number;
    reorderQuantity: number;
  }) {
    try {
      const event = new LowStockAlertEvent({
        inventoryItemId: data.inventoryItemId,
        warehouseId: data.warehouseId,
        productId: data.productId,
        currentQuantity: data.currentQuantity,
        reorderPoint: data.reorderPoint,
        reorderQuantity: data.reorderQuantity,
      });

      await this.rabbitMQService.publish(
        Exchange.EVENTS,
        RoutingKey.INVENTORY_LOW_STOCK,
        event,
      );

      this.logger.log(
        `Low stock alert published for inventory item: ${data.inventoryItemId}`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to publish low stock alert for inventory item: ${data.inventoryItemId}`,
        error,
      );
      throw error;
    }
  }

  /**
   * Publish an event when inventory is reserved
   */
  async publishInventoryReserved(data: {
    reservationId: string;
    inventoryItemId: string;
    orderId: string;
    productId: string;
    quantity: number;
    expiresAt?: string;
  }) {
    try {
      const event = new InventoryReservedEvent({
        reservationId: data.reservationId,
        inventoryItemId: data.inventoryItemId,
        orderId: data.orderId,
        productId: data.productId,
        quantity: data.quantity,
        expiresAt: data.expiresAt,
      });

      await this.rabbitMQService.publish(
        Exchange.EVENTS,
        RoutingKey.INVENTORY_RESERVED,
        event,
      );

      this.logger.log(
        `Inventory reserved event published for reservation: ${data.reservationId}`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to publish inventory reserved event for reservation: ${data.reservationId}`,
        error,
      );
      throw error;
    }
  }

  /**
   * Publish an event when inventory reservation is released
   */
  async publishInventoryReleased(data: {
    reservationId: string;
    inventoryItemId: string;
    orderId: string;
    quantity: number;
    reason: string;
  }) {
    try {
      const event = new InventoryReleasedEvent({
        reservationId: data.reservationId,
        inventoryItemId: data.inventoryItemId,
        orderId: data.orderId,
        quantity: data.quantity,
        reason: data.reason,
      });

      await this.rabbitMQService.publish(
        Exchange.EVENTS,
        RoutingKey.INVENTORY_RELEASED,
        event,
      );

      this.logger.log(
        `Inventory released event published for reservation: ${data.reservationId}`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to publish inventory released event for reservation: ${data.reservationId}`,
        error,
      );
      throw error;
    }
  }

  /**
   * Publish an event when inventory reservation fails
   */
  async publishInventoryReservationFailed(data: {
    orderId: string;
    productId: string;
    reason: string;
  }) {
    try {
      const event = new InventoryReservationFailedEvent({
        orderId: data.orderId,
        productId: data.productId,
        reason: data.reason,
      });

      await this.rabbitMQService.publish(
        Exchange.EVENTS,
        RoutingKey.INVENTORY_RESERVATION_FAILED,
        event,
      );

      this.logger.log(
        `Inventory reservation failed event published for order: ${data.orderId}, product: ${data.productId}`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to publish inventory reservation failed event for order: ${data.orderId}`,
        error,
      );
      throw error;
    }
  }
}
