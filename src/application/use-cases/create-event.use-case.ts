import { z } from 'zod';

import type { Event } from '@/domain/entities/event';
import type { EventRepository } from '@/domain/repositories/event-repository';

const createEventInputSchema = z.object({
  ownerUserId: z.string().uuid(),
  themeId: z.string().uuid(),
  slug: z
    .string()
    .trim()
    .toLowerCase()
    .min(3)
    .regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, 'Use só letras minúsculas, números e hífen — ex: ana-e-pedro.'),
  honoreeName: z.string().min(2),
  subtitleLabel: z.string().min(1),
  eventDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Data inválida.'),
  eventTime: z.string().regex(/^\d{2}:\d{2}$/, 'Horário inválido.'),
  venueName: z.string().min(2),
  venueAddress: z.string().min(2),
  heroImageUrl: z.string().url().optional(),
  googleMapsUrl: z.string().url().optional(),
  quoteText: z.string().optional(),
  quoteReference: z.string().optional(),
  pixKey: z.string().optional(),
  pixQrCodeUrl: z.string().optional(),
});

export type CreateEventInput = z.infer<typeof createEventInputSchema>;

export type CreateEventResult = { success: true; event: Event } | { success: false; reason: 'SLUG_TAKEN' };

export async function createEvent(
  eventRepository: EventRepository,
  input: CreateEventInput,
): Promise<CreateEventResult> {
  const parsed = createEventInputSchema.parse(input);

  const existing = await eventRepository.findBySlug(parsed.slug);
  if (existing) return { success: false, reason: 'SLUG_TAKEN' };

  const event = await eventRepository.create(parsed);
  return { success: true, event };
}
