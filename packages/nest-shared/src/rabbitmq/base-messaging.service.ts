import { Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { MetadataScanner, Reflector } from '@nestjs/core';
import { RabbitMQService } from './rabbitmq.service';
import {
  SUBSCRIBE_METADATA_KEY,
  SubscribeOptions,
} from './subscribe.decorator';

export abstract class BaseMessagingService
  implements OnModuleInit, OnModuleDestroy
{
  protected readonly logger = new Logger(BaseMessagingService.name);
  private readonly reflector = new Reflector();
  private readonly metadataScanner = new MetadataScanner();
  private consumerTags: string[] = [];

  constructor(protected readonly rabbitMQService: RabbitMQService) {}

  async onModuleInit() {
    try {
      await this.onAssertExchanges();
      await this.setupSubscriptions();
    } catch (error) {
      this.logger.error('Failed to initialize messaging service', error);
      throw error;
    }
  }

  private async setupSubscriptions() {
    const prototype = Object.getPrototypeOf(this);
    const methodNames = this.metadataScanner.getAllMethodNames(prototype);

    for (const methodName of methodNames) {
      const subscribeOptions = this.reflector.get<SubscribeOptions>(
        SUBSCRIBE_METADATA_KEY,
        prototype[methodName],
      );

      if (subscribeOptions) {
        await this.setupMethodSubscription(methodName, subscribeOptions);
      }
    }
  }

  private async setupMethodSubscription(
    methodName: string,
    options: SubscribeOptions,
  ) {
    try {
      const handler = this[methodName].bind(this);

      const consumerTag = await this.rabbitMQService.subscribe({
        exchange: options.exchange,
        routingKey: options.routingKey,
        queue: options.queue,
        callback: handler,
        options: options.queueOptions,
      });

      this.consumerTags.push(consumerTag);

      const routingKeyDisplay = Array.isArray(options.routingKey)
        ? options.routingKey.join(', ')
        : options.routingKey;

      this.logger.log(
        `Subscribed method '${methodName}' to ${options.exchange}:${routingKeyDisplay}`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to setup subscription for method '${methodName}'`,
        error,
      );
      throw error;
    }
  }

  async onModuleDestroy() {
    // Cancel all subscriptions
    for (const consumerTag of this.consumerTags) {
      try {
        await this.rabbitMQService.cancelSubscription(consumerTag);
      } catch (error) {
        this.logger.warn(`Failed to cancel subscription ${consumerTag}`, error);
      }
    }
    this.consumerTags = [];
  }

  abstract onAssertExchanges(): Promise<void>;
}
