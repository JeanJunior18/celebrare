import { redirect } from 'next/navigation';

import { deleteDashboardRsvpAction, updateDashboardRsvpCompanionCountAction } from '@/app/actions/dashboard.actions';
import { listRsvps } from '@/application/use-cases/list-rsvps.use-case';
import { DashboardBackLink } from '@/components/dashboard-back-link';
import { RsvpList } from '@/components/dashboard/rsvp-list';
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
        <RsvpList
          rsvps={rsvps}
          deleteAction={deleteDashboardRsvpAction}
          updateCompanionCountAction={updateDashboardRsvpCompanionCountAction}
        />
      </SectionContainer>
    </main>
  );
}
