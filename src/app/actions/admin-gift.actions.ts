'use server';

import { fetchOpenGraphMetadata } from '@/infrastructure/http/open-graph-metadata';

export interface AdminGiftActionResult {
  success: boolean;
  message?: string;
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
