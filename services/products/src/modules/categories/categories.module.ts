import { Module } from '@nestjs/common';
import { DrizzleModule } from '../../db/drizzle.module';
import CategoriesController from './categories.controller';
import CategoriesService from './categories.service';
import { DrizzleService } from 'src/db/drizzle.service';

@Module({
  imports: [DrizzleModule],
  controllers: [CategoriesController],
  providers: [CategoriesService, DrizzleService],
  exports: [CategoriesService],
})
export class CategoriesModule {}
