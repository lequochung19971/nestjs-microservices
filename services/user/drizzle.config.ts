// drizzle.config.ts
import { defineConfig } from 'drizzle-kit';
import 'dotenv/config';

console.log('DATABASE_URL', process.env.DATABASE_URL);

export default defineConfig({
  schema: './src/db/schema.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    database: 'user_db',
    host: 'localhost',
    port: 5433,
    user: 'user_user',
    password: 'user_password',
    ssl: false,
  },
  verbose: true,
  strict: true,
});
