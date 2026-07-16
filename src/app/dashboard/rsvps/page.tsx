import { redirect } from 'next/navigation';

import { listRsvps } from '@/application/use-cases/list-rsvps.use-case';
import { DashboardBackLink } from '@/components/dashboard-back-link';
import { Card } from '@/components/ui/Card';
import { SectionContainer } from '@/components/ui/SectionContainer';
import { auth } from '@/infrastructure/auth/auth';
import { db } from '@/infrastructure/postgres/client';
import { PostgresEventRepository } from '@/infrastructure/postgres/event-repository.postgres';
import { PostgresRsvpRepository } from '@/infrastructure/postgres/rsvp-repository.postgres';

export const dynamic = 'force-dynamic';

export default async function DashboardRsvpsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect('/login');

  const eventRepository = new PostgresEventRepository(db);
  const event = await eventRepository.findByOwnerUserId(session.user.id);
  if (!event) redirect('/dashboard');

  const rsvpRepository = new PostgresRsvpRepository(db);
  const { rsvps, totalConfirmed } = await listRsvps(rsvpRepository, event.id);

  return (
    <main className="flex flex-1 flex-col">
      <DashboardBackLink />
      <SectionContainer
        title="Confirmações de presença"
        subtitle={`${totalConfirmed} pessoa(s) confirmada(s) (convidados + acompanhantes).`}
      >
        {rsvps.length === 0 ? (
          <p className="font-body text-ink-soft">Ninguém confirmou presença ainda.</p>
        ) : (
          <div className="grid w-full max-w-2xl gap-3">
            {rsvps.map((rsvp) => (
              <Card key={rsvp.id} className="flex items-center justify-between gap-3">
                <div>
                  <p className="font-display text-primary-700">{rsvp.guestName}</p>
                  <p className="font-body text-xs text-ink-soft">{rsvp.whatsappNumber}</p>
                </div>
                <span className="font-body text-sm text-ink-soft">
                  +{rsvp.companionCount} {rsvp.companionCount === 1 ? 'acompanhante' : 'acompanhantes'}
                </span>
              </Card>
            ))}
          </div>
        )}
      </SectionContainer>
    </main>
  );
}
