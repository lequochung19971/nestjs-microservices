import { SetMetadata } from '@nestjs/common';
import { Exchange } from './rabbitmq.constants';

export const SUBSCRIBE_METADATA_KEY = 'rabbitmq:subscribe';

export interface SubscribeOptions {
  /** The exchange to subscribe to */
  exchange: Exchange;
  /** The routing key(s) to bind the queue to */
  routingKey: string | string[];
  /** Optional queue name. If not provided, a unique queue will be generated */
  queue?: string;
  /** Queue options */
  queueOptions?: {
    /** Whether the queue should survive server restarts (default: true) */
    durable?: boolean;
    /** Whether the queue should be deleted when there are no consumers (default: false) */
    autoDelete?: boolean;
    /** Whether the queue is exclusive to this connection (default: false) */
    exclusive?: boolean;
  };
}

/**
 * Decorator that marks a method as a RabbitMQ message subscriber.
 * The decorated method will automatically subscribe to messages from the specified exchange and routing key.
 *
 * @param options - Subscription configuration
 *
 * @example
 * ```typescript
 * @Injectable()
 * export class UserService extends BaseMessagingService {
 *
 *   @Subscribe({
 *     exchange: Exchange.EVENTS,
 *     routingKey: RoutingKey.USER_CREATED,
 *     queue: 'user-service.user-created'
 *   })
 *   async handleUserCreated(message: any) {
 *     console.log('User created:', message);
 *   }
 *
 *   @Subscribe({
 *     exchange: Exchange.EVENTS,
 *     routingKey: [RoutingKey.USER_UPDATED, RoutingKey.USER_DELETED]
 *   })
 *   async handleUserEvents(message: any) {
 *     console.log('User event:', message);
 *   }
 * }
 * ```
 */
export const Subscribe = (options: SubscribeOptions): MethodDecorator => {
  return SetMetadata(SUBSCRIBE_METADATA_KEY, options);
};
