import { eq } from 'drizzle-orm';
import type { NodePgDatabase } from 'drizzle-orm/node-postgres';

import type { Theme } from '@/domain/entities/theme';
import type { CreateThemeInput, ThemeRepository, UpdateThemeInput } from '@/domain/repositories/theme-repository';

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

  async findById(id: string): Promise<Theme | null> {
    const [row] = await this.db.select().from(themes).where(eq(themes.id, id));
    return row ? toTheme(row) : null;
  }

  async create(input: CreateThemeInput): Promise<Theme> {
    const [row] = await this.db
      .insert(themes)
      .values({
        slug: input.slug,
        name: input.name,
        colorTokens: input.colorTokens,
        defaultCopy: input.defaultCopy,
        defaultIllustrationUrl: input.defaultIllustrationUrl ?? null,
      })
      .returning();

    return toTheme(row);
  }

  async update(themeId: string, input: UpdateThemeInput): Promise<Theme> {
    const [row] = await this.db.update(themes).set(input).where(eq(themes.id, themeId)).returning();
    return toTheme(row);
  }
}
