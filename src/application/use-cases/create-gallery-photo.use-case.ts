import { z } from 'zod';

import type { GalleryPhoto } from '@/domain/entities/gallery-photo';
import type { AdminGalleryRepository } from '@/domain/repositories/admin-gallery-repository';

const createGalleryPhotoInputSchema = z.object({
  eventId: z.string().uuid(),
  description: z.string().min(1),
  displayOrder: z.number().int().nonnegative(),
  image: z.instanceof(File),
});

export type CreateGalleryPhotoInput = z.infer<typeof createGalleryPhotoInputSchema>;

export async function createGalleryPhoto(
  repository: AdminGalleryRepository,
  input: CreateGalleryPhotoInput,
): Promise<GalleryPhoto> {
  const parsed = createGalleryPhotoInputSchema.parse(input);
  return repository.createPhoto(parsed);
}
