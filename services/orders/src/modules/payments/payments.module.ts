import { Module } from '@nestjs/common';
import { DrizzleService } from '../../db/drizzle.service';
import { OrdersPublishers } from '../orders/orders-publishers';
import { PaymentsController } from './payments.controller';
import { PaymentsService } from './payments.service';

@Module({
  imports: [],
  controllers: [PaymentsController],
  providers: [PaymentsService, DrizzleService, OrdersPublishers],
  exports: [PaymentsService],
})
export class PaymentsModule {}
