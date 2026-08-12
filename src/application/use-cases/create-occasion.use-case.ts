import { z } from 'zod';

import type { Occasion } from '@/domain/entities/occasion';
import type { OccasionRepository } from '@/domain/repositories/occasion-repository';

// `defaultCopy` chega já parseado de JSON pela action (`/internal/occasions`)
// — a validação de formato (chaves esperadas) é responsabilidade da
// UI/operador, não dessa camada; aqui só garantimos que é um objeto e que
// os campos simples têm o formato certo.
const createOccasionInputSchema = z.object({
  slug: z
    .string()
    .trim()
    .toUpperCase()
    .regex(/^[A-Z0-9_]+$/, 'Use letras maiúsculas, números e _ (ex: WEDDING).'),
  name: z.string().min(2),
  defaultCopy: z.record(z.string(), z.unknown()),
});

export type CreateOccasionInput = z.infer<typeof createOccasionInputSchema>;

export type CreateOccasionResult = { success: true; occasion: Occasion } | { success: false; reason: 'SLUG_TAKEN' };

export async function createOccasion(
  occasionRepository: OccasionRepository,
  input: CreateOccasionInput,
): Promise<CreateOccasionResult> {
  const parsed = createOccasionInputSchema.parse(input);

  const existing = (await occasionRepository.listAll()).find((occasion) => occasion.slug === parsed.slug);
  if (existing) return { success: false, reason: 'SLUG_TAKEN' };

  const occasion = await occasionRepository.create({
    slug: parsed.slug,
    name: parsed.name,
    defaultCopy: parsed.defaultCopy as unknown as Occasion['defaultCopy'],
  });

  return { success: true, occasion };
}
