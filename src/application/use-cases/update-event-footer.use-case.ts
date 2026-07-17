import { z } from 'zod';

import type { Event } from '@/domain/entities/event';
import type { EventRepository } from '@/domain/repositories/event-repository';

const updateEventFooterInputSchema = z.object({
  quoteText: z.string().optional(),
  quoteReference: z.string().optional(),
  signoff: z.string().optional(),
});

export type UpdateEventFooterInput = z.infer<typeof updateEventFooterInputSchema>;

export async function updateEventFooter(
  eventRepository: EventRepository,
  event: Event,
  input: UpdateEventFooterInput,
): Promise<Event> {
  const parsed = updateEventFooterInputSchema.parse(input);

  return eventRepository.update(event.id, {
    quoteText: parsed.quoteText || undefined,
    quoteReference: parsed.quoteReference || undefined,
    copyOverrides: {
      ...event.copyOverrides,
      footer: parsed.signoff ? { signoff: parsed.signoff } : event.copyOverrides.footer,
    },
  });
}
