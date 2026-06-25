'use server';

import { createGiftItem } from '@/application/use-cases/create-gift-item.use-case';
import type { GiftCategory } from '@/domain/enums/gift-category';
import { fetchOpenGraphMetadata } from '@/infrastructure/http/open-graph-metadata';
import { db } from '@/infrastructure/postgres/client';
import { PostgresAdminGiftRepository } from '@/infrastructure/postgres/admin-gift-repository.postgres';
import { createMediaStorage } from '@/infrastructure/storage/s3-media-storage';

export interface AdminGiftActionResult {
  success: boolean;
  message?: string;
}

export async function createGiftItemAction(
  _prevState: AdminGiftActionResult | null,
  formData: FormData,
): Promise<AdminGiftActionResult> {
  try {
    const repository = new PostgresAdminGiftRepository(db, createMediaStorage());

    const imageField = formData.get('image');
    const image = imageField instanceof File && imageField.size > 0 ? imageField : undefined;

    await createGiftItem(repository, {
      name: String(formData.get('name') ?? ''),
      description: formData.get('description')?.toString() || undefined,
      category: formData.get('category') as GiftCategory,
      sizeLabel: formData.get('sizeLabel')?.toString() || undefined,
      quantityNeeded: Number(formData.get('quantityNeeded') ?? 1),
      purchaseUrl: formData.get('purchaseUrl')?.toString() || undefined,
      image,
      imageUrl: formData.get('imageUrl')?.toString() || undefined,
    });

    return { success: true };
  } catch (error) {
    return { success: false, message: error instanceof Error ? error.message : 'Erro inesperado.' };
  }
}

export interface GiftLinkMetadataResult {
  success: boolean;
  name?: string;
  description?: string;
  imageUrl?: string;
  message?: string;
}

export async function fetchGiftLinkMetadataAction(url: string): Promise<GiftLinkMetadataResult> {
  try {
    const metadata = await fetchOpenGraphMetadata(url);
    return { success: true, ...metadata };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Não foi possível buscar os dados desse link.',
    };
  }
}
