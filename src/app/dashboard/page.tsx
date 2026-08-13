import Link from 'next/link';
import { redirect } from 'next/navigation';

import { logoutHostAction } from '@/app/actions/auth.actions';
import { BrandMark } from '@/components/brand-mark';
import { CreateEventForm } from '@/components/forms/create-event-form';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { SectionContainer } from '@/components/ui/SectionContainer';
import { auth } from '@/infrastructure/auth/auth';
import { db } from '@/infrastructure/postgres/client';
import { PostgresEventRepository } from '@/infrastructure/postgres/event-repository.postgres';
import { PostgresOccasionRepository } from '@/infrastructure/postgres/occasion-repository.postgres';
import { PostgresThemeRepository } from '@/infrastructure/postgres/theme-repository.postgres';
import { getRequestSiteUrl } from '@/infrastructure/site-url';

export const dynamic = 'force-dynamic';

const managementLinks = [
  { href: '/dashboard/edit', title: 'Editar página', description: 'Textos, foto do hero e blocos visíveis.' },
  { href: '/dashboard/gifts', title: 'Presentes', description: 'Adicionar item na lista de presentes.' },
  { href: '/dashboard/gallery', title: 'Fotos', description: 'Adicionar foto na galeria do evento.' },
  { href: '/dashboard/rsvps', title: 'Confirmações', description: 'Ver quem confirmou presença.' },
];

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user?.id) redirect('/login');

  const eventRepository = new PostgresEventRepository(db);
  const event = await eventRepository.findByOwnerUserId(session.user.id);

  if (!event) {
    const themeRepository = new PostgresThemeRepository(db);
    const occasionRepository = new PostgresOccasionRepository(db);
    const [themes, occasions] = await Promise.all([themeRepository.listAll(), occasionRepository.listAll()]);

    return (
      <main className="flex flex-1 flex-col">
        <BrandMark />
        <SectionContainer title="Criar evento" subtitle="Escolha uma ocasião, um tema e preencha os dados do seu evento.">
          <CreateEventForm themes={themes} occasions={occasions} />
        </SectionContainer>
      </main>
    );
  }

  const siteUrl = await getRequestSiteUrl();

  return (
    <main className="flex flex-1 flex-col">
      <BrandMark />
      <SectionContainer
        title={event.honoreeName}
        subtitle={
          <>
            Página pública:{' '}
            <a
              href={`/e/${event.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-primary-700 underline"
            >
              {siteUrl}/e/{event.slug}
            </a>
          </>
        }
      >
        <div className="grid w-full max-w-2xl gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {managementLinks.map((link) => (
            <Link key={link.href} href={link.href}>
              <Card className="h-full transition-shadow hover:shadow-card-hover">
                <h3 className="font-display text-lg text-primary-700">{link.title}</h3>
                <p className="mt-1 font-body text-sm text-ink-soft">{link.description}</p>
              </Card>
            </Link>
          ))}
        </div>

        <form action={logoutHostAction} className="mt-8">
          <Button type="submit" variant="ghost">
            Sair
          </Button>
        </form>
      </SectionContainer>
    </main>
  );
}
