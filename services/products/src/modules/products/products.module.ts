import { Module } from '@nestjs/common';
import { ApiClientService } from 'nest-shared/api-clients/api-client.service';
import { DrizzleService } from 'src/db/drizzle.service';
import { ProductsConsumers } from './products-consumers';
import { ProductsPublishers } from './products-publishers';
import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';

@Module({
  imports: [],
  controllers: [ProductsController],
  providers: [
    ProductsService,
    DrizzleService,
    ApiClientService,
    ProductsPublishers,
    ProductsConsumers,
  ],
  exports: [ProductsService, ProductsPublishers, ProductsConsumers],
})
export class ProductsModule {}
