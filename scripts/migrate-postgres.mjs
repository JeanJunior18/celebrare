// Aplica as migrations de src/infrastructure/postgres/migrations/ no banco
// apontado por DIRECT_URL (conexão de sessão — pgbouncer em transaction mode,
// usado por DATABASE_URL em produção, não suporta os locks que o migrator
// precisa) ou, na ausência dela (Postgres local de dev, sem pooler), por
// DATABASE_URL. Substitui o CLI da Supabase como ferramenta de migração —
// ver fase 2 de docs/saas-platform-plan.md.
//
// Uso: node scripts/migrate-postgres.mjs

import { drizzle } from 'drizzle-orm/node-postgres';
import { migrate } from 'drizzle-orm/node-postgres/migrator';
import { Pool } from 'pg';

const pool = new Pool({ connectionString: process.env.DIRECT_URL ?? process.env.DATABASE_URL });
const db = drizzle(pool);

await migrate(db, { migrationsFolder: './src/infrastructure/postgres/migrations' });
console.log('Migrations aplicadas com sucesso.');

await pool.end();
