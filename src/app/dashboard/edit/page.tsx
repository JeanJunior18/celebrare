import Link from 'next/link';
import { redirect } from 'next/navigation';

import { EditEventSectionForm, type EditEventSectionField } from '@/components/forms/edit-event-section-form';
import { EditHeroForm } from '@/components/forms/edit-hero-form';
import { SectionContainer } from '@/components/ui/SectionContainer';
import { resolveEventCopy, type Event, type SectionKey } from '@/domain/entities/event';
import { auth } from '@/infrastructure/auth/auth';
import { db } from '@/infrastructure/postgres/client';
import { PostgresEventRepository } from '@/infrastructure/postgres/event-repository.postgres';

export const dynamic = 'force-dynamic';

const SECTION_LABELS: Record<SectionKey, string> = {
  rsvp: 'RSVP',
  giftRegistry: 'Lista de Presentes',
  location: 'Local',
  gallery: 'Galeria',
  guestbook: 'Mural',
};

function buildSectionFields(event: Event, section: SectionKey): EditEventSectionField[] {
  const copy = resolveEventCopy(event);

  switch (section) {
    case 'rsvp':
      return [
        {
          name: 'subtitle',
          label: 'Subtítulo',
          currentValue: copy.rsvp.subtitle,
          overrideValue: event.copyOverrides.rsvp?.subtitle ?? '',
        },
      ];
    case 'giftRegistry':
      return [
        {
          name: 'subtitle',
          label: 'Subtítulo',
          currentValue: copy.giftRegistry.subtitle,
          overrideValue: event.copyOverrides.giftRegistry?.subtitle ?? '',
        },
        {
          name: 'description',
          label: 'Descrição',
          currentValue: copy.giftRegistry.description,
          overrideValue: event.copyOverrides.giftRegistry?.description ?? '',
          multiline: true,
        },
      ];
    case 'gallery':
      return [
        {
          name: 'title',
          label: 'Título',
          currentValue: copy.gallery.title,
          overrideValue: event.copyOverrides.gallery?.title ?? '',
        },
      ];
    case 'guestbook':
      return [
        {
          name: 'subtitle',
          label: 'Subtítulo',
          currentValue: copy.guestbook.subtitle,
          overrideValue: event.copyOverrides.guestbook?.subtitle ?? '',
        },
      ];
    case 'location':
      return [];
  }
}

export default async function DashboardEditPage() {
  const session = await auth();
  if (!session?.user?.id) redirect('/login');

  const eventRepository = new PostgresEventRepository(db);
  const event = await eventRepository.findByOwnerUserId(session.user.id);
  if (!event) redirect('/dashboard');

  const copy = resolveEventCopy(event);
  const sections: SectionKey[] = ['rsvp', 'giftRegistry', 'location', 'gallery', 'guestbook'];

  return (
    <main className="flex flex-1 flex-col">
      <div className="mx-auto flex w-full max-w-2xl items-center justify-between px-6 pt-8">
        <Link href="/dashboard" className="font-body text-sm font-semibold text-primary-700 underline">
          ← Voltar ao menu
        </Link>
        <a
          href={`/e/${event.slug}`}
          target="_blank"
          rel="noopener noreferrer"
          className="font-body text-sm font-semibold text-primary-700 underline"
        >
          Ver página pública ↗
        </a>
      </div>

      <SectionContainer title="Editar página" subtitle="Textos, foto do hero e blocos visíveis.">
        <div className="flex w-full max-w-2xl flex-col gap-6">
          <EditHeroForm
            heroImageUrl={event.heroImageUrl}
            intro={copy.hero.intro}
            overrideIntro={event.copyOverrides.hero?.intro ?? ''}
          />

          {sections.map((section) => (
            <EditEventSectionForm
              key={section}
              section={section}
              title={SECTION_LABELS[section]}
              visible={event.sectionVisibility[section]}
              fields={buildSectionFields(event, section)}
            />
          ))}
        </div>
      </SectionContainer>
    </main>
  );
}
