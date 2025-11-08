import { Module } from '@nestjs/common';
import { ApiClientService } from 'nest-shared/api-clients/api-client.service';
import { DrizzleService } from '../../db/drizzle.service';
import { OrdersConsumers } from './orders-consumers';
import { OrdersPublishers } from './orders-publishers';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';

@Module({
  imports: [],
  controllers: [OrdersController],
  providers: [
    OrdersService,
    DrizzleService,
    ApiClientService,
    OrdersPublishers,
    OrdersConsumers,
  ],
  exports: [OrdersService, OrdersPublishers, OrdersConsumers],
})
export class OrdersModule {}
