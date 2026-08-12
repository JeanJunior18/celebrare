import { z } from 'zod';

import type { Event } from '@/domain/entities/event';
import type { EventRepository } from '@/domain/repositories/event-repository';
import type { OccasionRepository } from '@/domain/repositories/occasion-repository';

const updateEventOccasionInputSchema = z.object({
  occasionId: z.string().uuid(),
});

export type UpdateEventOccasionInput = z.infer<typeof updateEventOccasionInputSchema>;

export async function updateEventOccasion(
  eventRepository: EventRepository,
  occasionRepository: OccasionRepository,
  event: Event,
  input: UpdateEventOccasionInput,
): Promise<Event> {
  const parsed = updateEventOccasionInputSchema.parse(input);

  const occasion = await occasionRepository.findById(parsed.occasionId);
  if (!occasion) throw new Error('Ocasião não encontrada.');

  return eventRepository.update(event.id, { occasionId: parsed.occasionId });
}
