import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';
import { ApiClientService } from 'nest-shared/api-clients/api-client.service';
import { AppConfigModule } from '../../app-config';

@Module({
  imports: [HttpModule, AppConfigModule],
  controllers: [ProductsController],
  providers: [ProductsService, ApiClientService],
  exports: [ProductsService],
})
export class ProductsModule {}
