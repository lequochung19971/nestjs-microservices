import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';
import { ApiClientService } from 'nest-shared/api-clients/api-client.service';
import { AppConfigModule } from '../../app-config';

@Module({
  imports: [HttpModule, AppConfigModule],
  controllers: [OrdersController],
  providers: [OrdersService, ApiClientService],
  exports: [OrdersService],
})
export class OrdersModule {}
