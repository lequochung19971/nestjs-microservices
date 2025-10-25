import { Module, OnApplicationBootstrap } from '@nestjs/common';
import { DrizzleModule } from '../../db/drizzle.module';
import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';
import { DrizzleService } from 'src/db/drizzle.service';
import { ApiClientService } from 'nest-shared/api-clients/api-client.service';
import { ProductsPublishers } from './products-publishers';
import { ProductsConsumers } from './products-consumers';

@Module({
  imports: [DrizzleModule],
  controllers: [ProductsController],
  providers: [
    ProductsService,
    DrizzleService,
    ApiClientService,
    ProductsPublishers,
    ProductsConsumers,
  ],
  exports: [ProductsService],
})
export class ProductsModule {}
