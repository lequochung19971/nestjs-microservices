import { Inject, Injectable } from '@nestjs/common';
import { DbType } from '.';
import { DRIZZLE_PROVIDER } from './constants';

@Injectable()
export class DrizzleService {
  constructor(@Inject(DRIZZLE_PROVIDER) private readonly db: DbType) {}

  get client() {
    return this.db;
  }
}
