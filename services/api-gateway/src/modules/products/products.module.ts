import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';
import { ProxyService } from '../../services/proxy.service';
import { AppConfigModule } from '../../app-config';

@Module({
  imports: [HttpModule, AppConfigModule],
  controllers: [ProductsController],
  providers: [ProductsService, ProxyService],
  exports: [ProductsService],
})
export class ProductsModule {}
