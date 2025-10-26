import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './schema';
// Create PostgreSQL connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Initialize drizzle with all schemas
const db = drizzle(pool, { schema });

export type DbType = typeof db;

export default db;
export * from './drizzle.module';
