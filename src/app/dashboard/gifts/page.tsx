import { redirect } from 'next/navigation';

import {
  createDashboardGiftItemAction,
  deleteDashboardGiftItemAction,
  updateDashboardGiftItemAction,
} from '@/app/actions/dashboard.actions';
import { listGiftItems } from '@/application/use-cases/list-gift-items.use-case';
import { AdminGiftForm } from '@/components/forms/admin-gift-form';
import { DashboardBackLink } from '@/components/dashboard-back-link';
import { GiftItemList } from '@/components/dashboard/gift-item-list';
import { SectionContainer } from '@/components/ui/SectionContainer';
import { auth } from '@/infrastructure/auth/auth';
import { db } from '@/infrastructure/postgres/client';
import { PostgresEventRepository } from '@/infrastructure/postgres/event-repository.postgres';
import { PostgresGiftRepository } from '@/infrastructure/postgres/gift-repository.postgres';

export const dynamic = 'force-dynamic';

export default async function DashboardGiftsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect('/login');

  const eventRepository = new PostgresEventRepository(db);
  const event = await eventRepository.findByOwnerUserId(session.user.id);
  if (!event) redirect('/dashboard');

  const giftRepository = new PostgresGiftRepository(db);
  const { registryItems, bulkItems } = await listGiftItems(giftRepository, event.id);

  return (
    <main className="flex flex-1 flex-col">
      <DashboardBackLink />
      <SectionContainer title="Adicionar presente" subtitle="Cadastra um novo item na lista de presentes do seu evento.">
        <AdminGiftForm action={createDashboardGiftItemAction} />
      </SectionContainer>
      <SectionContainer title="Presentes cadastrados" subtitle="Edite ou remova itens da lista.">
        <GiftItemList
          items={[...registryItems, ...bulkItems]}
          updateAction={updateDashboardGiftItemAction}
          deleteAction={deleteDashboardGiftItemAction}
        />
      </SectionContainer>
    </main>
  );
}
