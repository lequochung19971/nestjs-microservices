import { Injectable, Logger } from '@nestjs/common';
import {
  BaseMessagingService,
  Exchange,
  RabbitMQService,
  RoutingKey,
  Subscribe,
} from 'nest-shared/rabbitmq';
import {
  ProductCreatedEvent,
  ProductDeletedEvent,
  ProductUpdatedEvent,
  OrderCreatedEvent,
  OrderCancelledEvent,
  OrderShippedEvent,
} from 'nest-shared/events';
import { InventoryProductsSyncService } from './inventory-products-sync.service';
import { InventoryOrderHandlerService } from './inventory-order-handler.service';

@Injectable()
export class InventoryConsumers extends BaseMessagingService {
  protected readonly logger = new Logger(InventoryConsumers.name);

  constructor(
    rabbitMQService: RabbitMQService,
    private readonly inventoryProductsSyncService: InventoryProductsSyncService,
    private readonly inventoryOrderHandlerService: InventoryOrderHandlerService,
  ) {
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
   * Handle product created events from the Products service
   */
  @Subscribe({
    exchange: Exchange.EVENTS,
    routingKey: RoutingKey.PRODUCT_CREATED,
  })
  async handleProductCreated(message: ProductCreatedEvent) {
    this.logger.log(`Product created event received: ${message.id}`);
    try {
      await this.inventoryProductsSyncService.createInventoryProduct({
        id: message.id,
        name: message.name,
        sku: message.sku,
        isActive: message.isActive,
      });
    } catch (error) {
      this.logger.error(
        `Failed to handle product created event for product ${message.id}: ${error.message}`,
        error,
      );
    }
  }

  /**
   * Handle product updated events from the Products service
   */
  @Subscribe({
    exchange: Exchange.EVENTS,
    routingKey: RoutingKey.PRODUCT_UPDATED,
  })
  async handleProductUpdated(message: ProductUpdatedEvent) {
    this.logger.log(`Product updated event received: ${message.id}`);
    try {
      await this.inventoryProductsSyncService.updateInventoryProduct({
        id: message.id,
        name: message.name,
        sku: message.sku,
        isActive: message.isActive,
      });
    } catch (error) {
      this.logger.error(
        `Failed to handle product updated event for product ${message.id}: ${error.message}`,
        error,
      );
    }
  }

  /**
   * Handle product deleted events from the Products service
   */
  @Subscribe({
    exchange: Exchange.EVENTS,
    routingKey: RoutingKey.PRODUCT_DELETED,
  })
  async handleProductDeleted(message: ProductDeletedEvent) {
    this.logger.log(`Product deleted event received: ${message.id}`);
    try {
      await this.inventoryProductsSyncService.deleteProduct(message.id);
    } catch (error) {
      this.logger.error(
        `Failed to handle product deleted event for product ${message.id}: ${error.message}`,
        error,
      );
    }
  }

  /**
   * Handle order created events from the Orders service
   */
  @Subscribe({
    exchange: Exchange.EVENTS,
    routingKey: RoutingKey.ORDER_CREATED,
  })
  async handleOrderCreated(message: OrderCreatedEvent) {
    this.logger.log(`Order created event received: ${message.data.id}`);
    try {
      await this.inventoryOrderHandlerService.handleOrderCreated(message);
    } catch (error) {
      this.logger.error(
        `Failed to handle order created event for order ${message.data.id}: ${error.message}`,
        error,
      );
    }
  }

  /**
   * Handle order cancelled events from the Orders service
   */
  @Subscribe({
    exchange: Exchange.EVENTS,
    routingKey: RoutingKey.ORDER_CANCELLED,
  })
  async handleOrderCancelled(message: OrderCancelledEvent) {
    this.logger.log(`Order cancelled event received: ${message.data.id}`);
    try {
      await this.inventoryOrderHandlerService.handleOrderCancelled(message);
    } catch (error) {
      this.logger.error(
        `Failed to handle order cancelled event for order ${message.data.id}: ${error.message}`,
        error,
      );
    }
  }

  /**
   * Handle order shipped events from the Orders service
   */
  @Subscribe({
    exchange: Exchange.EVENTS,
    routingKey: RoutingKey.ORDER_SHIPPED,
  })
  async handleOrderShipped(message: OrderShippedEvent) {
    this.logger.log(`Order shipped event received: ${message.data.id}`);
    try {
      await this.inventoryOrderHandlerService.handleOrderShipped(message);
    } catch (error) {
      this.logger.error(
        `Failed to handle order shipped event for order ${message.data.id}: ${error.message}`,
        error,
      );
    }
  }
}
