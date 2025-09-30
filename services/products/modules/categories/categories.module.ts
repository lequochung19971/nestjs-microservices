import { Module } from '@nestjs/common';
import { DrizzleModule } from '../../src/db/drizzle.module';
import CategoriesController from './categories.controller';
import CategoriesService from './categories.service';

@Module({
  imports: [DrizzleModule],
  controllers: [CategoriesController],
  providers: [CategoriesService],
  exports: [CategoriesService],
})
export class CategoriesModule {}
