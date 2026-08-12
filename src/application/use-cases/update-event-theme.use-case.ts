import { z } from 'zod';

import type { Event } from '@/domain/entities/event';
import type { EventRepository } from '@/domain/repositories/event-repository';
import type { ThemeRepository } from '@/domain/repositories/theme-repository';

const updateEventThemeInputSchema = z.object({
  themeId: z.string().uuid(),
});

export type UpdateEventThemeInput = z.infer<typeof updateEventThemeInputSchema>;

export async function updateEventTheme(
  eventRepository: EventRepository,
  themeRepository: ThemeRepository,
  event: Event,
  input: UpdateEventThemeInput,
): Promise<Event> {
  const parsed = updateEventThemeInputSchema.parse(input);

  const theme = await themeRepository.findById(parsed.themeId);
  if (!theme) throw new Error('Tema não encontrado.');

  return eventRepository.update(event.id, { themeId: parsed.themeId });
}
