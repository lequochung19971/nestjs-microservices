import { Global, Module } from '@nestjs/common';
import db from '.';
import { DrizzleService } from './drizzle.service';
import { DRIZZLE_PROVIDER } from './constants';

@Global()
@Module({
  imports: [],
  controllers: [],
  providers: [
    DrizzleService,
    {
      provide: DRIZZLE_PROVIDER,
      useValue: db,
    },
  ],
  exports: [DRIZZLE_PROVIDER, DrizzleService],
})
export class DrizzleModule {}
