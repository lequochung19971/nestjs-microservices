import { Module } from '@nestjs/common';
import { DrizzleService } from 'src/db/drizzle.service';
import CategoriesController from './categories.controller';
import CategoriesService from './categories.service';

@Module({
  imports: [],
  controllers: [CategoriesController],
  providers: [CategoriesService, DrizzleService],
  exports: [CategoriesService],
})
export class CategoriesModule {}
