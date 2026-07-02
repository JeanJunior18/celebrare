import { z } from 'zod';

import type { Event } from '@/domain/entities/event';
import type { EventRepository } from '@/domain/repositories/event-repository';

const updateEventHeroInputSchema = z.object({
  image: z.instanceof(File).optional(),
  imageUrl: z.string().url().optional(),
  heroIntro: z.string().optional(),
});

export type UpdateEventHeroInput = z.infer<typeof updateEventHeroInputSchema>;

export async function updateEventHero(
  eventRepository: EventRepository,
  event: Event,
  input: UpdateEventHeroInput,
): Promise<Event> {
  const parsed = updateEventHeroInputSchema.parse(input);
  return eventRepository.updateHero(event.id, parsed);
}
