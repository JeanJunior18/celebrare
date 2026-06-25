import { listGuestbookMessages } from '@/application/use-cases/list-guestbook-messages.use-case';
import { GuestbookForm } from '@/components/forms/guestbook-form';
import { Card } from '@/components/ui/Card';
import { SectionContainer } from '@/components/ui/SectionContainer';
import { db } from '@/infrastructure/postgres/client';
import { PostgresGuestbookRepository } from '@/infrastructure/postgres/guestbook-repository.postgres';

export async function GuestbookSection() {
  const repository = new PostgresGuestbookRepository(db);
  const messages = await listGuestbookMessages(repository);

  return (
    <SectionContainer
      id="mensagens"
      title="Mensagem para o Davi"
      subtitle="Deixe aqui uma mensagem cheia de carinho para o nosso pequeno navegador!"
    >
      <GuestbookForm />

      {messages.length > 0 && (
        <div className="mt-10 grid w-full gap-4 md:grid-cols-2">
          {messages.map((message) => (
            <Card key={message.id}>
              <p className="font-body text-ink">{message.message}</p>
              <p className="mt-2 font-body text-xs font-semibold uppercase tracking-wide text-primary-600">
                {message.guestName}
              </p>
            </Card>
          ))}
        </div>
      )}
    </SectionContainer>
  );
}
