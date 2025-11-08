import { Injectable, Logger } from '@nestjs/common';
import { Exchange, RabbitMQService, RoutingKey } from 'nest-shared/rabbitmq';
import {
  OrderCreatedEvent,
  OrderUpdatedEvent,
  OrderCancelledEvent,
  OrderConfirmedEvent,
  OrderShippedEvent,
  OrderDeliveredEvent,
  PaymentProcessedEvent,
} from 'nest-shared/events';

@Injectable()
export class OrdersPublishers {
  private readonly logger = new Logger(OrdersPublishers.name);

  constructor(private readonly rabbitMQService: RabbitMQService) {}

  async publishOrderCreated(event: OrderCreatedEvent): Promise<void> {
    try {
      await this.rabbitMQService.publish(
        Exchange.EVENTS,
        RoutingKey.ORDER_CREATED,
        event.data,
      );
      this.logger.log(`Published order created event: ${event.data.id}`);
    } catch (error) {
      this.logger.error(
        `Failed to publish order created event: ${error.message}`,
        error.stack,
      );
    }
  }

  async publishOrderUpdated(event: OrderUpdatedEvent): Promise<void> {
    try {
      await this.rabbitMQService.publish(
        Exchange.EVENTS,
        RoutingKey.ORDER_UPDATED,
        event.data,
      );
      this.logger.log(`Published order updated event: ${event.data.id}`);
    } catch (error) {
      this.logger.error(
        `Failed to publish order updated event: ${error.message}`,
        error.stack,
      );
    }
  }

  async publishOrderCancelled(event: OrderCancelledEvent): Promise<void> {
    try {
      await this.rabbitMQService.publish(
        Exchange.EVENTS,
        RoutingKey.ORDER_CANCELLED,
        event.data,
      );
      this.logger.log(`Published order cancelled event: ${event.data.id}`);
    } catch (error) {
      this.logger.error(
        `Failed to publish order cancelled event: ${error.message}`,
        error.stack,
      );
    }
  }

  async publishOrderConfirmed(event: OrderConfirmedEvent): Promise<void> {
    try {
      await this.rabbitMQService.publish(
        Exchange.EVENTS,
        RoutingKey.ORDER_CONFIRMED,
        event.data,
      );
      this.logger.log(`Published order confirmed event: ${event.data.id}`);
    } catch (error) {
      this.logger.error(
        `Failed to publish order confirmed event: ${error.message}`,
        error.stack,
      );
    }
  }

  async publishOrderShipped(event: OrderShippedEvent): Promise<void> {
    try {
      await this.rabbitMQService.publish(
        Exchange.EVENTS,
        RoutingKey.ORDER_SHIPPED,
        event.data,
      );
      this.logger.log(`Published order shipped event: ${event.data.id}`);
    } catch (error) {
      this.logger.error(
        `Failed to publish order shipped event: ${error.message}`,
        error.stack,
      );
    }
  }

  async publishOrderDelivered(event: OrderDeliveredEvent): Promise<void> {
    try {
      await this.rabbitMQService.publish(
        Exchange.EVENTS,
        RoutingKey.ORDER_DELIVERED,
        event.data,
      );
      this.logger.log(`Published order delivered event: ${event.data.id}`);
    } catch (error) {
      this.logger.error(
        `Failed to publish order delivered event: ${error.message}`,
        error.stack,
      );
    }
  }

  async publishPaymentProcessed(event: PaymentProcessedEvent): Promise<void> {
    try {
      await this.rabbitMQService.publish(
        Exchange.EVENTS,
        RoutingKey.ORDER_PAYMENT_PROCESSED,
        event.data,
      );
      this.logger.log(
        `Published payment processed event: ${event.data.paymentId}`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to publish payment processed event: ${error.message}`,
        error.stack,
      );
    }
  }
}
