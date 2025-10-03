import { drizzle } from 'drizzle-orm/node-postgres';

const db = drizzle(process.env.DATABASE_URL!);
// console.log('DATABASE_URL', process.env.DATABASE_URL);

export type DbType = typeof db;

export default db;
export * from './drizzle.module';
