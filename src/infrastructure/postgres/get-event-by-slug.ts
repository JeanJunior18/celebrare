import { cache } from 'react';

import type { Event } from '@/domain/entities/event';

import { db } from './client';
import { PostgresEventRepository } from './event-repository.postgres';

// `cache()` do React dedupe chamadas com o mesmo argumento dentro do mesmo
// request — `generateMetadata` e o componente de página buscam o mesmo
// evento sem rodar a query duas vezes (docs/saas-platform-plan.md, fase 7).
export const getEventBySlug = cache(async (slug: string): Promise<Event | null> => {
  const repository = new PostgresEventRepository(db);
  return repository.findBySlug(slug);
});
