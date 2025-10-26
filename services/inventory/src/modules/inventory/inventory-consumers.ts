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
} from 'nest-shared/events';
import { InventoryProductsSyncService } from './inventory-products-sync.service';

@Injectable()
export class InventoryConsumers extends BaseMessagingService {
  protected readonly logger = new Logger(InventoryConsumers.name);

  constructor(
    rabbitMQService: RabbitMQService,
    private readonly inventoryProductsSyncService: InventoryProductsSyncService,
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
}
