import type { Occasion } from '@/domain/entities/occasion';
import type { OccasionRepository } from '@/domain/repositories/occasion-repository';

export async function listOccasions(occasionRepository: OccasionRepository): Promise<Occasion[]> {
  return occasionRepository.listAll();
}
