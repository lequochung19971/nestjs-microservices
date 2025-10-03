import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { CategoriesController } from './categories.controller';
import { CategoriesService } from './categories.service';
import { ProxyService } from '../../services/proxy.service';
import { AppConfigModule } from '../../app-config';

@Module({
  imports: [HttpModule, AppConfigModule],
  controllers: [CategoriesController],
  providers: [CategoriesService, ProxyService],
  exports: [CategoriesService],
})
export class CategoriesModule {}
