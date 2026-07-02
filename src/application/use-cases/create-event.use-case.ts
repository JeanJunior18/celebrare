import { z } from 'zod';

import type { Event } from '@/domain/entities/event';
import type { EventRepository } from '@/domain/repositories/event-repository';
import type { ThemeRepository } from '@/domain/repositories/theme-repository';

const createEventInputSchema = z.object({
  ownerUserId: z.string().uuid(),
  themeId: z.string().uuid(),
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

// Sem acento, minúsculo, palavras separadas por hífen — ex: "Ana & Pedro" -> "ana-pedro".
function slugify(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

// Colisão discreta: em vez de expor um sufixo aleatório, primeiro tenta o
// nome do tema como desambiguador legível (ex: "ana-pedro-casamento") e só
// recorre a um número incremental se até isso já existir.
async function findAvailableSlug(
  eventRepository: EventRepository,
  base: string,
  themeSlugHint: string,
): Promise<string> {
  if (!(await eventRepository.findBySlug(base))) return base;

  const withTheme = `${base}-${themeSlugHint}`;
  if (!(await eventRepository.findBySlug(withTheme))) return withTheme;

  let suffix = 2;
  let candidate = `${withTheme}-${suffix}`;
  while (await eventRepository.findBySlug(candidate)) {
    suffix += 1;
    candidate = `${withTheme}-${suffix}`;
  }
  return candidate;
}

export async function createEvent(
  eventRepository: EventRepository,
  themeRepository: ThemeRepository,
  input: CreateEventInput,
): Promise<Event> {
  const parsed = createEventInputSchema.parse(input);

  const theme = await themeRepository.findById(parsed.themeId);
  if (!theme) throw new Error('Tema não encontrado.');

  const base = slugify(parsed.honoreeName);
  if (!base) throw new Error('Não foi possível gerar um link a partir do nome informado.');

  const slug = await findAvailableSlug(eventRepository, base, slugify(theme.name));

  return eventRepository.create({ ...parsed, slug });
}
