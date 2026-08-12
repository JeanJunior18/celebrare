import { notFound } from 'next/navigation';

import { OccasionForm } from '@/components/forms/occasion-form';
import { SectionContainer } from '@/components/ui/SectionContainer';
import { db } from '@/infrastructure/postgres/client';
import { PostgresOccasionRepository } from '@/infrastructure/postgres/occasion-repository.postgres';

export const dynamic = 'force-dynamic';

export default async function InternalOccasionEditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const repository = new PostgresOccasionRepository(db);
  const occasion = await repository.findById(id);

  if (!occasion) notFound();

  return (
    <main className="flex flex-1 flex-col">
      <SectionContainer
        title={`Editar ocasião — ${occasion.name}`}
        subtitle="Mudanças aqui valem pra todo evento dessa ocasião."
      >
        <OccasionForm occasion={occasion} />
      </SectionContainer>
    </main>
  );
}
