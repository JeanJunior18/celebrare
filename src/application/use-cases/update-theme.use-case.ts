import { z } from 'zod';

import type { Theme } from '@/domain/entities/theme';
import type { ThemeRepository } from '@/domain/repositories/theme-repository';

const updateThemeInputSchema = z.object({
  name: z.string().min(2),
  colorTokens: z.record(z.string(), z.unknown()),
  defaultIllustrationUrl: z.string().url().optional(),
});

export type UpdateThemeInput = z.infer<typeof updateThemeInputSchema>;

export async function updateTheme(
  themeRepository: ThemeRepository,
  themeId: string,
  input: UpdateThemeInput,
): Promise<Theme> {
  const parsed = updateThemeInputSchema.parse(input);

  return themeRepository.update(themeId, {
    name: parsed.name,
    colorTokens: parsed.colorTokens as unknown as Theme['colorTokens'],
    defaultIllustrationUrl: parsed.defaultIllustrationUrl,
  });
}
