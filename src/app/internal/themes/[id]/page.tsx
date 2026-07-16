import { notFound } from 'next/navigation';

import { ThemeForm } from '@/components/forms/theme-form';
import { SectionContainer } from '@/components/ui/SectionContainer';
import { db } from '@/infrastructure/postgres/client';
import { PostgresThemeRepository } from '@/infrastructure/postgres/theme-repository.postgres';

export const dynamic = 'force-dynamic';

export default async function InternalThemeEditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const repository = new PostgresThemeRepository(db);
  const theme = await repository.findById(id);

  if (!theme) notFound();

  return (
    <main className="flex flex-1 flex-col">
      <SectionContainer title={`Editar tema — ${theme.name}`} subtitle="Mudanças aqui valem pra todo evento desse tema.">
        <ThemeForm theme={theme} />
      </SectionContainer>
    </main>
  );
}
