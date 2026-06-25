'use server';

import { claimDiaperPack } from '@/application/use-cases/claim-diaper-pack.use-case';
import { claimRegistryItem } from '@/application/use-cases/claim-registry-item.use-case';
import { db } from '@/infrastructure/postgres/client';
import { PostgresGiftRepository } from '@/infrastructure/postgres/gift-repository.postgres';

export interface GiftActionResult {
  success: boolean;
  message?: string;
}

export async function claimRegistryItemAction(formData: FormData): Promise<GiftActionResult> {
  try {
    const repository = new PostgresGiftRepository(db);

    const result = await claimRegistryItem(repository, {
      eventId: String(formData.get('eventId') ?? ''),
      giftItemId: String(formData.get('giftItemId') ?? ''),
      guestName: String(formData.get('guestName') ?? ''),
      guestWhatsapp: formData.get('guestWhatsapp')?.toString() || undefined,
    });

    if (!result.success) {
      return { success: false, message: 'Esse item já foi reservado por outra pessoa.' };
    }

    return { success: true };
  } catch (error) {
    return { success: false, message: error instanceof Error ? error.message : 'Erro inesperado.' };
  }
}

export async function claimDiaperPackAction(formData: FormData): Promise<GiftActionResult> {
  try {
    const repository = new PostgresGiftRepository(db);

    await claimDiaperPack(repository, {
      eventId: String(formData.get('eventId') ?? ''),
      giftItemId: String(formData.get('giftItemId') ?? ''),
      guestName: String(formData.get('guestName') ?? ''),
      guestWhatsapp: formData.get('guestWhatsapp')?.toString() || undefined,
      quantity: Number(formData.get('quantity') ?? 0),
    });

    return { success: true };
  } catch (error) {
    return { success: false, message: error instanceof Error ? error.message : 'Erro inesperado.' };
  }
}
