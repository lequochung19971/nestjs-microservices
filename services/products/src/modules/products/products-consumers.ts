import { Injectable, Logger, OnModuleInit, Scope } from '@nestjs/common';
import {
  BaseMessagingService,
  RabbitMQService,
  Exchange,
  RoutingKey,
  Subscribe,
} from 'nest-shared/rabbitmq';
import { UpdateMediaEvent } from 'nest-shared/events';
import { ProductsService } from './products.service';

@Injectable()
export class ProductsConsumers extends BaseMessagingService {
  protected readonly logger = new Logger(ProductsConsumers.name);

  constructor(
    rabbitMQService: RabbitMQService,
    private readonly productsService: ProductsService,
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
   * Handle media events (example of cross-service communication)
   */
  @Subscribe({
    exchange: Exchange.EVENTS,
    routingKey: RoutingKey.MEDIA_UPDATED,
  })
  async handleMediaUpdated(message: UpdateMediaEvent) {
    this.logger.log(`Media updated event received: ${message.id}`);
    await this.productsService.updateProductMedia({
      id: message.id,
      originalFilename: message.originalFilename,
      mimeType: message.mimeType,
      size: message.size,
      type: message.type,
      url: message.url,
    });
  }

  @Subscribe({
    exchange: Exchange.EVENTS,
    routingKey: RoutingKey.MEDIA_DELETED,
  })
  async handleMediaDeleted(mediaId: string) {
    this.logger.log(`Media deleted event received: ${mediaId}`);
    await this.productsService.removeProductMedia(mediaId);
  }
}
