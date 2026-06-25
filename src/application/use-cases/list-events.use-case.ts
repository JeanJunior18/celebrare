import type { Event } from '@/domain/entities/event';
import type { EventRepository } from '@/domain/repositories/event-repository';

// Só deve ser chamado pela visão de operador (`/internal/events`).
export async function listEvents(eventRepository: EventRepository): Promise<Event[]> {
  return eventRepository.listAll();
}
