import { Module } from '@nestjs/common';
import db from '.';
import { DrizzleService } from './drizzle.service';

export const DRIZZLE_PROVIDER = 'DRIZZLE_PROVIDER';

@Module({
  imports: [],
  controllers: [],
  providers: [
    {
      provide: DRIZZLE_PROVIDER,
      useValue: db,
    },
  ],
  exports: [DRIZZLE_PROVIDER],
})
export class DrizzleModule {}
