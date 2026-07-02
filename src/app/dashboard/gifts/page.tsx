import { redirect } from 'next/navigation';

import { createDashboardGiftItemAction } from '@/app/actions/dashboard.actions';
import { AdminGiftForm } from '@/components/forms/admin-gift-form';
import { DashboardBackLink } from '@/components/dashboard-back-link';
import { SectionContainer } from '@/components/ui/SectionContainer';
import { auth } from '@/infrastructure/auth/auth';

export const dynamic = 'force-dynamic';

export default async function DashboardGiftsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect('/login');

  return (
    <main className="flex flex-1 flex-col">
      <DashboardBackLink />
      <SectionContainer title="Adicionar presente" subtitle="Cadastra um novo item na lista de presentes do seu evento.">
        <AdminGiftForm action={createDashboardGiftItemAction} />
      </SectionContainer>
    </main>
  );
}
