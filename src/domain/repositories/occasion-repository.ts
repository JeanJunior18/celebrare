import type { Occasion, OccasionDefaultCopy } from '@/domain/entities/occasion';

export interface CreateOccasionInput {
  slug: string;
  name: string;
  defaultCopy: OccasionDefaultCopy;
}

export type UpdateOccasionInput = Partial<Omit<CreateOccasionInput, 'slug'>>;

export interface OccasionRepository {
  listAll(): Promise<Occasion[]>;
  findById(id: string): Promise<Occasion | null>;
  create(input: CreateOccasionInput): Promise<Occasion>;
  update(occasionId: string, input: UpdateOccasionInput): Promise<Occasion>;
}
