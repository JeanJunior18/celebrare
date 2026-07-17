import { z } from 'zod';

import type { Event } from '@/domain/entities/event';
import type { EventRepository } from '@/domain/repositories/event-repository';

const updateEventLocationInputSchema = z.object({
  eventDate: z.string().min(1),
  eventTime: z.string().min(1),
  venueName: z.string().min(2),
  venueAddress: z.string().min(2),
  googleMapsUrl: z.string().url().optional().or(z.literal('')),
});

export type UpdateEventLocationInput = z.infer<typeof updateEventLocationInputSchema>;

export async function updateEventLocation(
  eventRepository: EventRepository,
  event: Event,
  input: UpdateEventLocationInput,
): Promise<Event> {
  const parsed = updateEventLocationInputSchema.parse(input);
  return eventRepository.update(event.id, {
    eventDate: parsed.eventDate,
    eventTime: parsed.eventTime,
    venueName: parsed.venueName,
    venueAddress: parsed.venueAddress,
    googleMapsUrl: parsed.googleMapsUrl || undefined,
  });
}
