import type { Rsvp } from '@/domain/entities/rsvp';
import type { RsvpRepository } from '@/domain/repositories/rsvp-repository';

export interface ListRsvpsResult {
  rsvps: Rsvp[];
  totalConfirmed: number;
}

export async function listRsvps(rsvpRepository: RsvpRepository, eventId: string): Promise<ListRsvpsResult> {
  const rsvps = await rsvpRepository.listAll(eventId);
  const totalConfirmed = rsvps.reduce((total, rsvp) => total + 1 + rsvp.companionCount, 0);

  return { rsvps, totalConfirmed };
}
