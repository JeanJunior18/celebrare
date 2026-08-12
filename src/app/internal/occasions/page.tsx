import Link from 'next/link';

import { listOccasions } from '@/application/use-cases/list-occasions.use-case';
import { OccasionForm } from '@/components/forms/occasion-form';
import { Card } from '@/components/ui/Card';
import { SectionContainer } from '@/components/ui/SectionContainer';
import { db } from '@/infrastructure/postgres/client';
import { PostgresOccasionRepository } from '@/infrastructure/postgres/occasion-repository.postgres';

export const dynamic = 'force-dynamic';

export default async function InternalOccasionsPage() {
  const repository = new PostgresOccasionRepository(db);
  const occasions = await listOccasions(repository);

  return (
    <main className="flex flex-1 flex-col">
      <SectionContainer
        title="Ocasiões"
        subtitle="Ocasiões (tipo de evento) disponíveis pra novos eventos — editar aqui não precisa de deploy."
      >
        <div className="grid w-full max-w-2xl gap-3">
          {occasions.map((occasion) => (
            <Link key={occasion.id} href={`/internal/occasions/${occasion.id}`}>
              <Card className="flex items-center justify-between gap-3 transition-shadow hover:shadow-card-hover">
                <div>
                  <p className="font-display text-primary-700">{occasion.name}</p>
                  <p className="font-body text-xs text-ink-soft">{occasion.slug}</p>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      </SectionContainer>

      <SectionContainer title="Criar ocasião" subtitle="Adiciona uma 3ª ocasião (ou mais) sem deploy de código.">
        <OccasionForm />
      </SectionContainer>
    </main>
  );
}
