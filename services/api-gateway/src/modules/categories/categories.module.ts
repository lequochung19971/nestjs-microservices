import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { CategoriesController } from './categories.controller';
import { CategoriesService } from './categories.service';
import { ApiClientService } from 'nest-shared/api-clients/api-client.service';
import { AppConfigModule } from '../../app-config';

@Module({
  imports: [HttpModule, AppConfigModule],
  controllers: [CategoriesController],
  providers: [CategoriesService, ApiClientService],
  exports: [CategoriesService],
})
export class CategoriesModule {}
