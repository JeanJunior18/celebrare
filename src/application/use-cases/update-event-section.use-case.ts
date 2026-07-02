import { z } from 'zod';

import type { Event, SectionKey } from '@/domain/entities/event';
import type { EventRepository } from '@/domain/repositories/event-repository';

// Strategy map indexado por SectionKey — novo bloco editável no futuro é
// uma nova entrada aqui, sem editar um if/else existente.
const SECTION_COPY_FIELDS: Record<SectionKey, readonly string[]> = {
  rsvp: ['subtitle'],
  giftRegistry: ['subtitle', 'description'],
  location: [],
  gallery: ['title'],
  guestbook: ['subtitle'],
};

const updateEventSectionInputSchema = z.object({
  section: z.enum(['rsvp', 'giftRegistry', 'location', 'gallery', 'guestbook']),
  visible: z.boolean(),
  copy: z.record(z.string(), z.string()),
});

export type UpdateEventSectionInput = z.infer<typeof updateEventSectionInputSchema>;

export async function updateEventSection(
  eventRepository: EventRepository,
  event: Event,
  input: UpdateEventSectionInput,
): Promise<Event> {
  const parsed = updateEventSectionInputSchema.parse(input);

  const allowedFields = SECTION_COPY_FIELDS[parsed.section];
  const sanitizedCopy = Object.fromEntries(
    Object.entries(parsed.copy).filter(([field, value]) => allowedFields.includes(field) && value.trim() !== ''),
  );

  return eventRepository.update(event.id, {
    sectionVisibility: { ...event.sectionVisibility, [parsed.section]: parsed.visible },
    copyOverrides: { ...event.copyOverrides, [parsed.section]: sanitizedCopy },
  });
}
