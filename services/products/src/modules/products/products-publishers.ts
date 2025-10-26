import { Injectable, Logger } from '@nestjs/common';
import {
  BaseMessagingService,
  Exchange,
  RabbitMQService,
  RoutingKey,
} from 'nest-shared/rabbitmq';
import {
  ProductCreatedEvent,
  ProductDeletedEvent,
  ProductUpdatedEvent,
} from 'nest-shared/events';

@Injectable()
export class ProductsPublishers extends BaseMessagingService {
  protected readonly logger = new Logger(ProductsPublishers.name);

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
   * Publish an event when a product is created
   */
  publishProductCreated(productData: ProductCreatedEvent) {
    try {
      this.rabbitMQService.publish(
        Exchange.EVENTS,
        RoutingKey.PRODUCT_CREATED,
        productData,
      );

      this.logger.log(
        `Product created event published for product ID: ${productData.id}`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to publish product created event for product ID: ${productData.id}`,
        error,
      );
      throw error;
    }
  }

  /**
   * Publish an event when a product is updated
   */
  publishProductUpdated(productData: ProductUpdatedEvent) {
    try {
      this.rabbitMQService.publish(
        Exchange.EVENTS,
        RoutingKey.PRODUCT_UPDATED,
        productData,
      );

      this.logger.log(
        `Product updated event published for product ID: ${productData.id}`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to publish product updated event for product ID: ${productData.id}`,
        error,
      );
      throw error;
    }
  }

  /**
   * Publish an event when a product is deleted
   */
  publishProductDeleted(productData: ProductDeletedEvent) {
    try {
      this.rabbitMQService.publish(
        Exchange.EVENTS,
        RoutingKey.PRODUCT_DELETED,
        productData,
      );

      this.logger.log(
        `Product deleted event published for product ID: ${productData.id}`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to publish product deleted event for product ID: ${productData.id}`,
        error,
      );
      throw error;
    }
  }
}
