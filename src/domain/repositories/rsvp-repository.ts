import type { Rsvp } from '@/domain/entities/rsvp';

export type RsvpUpsertResult =
  | { status: 'CREATED' }
  | { status: 'UPDATED' }
  | { status: 'ALREADY_EXISTS'; guestName: string; companionCount: number };

export interface RsvpRepository {
  upsert(input: {
    eventId: string;
    guestName: string;
    companionCount: number;
    whatsappNumber: string;
    confirmUpdate: boolean;
  }): Promise<RsvpUpsertResult>;
  // só deve ser chamado por código autenticado de host/operador, nunca por convidado.
  listAll(eventId: string): Promise<Rsvp[]>;
  // escopado por eventId pra um host nunca conseguir mexer no rsvp de outro evento.
  delete(id: string, eventId: string): Promise<void>;
  updateCompanionCount(id: string, eventId: string, companionCount: number): Promise<void>;
}
