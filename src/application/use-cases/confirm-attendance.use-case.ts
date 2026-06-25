import { z } from 'zod';

import type { RsvpRepository, RsvpUpsertResult } from '@/domain/repositories/rsvp-repository';

const confirmAttendanceInputSchema = z.object({
  eventId: z.string().uuid(),
  guestName: z.string().min(2),
  companionCount: z.number().int().nonnegative(),
  // Normaliza pra só dígitos antes de validar — assim "(86) 99916-7437" e
  // "86999167437" chegam no mesmo valor no banco, onde whatsapp_number é
  // chave única (regra de negócio #6 do domain model).
  whatsappNumber: z
    .string()
    .transform((value) => value.replace(/\D/g, ''))
    .pipe(z.string().regex(/^\d{10,11}$/, 'Whatsapp deve ter DDD + número (10 ou 11 dígitos).')),
  confirmUpdate: z.boolean().default(false),
});

export type ConfirmAttendanceInput = z.infer<typeof confirmAttendanceInputSchema>;

export async function confirmAttendance(
  rsvpRepository: RsvpRepository,
  input: ConfirmAttendanceInput,
): Promise<RsvpUpsertResult> {
  const parsed = confirmAttendanceInputSchema.parse(input);
  return rsvpRepository.upsert(parsed);
}
