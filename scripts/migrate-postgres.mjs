// Aplica as migrations de src/infrastructure/postgres/migrations/ no banco
// apontado por DATABASE_URL (Postgres local de dev, ou outro Postgres simples
// no futuro). Substitui o CLI da Supabase como ferramenta de migração — ver
// fase 2 de docs/saas-platform-plan.md.
//
// Uso: node scripts/migrate-postgres.mjs

import { drizzle } from 'drizzle-orm/node-postgres';
import { migrate } from 'drizzle-orm/node-postgres/migrator';
import { Pool } from 'pg';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const db = drizzle(pool);

await migrate(db, { migrationsFolder: './src/infrastructure/postgres/migrations' });
console.log('Migrations aplicadas com sucesso.');

await pool.end();
