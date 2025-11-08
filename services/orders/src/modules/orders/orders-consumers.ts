import { Injectable, Logger } from '@nestjs/common';
import { Exchange, RoutingKey, Subscribe } from 'nest-shared/rabbitmq';
import { OrdersService } from './orders.service';
import { ProductUpdatedEvent } from 'nest-shared/events';

@Injectable()
export class OrdersConsumers {
  private readonly logger = new Logger(OrdersConsumers.name);

  constructor(private readonly ordersService: OrdersService) {}

  @Subscribe({
    exchange: Exchange.EVENTS,
    routingKey: RoutingKey.PRODUCT_UPDATED,
  })
  async handleProductUpdated(data: ProductUpdatedEvent): Promise<void> {
    try {
      this.logger.log(`Received product updated event: ${data.id}`);
      // Update product information in order_products table if needed
      await this.ordersService.handleProductUpdated(data);
    } catch (error) {
      this.logger.error(
        `Failed to handle product updated event: ${error.message}`,
        error.stack,
      );
    }
  }

  @Subscribe({
    exchange: Exchange.EVENTS,
    routingKey: RoutingKey.INVENTORY_RESERVED,
  })
  async handleInventoryReserved(data: any): Promise<void> {
    try {
      this.logger.log(`Received inventory reserved event: ${data.orderId}`);
      // Update order with inventory reservation information
      await this.ordersService.handleInventoryReserved(data);
    } catch (error) {
      this.logger.error(
        `Failed to handle inventory reserved event: ${error.message}`,
        error.stack,
      );
    }
  }

  @Subscribe({
    exchange: Exchange.EVENTS,
    routingKey: RoutingKey.INVENTORY_RESERVATION_FAILED,
  })
  async handleInventoryReservationFailed(data: any): Promise<void> {
    try {
      this.logger.log(
        `Received inventory reservation failed event: ${data.orderId}`,
      );
      // Handle inventory reservation failure
      await this.ordersService.handleInventoryReservationFailed(data);
    } catch (error) {
      this.logger.error(
        `Failed to handle inventory reservation failed event: ${error.message}`,
        error.stack,
      );
    }
  }
}
