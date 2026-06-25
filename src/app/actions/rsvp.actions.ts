'use server';

import { ZodError } from 'zod';

import { confirmAttendance } from '@/application/use-cases/confirm-attendance.use-case';
import { db } from '@/infrastructure/postgres/client';
import { PostgresRsvpRepository } from '@/infrastructure/postgres/rsvp-repository.postgres';

export type RsvpActionResult =
  | { status: 'CREATED' }
  | { status: 'UPDATED' }
  | { status: 'ALREADY_EXISTS'; guestName: string; companionCount: number }
  | { status: 'ERROR'; message: string };

export async function confirmAttendanceAction(
  _prevState: RsvpActionResult | null,
  formData: FormData,
): Promise<RsvpActionResult> {
  try {
    const repository = new PostgresRsvpRepository(db);

    return await confirmAttendance(repository, {
      eventId: String(formData.get('eventId') ?? ''),
      guestName: String(formData.get('guestName') ?? ''),
      companionCount: Number(formData.get('companionCount') ?? 0),
      whatsappNumber: String(formData.get('whatsappNumber') ?? ''),
      confirmUpdate: formData.get('confirmUpdate') === 'true',
    });
  } catch (error) {
    if (error instanceof ZodError) {
      return { status: 'ERROR', message: error.issues[0]?.message ?? 'Dados inválidos.' };
    }
    return { status: 'ERROR', message: error instanceof Error ? error.message : 'Erro inesperado.' };
  }
}
