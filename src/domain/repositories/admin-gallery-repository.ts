import type { GalleryPhoto } from '@/domain/entities/gallery-photo';

export interface AdminGalleryRepository {
  createPhoto(input: {
    eventId: string;
    description: string;
    displayOrder: number;
    image: File;
  }): Promise<GalleryPhoto>;
  getNextDisplayOrder(eventId: string): Promise<number>;
}
