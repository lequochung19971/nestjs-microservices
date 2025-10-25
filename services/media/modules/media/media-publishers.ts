import { Injectable, Logger } from '@nestjs/common';
import {
  BaseMessagingService,
  Exchange,
  RabbitMQService,
  RoutingKey,
} from 'nest-shared/rabbitmq';
import { UpdateMediaEvent } from 'nest-shared/events';

@Injectable()
export class MediaPublishers extends BaseMessagingService {
  protected readonly logger = new Logger(MediaPublishers.name);

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

  publishMediaUpdated(media: UpdateMediaEvent) {
    this.rabbitMQService.publish(
      Exchange.EVENTS,
      RoutingKey.MEDIA_UPDATED,
      media,
    );
    this.logger.log(`Media updated event published for media ID: ${media.id}`);
  }

  publishMediaDeleted(mediaId: string) {
    this.rabbitMQService.publish(
      Exchange.EVENTS,
      RoutingKey.MEDIA_DELETED,
      mediaId,
    );
    this.logger.log(`Media deleted event published for media ID: ${mediaId}`);
  }
}
