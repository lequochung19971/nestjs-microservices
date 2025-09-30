import { Inject, Injectable } from '@nestjs/common';
import { DbType, DRIZZLE_PROVIDER } from '.';

@Injectable()
export class DrizzleService {
  constructor(@Inject(DRIZZLE_PROVIDER) private readonly db: DbType) {}

  get client() {
    return this.db;
  }
}
