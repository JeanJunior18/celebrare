import { listGalleryPhotos } from '@/application/use-cases/list-gallery-photos.use-case';
import { GalleryCarousel } from '@/components/sections/gallery-carousel';
import { SectionContainer } from '@/components/ui/SectionContainer';
import type { Event } from '@/domain/entities/event';
import { db } from '@/infrastructure/postgres/client';
import { PostgresGalleryRepository } from '@/infrastructure/postgres/gallery-repository.postgres';

export interface GallerySectionProps {
  event: Event;
}

export async function GallerySection({ event }: GallerySectionProps) {
  const repository = new PostgresGalleryRepository(db);
  const photos = await listGalleryPhotos(repository, event.id);

  if (photos.length === 0) {
    return null;
  }

  return (
    <SectionContainer id="galeria" title={event.theme.defaultCopy.gallery.title}>
      <GalleryCarousel photos={photos} />
    </SectionContainer>
  );
}
