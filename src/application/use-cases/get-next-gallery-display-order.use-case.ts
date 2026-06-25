import type { AdminGalleryRepository } from '@/domain/repositories/admin-gallery-repository';

export async function getNextGalleryDisplayOrder(
  repository: AdminGalleryRepository,
  eventId: string,
): Promise<number> {
  return repository.getNextDisplayOrder(eventId);
}
