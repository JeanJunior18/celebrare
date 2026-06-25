import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { buildEventMetadata } from '@/components/event-metadata';
import { EventPage } from '@/components/event-page';
import { getEventBySlug } from '@/infrastructure/postgres/get-event-by-slug';

// gift_items, rsvps e guestbook_messages precisam de dado fresco por
// request (CLAUDE.md) — sem isso o Next prerenderiza "/" como página
// estática e a Vercel serve o HTML do build pra todo mundo.
export const dynamic = 'force-dynamic';

// Slug fixo do evento do Davi (scripts/seed-davi-event.mjs) — a raiz "/"
// continua sendo o link já compartilhado no WhatsApp; `/e/[slug]` (fase 7)
// é o caminho genérico pra qualquer evento novo.
const DAVI_EVENT_SLUG = 'arca-do-davi';

export async function generateMetadata(): Promise<Metadata> {
  const event = await getEventBySlug(DAVI_EVENT_SLUG);
  return event ? buildEventMetadata(event) : {};
}

export default async function Home() {
  const event = await getEventBySlug(DAVI_EVENT_SLUG);

  if (!event) notFound();

  return <EventPage event={event} />;
}
