import { listEvents } from '@/application/use-cases/list-events.use-case';
import { Card } from '@/components/ui/Card';
import { SectionContainer } from '@/components/ui/SectionContainer';
import { db } from '@/infrastructure/postgres/client';
import { PostgresEventRepository } from '@/infrastructure/postgres/event-repository.postgres';

export const dynamic = 'force-dynamic';

export default async function InternalEventsPage() {
  const repository = new PostgresEventRepository(db);
  const events = await listEvents(repository);

  return (
    <main className="flex flex-1 flex-col">
      <SectionContainer title="Eventos" subtitle="Todos os eventos cadastrados na plataforma.">
        {events.length === 0 ? (
          <p className="font-body text-ink-soft">Nenhum evento cadastrado ainda.</p>
        ) : (
          <div className="grid w-full max-w-2xl gap-3">
            {events.map((event) => (
              <Card key={event.id} className="flex items-center justify-between gap-3">
                <div>
                  <p className="font-display text-primary-700">{event.honoreeName}</p>
                  <p className="font-body text-xs text-ink-soft">
                    /e/{event.slug} · {event.theme.name} ·{' '}
                    {event.ownerUserId ? 'com host' : 'sem host (legado)'}
                  </p>
                </div>
              </Card>
            ))}
          </div>
        )}
      </SectionContainer>
    </main>
  );
}
