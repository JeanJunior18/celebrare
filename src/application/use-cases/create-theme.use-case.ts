import { z } from 'zod';

import type { Theme } from '@/domain/entities/theme';
import type { ThemeRepository } from '@/domain/repositories/theme-repository';

// `colorTokens`/`defaultCopy` chegam já parseados de JSON pela action
// (`/internal/themes`) — a validação de formato (chaves esperadas) é
// responsabilidade da UI/operador, não dessa camada; aqui só garantimos que
// são objetos e que os campos simples têm o formato certo.
const createThemeInputSchema = z.object({
  slug: z
    .string()
    .trim()
    .toUpperCase()
    .regex(/^[A-Z0-9_]+$/, 'Use letras maiúsculas, números e _ (ex: WEDDING).'),
  name: z.string().min(2),
  colorTokens: z.record(z.string(), z.unknown()),
  defaultCopy: z.record(z.string(), z.unknown()),
  defaultIllustrationUrl: z.string().url().optional(),
});

export type CreateThemeInput = z.infer<typeof createThemeInputSchema>;

export type CreateThemeResult = { success: true; theme: Theme } | { success: false; reason: 'SLUG_TAKEN' };

export async function createTheme(
  themeRepository: ThemeRepository,
  input: CreateThemeInput,
): Promise<CreateThemeResult> {
  const parsed = createThemeInputSchema.parse(input);

  const existing = (await themeRepository.listAll()).find((theme) => theme.slug === parsed.slug);
  if (existing) return { success: false, reason: 'SLUG_TAKEN' };

  const theme = await themeRepository.create({
    slug: parsed.slug,
    name: parsed.name,
    colorTokens: parsed.colorTokens as unknown as Theme['colorTokens'],
    defaultCopy: parsed.defaultCopy as unknown as Theme['defaultCopy'],
    defaultIllustrationUrl: parsed.defaultIllustrationUrl,
  });

  return { success: true, theme };
}
