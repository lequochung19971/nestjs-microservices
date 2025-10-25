export const RABBITMQ_CONNECTION = 'RABBITMQ_CONNECTION';
export const RABBITMQ_MODULE_OPTIONS = 'RABBITMQ_MODULE_OPTIONS';

export enum Exchange {
  EVENTS = 'events',
  COMMANDS = 'commands',
}

export enum RoutingKey {
  // Define your routing keys here, for example:
  USER_CREATED = 'user.created',
  USER_UPDATED = 'user.updated',
  USER_DELETED = 'user.deleted',
  PRODUCT_CREATED = 'product.created',
  PRODUCT_UPDATED = 'product.updated',
  PRODUCT_DELETED = 'product.deleted',
  MEDIA_DELETED = 'media.deleted',
  MEDIA_UPDATED = 'media.updated',
}

export interface RabbitMQModuleOptions {
  uri: string;
  connectionInitOptions?: any;
}
