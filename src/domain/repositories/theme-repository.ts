import type { Theme, ThemeColorTokens, ThemeDefaultCopy } from '@/domain/entities/theme';

export interface CreateThemeInput {
  slug: string;
  name: string;
  colorTokens: ThemeColorTokens;
  defaultCopy: ThemeDefaultCopy;
  defaultIllustrationUrl?: string;
}

export type UpdateThemeInput = Partial<Omit<CreateThemeInput, 'slug'>>;

export interface ThemeRepository {
  listAll(): Promise<Theme[]>;
  findById(id: string): Promise<Theme | null>;
  create(input: CreateThemeInput): Promise<Theme>;
  update(themeId: string, input: UpdateThemeInput): Promise<Theme>;
}
