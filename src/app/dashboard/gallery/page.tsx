import { redirect } from 'next/navigation';

import { createDashboardGalleryPhotoAction, getDashboardNextDisplayOrderAction } from '@/app/actions/dashboard.actions';
import { AdminPhotoForm } from '@/components/forms/admin-photo-form';
import { SectionContainer } from '@/components/ui/SectionContainer';
import { auth } from '@/infrastructure/auth/auth';

export const dynamic = 'force-dynamic';

export default async function DashboardGalleryPage() {
  const session = await auth();
  if (!session?.user?.id) redirect('/login');

  return (
    <main className="flex flex-1 flex-col">
      <SectionContainer title="Adicionar foto" subtitle="Cadastra uma nova foto na galeria do seu evento.">
        <AdminPhotoForm
          createPhotoAction={createDashboardGalleryPhotoAction}
          getNextDisplayOrder={getDashboardNextDisplayOrderAction}
        />
      </SectionContainer>
    </main>
  );
}
