import { eq } from 'drizzle-orm';
import type { NodePgDatabase } from 'drizzle-orm/node-postgres';

import type { Host } from '@/domain/entities/host';
import type { HostCredentials, HostRepository } from '@/domain/repositories/host-repository';

import { users } from './schema';
import type * as schema from './schema';

function toHost(row: typeof users.$inferSelect): Host {
  return { id: row.id, name: row.name, email: row.email, createdAt: row.createdAt };
}

export class PostgresHostRepository implements HostRepository {
  constructor(private readonly db: NodePgDatabase<typeof schema>) {}

  async findByEmail(email: string): Promise<HostCredentials | null> {
    const [row] = await this.db.select().from(users).where(eq(users.email, email));
    if (!row) return null;
    return { ...toHost(row), passwordHash: row.passwordHash };
  }

  async create(input: { name?: string; email: string; passwordHash: string }): Promise<Host> {
    const [row] = await this.db
      .insert(users)
      .values({ name: input.name ?? null, email: input.email, passwordHash: input.passwordHash })
      .returning();

    return toHost(row);
  }
}
