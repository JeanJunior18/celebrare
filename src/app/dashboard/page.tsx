import Link from 'next/link';
import { redirect } from 'next/navigation';

import { logoutHostAction } from '@/app/actions/auth.actions';
import { CreateEventForm } from '@/components/forms/create-event-form';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { SectionContainer } from '@/components/ui/SectionContainer';
import { auth } from '@/infrastructure/auth/auth';
import { db } from '@/infrastructure/postgres/client';
import { PostgresEventRepository } from '@/infrastructure/postgres/event-repository.postgres';
import { PostgresThemeRepository } from '@/infrastructure/postgres/theme-repository.postgres';

export const dynamic = 'force-dynamic';

const managementLinks = [
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
    const themes = await themeRepository.listAll();

    return (
      <main className="flex flex-1 flex-col">
        <SectionContainer title="Criar evento" subtitle="Escolha um tema e preencha os dados do seu evento.">
          <CreateEventForm themes={themes} />
        </SectionContainer>
      </main>
    );
  }

  return (
    <main className="flex flex-1 flex-col">
      <SectionContainer title={event.honoreeName} subtitle={`Página pública: /e/${event.slug}`}>
        <div className="grid w-full max-w-2xl gap-4 sm:grid-cols-3">
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
