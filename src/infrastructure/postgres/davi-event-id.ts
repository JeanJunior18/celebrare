import { db } from './client';
import { PostgresEventRepository } from './event-repository.postgres';

// `/internal/gifts` e `/internal/photos` ainda administram só o evento do
// Davi (docs/saas-platform-plan.md, fase 7) — o dashboard de host é o
// caminho novo e genérico; esses dois seguem vinculados ao mesmo slug fixo
// usado em `app/page.tsx`, até o cutover da fase 8.
const DAVI_EVENT_SLUG = 'arca-do-davi';

export async function getDaviEventId(): Promise<string> {
  const repository = new PostgresEventRepository(db);
  const event = await repository.findBySlug(DAVI_EVENT_SLUG);
  if (!event) throw new Error(`Evento '${DAVI_EVENT_SLUG}' não encontrado.`);
  return event.id;
}
