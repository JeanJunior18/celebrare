import type { NodePgDatabase } from 'drizzle-orm/node-postgres';

import type { Theme } from '@/domain/entities/theme';
import type { ThemeRepository } from '@/domain/repositories/theme-repository';

import { themes } from './schema';
import type * as schema from './schema';

export function toTheme(row: typeof themes.$inferSelect): Theme {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    colorTokens: row.colorTokens as Theme['colorTokens'],
    defaultCopy: row.defaultCopy as Theme['defaultCopy'],
    defaultIllustrationUrl: row.defaultIllustrationUrl,
  };
}

export class PostgresThemeRepository implements ThemeRepository {
  constructor(private readonly db: NodePgDatabase<typeof schema>) {}

  async listAll(): Promise<Theme[]> {
    const rows = await this.db.select().from(themes);
    return rows.map(toTheme);
  }
}
