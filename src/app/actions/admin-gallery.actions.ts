'use server';

import { revalidatePath } from 'next/cache';

import { createGalleryPhoto } from '@/application/use-cases/create-gallery-photo.use-case';
import { getNextGalleryDisplayOrder } from '@/application/use-cases/get-next-gallery-display-order.use-case';
import type { BabyAgeStage } from '@/domain/enums/baby-age-stage';
import { db } from '@/infrastructure/postgres/client';
import { PostgresAdminGalleryRepository } from '@/infrastructure/postgres/admin-gallery-repository.postgres';
import { createSecretServerClient } from '@/infrastructure/supabase/secret-server-client';

export interface AdminGalleryActionResult {
  success: boolean;
  message?: string;
}

export async function getNextGalleryDisplayOrderAction(): Promise<number> {
  const repository = new PostgresAdminGalleryRepository(db, createSecretServerClient());
  return getNextGalleryDisplayOrder(repository);
}

export async function createGalleryPhotoAction(
  _prevState: AdminGalleryActionResult | null,
  formData: FormData,
): Promise<AdminGalleryActionResult> {
  try {
    const repository = new PostgresAdminGalleryRepository(db, createSecretServerClient());

    await createGalleryPhoto(repository, {
      ageLabel: formData.get('ageLabel') as BabyAgeStage,
      displayOrder: Number(formData.get('displayOrder') ?? 0),
      image: formData.get('image') as File,
    });

    revalidatePath('/');
    return { success: true };
  } catch (error) {
    return { success: false, message: error instanceof Error ? error.message : 'Erro inesperado.' };
  }
}
