import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { buildEventMetadata } from '@/components/event-metadata';
import { EventPage } from '@/components/event-page';
import { getEventBySlug } from '@/infrastructure/postgres/get-event-by-slug';

// Mesmo motivo do "/" (CLAUDE.md): dados de evento, presentes, rsvps e
// mural precisam ser sempre frescos.
export const dynamic = 'force-dynamic';

type PageParams = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: PageParams): Promise<Metadata> {
  const { slug } = await params;
  const event = await getEventBySlug(slug);
  return event ? buildEventMetadata(event) : {};
}

export default async function EventBySlugPage({ params }: PageParams) {
  const { slug } = await params;
  const event = await getEventBySlug(slug);

  if (!event) notFound();

  return <EventPage event={event} />;
}
