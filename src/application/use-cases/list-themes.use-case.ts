import type { Theme } from '@/domain/entities/theme';
import type { ThemeRepository } from '@/domain/repositories/theme-repository';

export async function listThemes(themeRepository: ThemeRepository): Promise<Theme[]> {
  return themeRepository.listAll();
}
