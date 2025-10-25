import {
  Inject,
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import * as amqp from 'amqplib';
import { Exchange, RABBITMQ_CONNECTION } from './rabbitmq.constants';

@Injectable()
export class RabbitMQService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(RabbitMQService.name);
  private _channel: amqp.Channel;

  constructor(
    @Inject(RABBITMQ_CONNECTION)
    private readonly connection: amqp.ChannelModel,
  ) {}

  async onModuleInit() {
    try {
      this._channel = await this.connection.createChannel();

      // Set up exchanges
      await this._channel.assertExchange(Exchange.EVENTS, 'topic', {
        durable: true,
      });
      await this._channel.assertExchange(Exchange.COMMANDS, 'direct', {
        durable: true,
      });

      this.logger.log('RabbitMQ connections and exchanges initialized');
    } catch (error) {
      this.logger.error('Failed to initialize RabbitMQ', error);
      throw error;
    }
  }

  get channel(): amqp.Channel {
    return this._channel;
  }

  async onModuleDestroy() {
    try {
      await this._channel?.close();
      await this.connection?.close();
      this.logger.log('RabbitMQ connections closed');
    } catch (error) {
      this.logger.error('Error closing RabbitMQ connections', error);
    }
  }

  publish<T = any>(exchange: Exchange, routingKey: string, message: T) {
    try {
      const buffer = Buffer.from(JSON.stringify(message));
      this._channel.publish(exchange, routingKey, buffer, {
        persistent: true,
        contentType: 'application/json',
      });
      this.logger.debug(`Message published to ${exchange}:${routingKey}`);
    } catch (error) {
      this.logger.error(
        `Failed to publish message to ${exchange}:${routingKey}`,
        error,
      );
      throw error;
    }
  }

  async subscribe<T = any>({
    callback,
    exchange,
    queue: queueProp = '',
    routingKey,
    options,
  }: {
    exchange: Exchange;
    routingKey: string | string[];
    queue?: string;
    callback: (
      message: T,
      originalMessage?: amqp.ConsumeMessage,
    ) => Promise<void>;
    options?: {
      durable?: boolean;
      autoDelete?: boolean;
      exclusive?: boolean;
    };
  }): Promise<string> {
    let queue: string;
    try {
      const {
        durable = true,
        autoDelete = false,
        exclusive = false,
      } = options ?? {};

      // Assert queue
      const res = await this._channel.assertQueue(queueProp, {
        durable,
        autoDelete,
        exclusive,
      });
      queue = res.queue;

      // Bind queue to exchange with routing key(s)
      if (Array.isArray(routingKey)) {
        for (const key of routingKey) {
          await this._channel.bindQueue(queue, exchange, key);
        }
      } else {
        await this._channel.bindQueue(queue, exchange, routingKey);
      }

      // Consume messages
      const { consumerTag } = await this._channel.consume(
        queue,
        async (message) => {
          if (!message) return;

          try {
            const content = JSON.parse(message.content.toString());
            await callback(content, message);
            this._channel.ack(message);
          } catch (error) {
            this.logger.error(`Error processing message from ${queue}`, error);
            this._channel.nack(message, false, false);
          }
        },
      );

      this.logger.log(
        `Subscribed to ${exchange}:${Array.isArray(routingKey) ? routingKey.join(', ') : routingKey} on queue ${queue}`,
      );
      return consumerTag;
    } catch (error) {
      this.logger.error(
        `Failed to subscribe to ${exchange}:${Array.isArray(routingKey) ? routingKey.join(', ') : routingKey} on queue ${queue}`,
        error,
      );
      throw error;
    }
  }

  async cancelSubscription(consumerTag: string): Promise<void> {
    try {
      await this._channel.cancel(consumerTag);
      this.logger.log(`Subscription ${consumerTag} cancelled`);
    } catch (error) {
      this.logger.error(`Failed to cancel subscription ${consumerTag}`, error);
      throw error;
    }
  }
}
