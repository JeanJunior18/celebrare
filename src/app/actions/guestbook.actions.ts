'use server';

import { leaveGuestbookMessage } from '@/application/use-cases/leave-guestbook-message.use-case';
import { db } from '@/infrastructure/postgres/client';
import { PostgresGuestbookRepository } from '@/infrastructure/postgres/guestbook-repository.postgres';

export interface GuestbookActionResult {
  success: boolean;
  message?: string;
}

export async function leaveMessageAction(
  _prevState: GuestbookActionResult | null,
  formData: FormData,
): Promise<GuestbookActionResult> {
  try {
    const repository = new PostgresGuestbookRepository(db);

    await leaveGuestbookMessage(repository, {
      guestName: String(formData.get('guestName') ?? ''),
      message: String(formData.get('message') ?? ''),
    });

    return { success: true };
  } catch (error) {
    return { success: false, message: error instanceof Error ? error.message : 'Erro inesperado.' };
  }
}
