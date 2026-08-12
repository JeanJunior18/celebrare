import { eq } from 'drizzle-orm';
import type { NodePgDatabase } from 'drizzle-orm/node-postgres';

import type { Occasion } from '@/domain/entities/occasion';
import type {
  CreateOccasionInput,
  OccasionRepository,
  UpdateOccasionInput,
} from '@/domain/repositories/occasion-repository';

import { occasions } from './schema';
import type * as schema from './schema';

export function toOccasion(row: typeof occasions.$inferSelect): Occasion {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    defaultCopy: row.defaultCopy as Occasion['defaultCopy'],
  };
}

export class PostgresOccasionRepository implements OccasionRepository {
  constructor(private readonly db: NodePgDatabase<typeof schema>) {}

  async listAll(): Promise<Occasion[]> {
    const rows = await this.db.select().from(occasions);
    return rows.map(toOccasion);
  }

  async findById(id: string): Promise<Occasion | null> {
    const [row] = await this.db.select().from(occasions).where(eq(occasions.id, id));
    return row ? toOccasion(row) : null;
  }

  async create(input: CreateOccasionInput): Promise<Occasion> {
    const [row] = await this.db
      .insert(occasions)
      .values({ slug: input.slug, name: input.name, defaultCopy: input.defaultCopy })
      .returning();

    return toOccasion(row);
  }

  async update(occasionId: string, input: UpdateOccasionInput): Promise<Occasion> {
    const [row] = await this.db.update(occasions).set(input).where(eq(occasions.id, occasionId)).returning();
    return toOccasion(row);
  }
}
