import { Module } from '@nestjs/common';
import { DrizzleModule } from '../../db/drizzle.module';
import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';
import { DrizzleService } from 'src/db/drizzle.service';
import { ApiClientService } from 'nest-shared/api-clients/api-client.service';

@Module({
  imports: [DrizzleModule],
  controllers: [ProductsController],
  providers: [ProductsService, DrizzleService, ApiClientService],
  exports: [ProductsService],
})
export class ProductsModule {}
