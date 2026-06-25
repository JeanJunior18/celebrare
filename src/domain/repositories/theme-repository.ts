import type { Theme } from '@/domain/entities/theme';

export interface ThemeRepository {
  listAll(): Promise<Theme[]>;
}
