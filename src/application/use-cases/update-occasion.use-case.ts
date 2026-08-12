import { z } from 'zod';

import type { Occasion } from '@/domain/entities/occasion';
import type { OccasionRepository } from '@/domain/repositories/occasion-repository';

const updateOccasionInputSchema = z.object({
  name: z.string().min(2),
  defaultCopy: z.record(z.string(), z.unknown()),
});

export type UpdateOccasionInput = z.infer<typeof updateOccasionInputSchema>;

export async function updateOccasion(
  occasionRepository: OccasionRepository,
  occasionId: string,
  input: UpdateOccasionInput,
): Promise<Occasion> {
  const parsed = updateOccasionInputSchema.parse(input);

  return occasionRepository.update(occasionId, {
    name: parsed.name,
    defaultCopy: parsed.defaultCopy as unknown as Occasion['defaultCopy'],
  });
}
