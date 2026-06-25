import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  schema: './src/infrastructure/postgres/schema.ts',
  out: './src/infrastructure/postgres/migrations',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});
