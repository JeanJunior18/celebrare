import { listGalleryPhotos } from '@/application/use-cases/list-gallery-photos.use-case';
import { GalleryCarousel } from '@/components/sections/gallery-carousel';
import { SectionContainer } from '@/components/ui/SectionContainer';
import { db } from '@/infrastructure/postgres/client';
import { PostgresGalleryRepository } from '@/infrastructure/postgres/gallery-repository.postgres';

export async function GallerySection() {
  const repository = new PostgresGalleryRepository(db);
  const photos = await listGalleryPhotos(repository);

  if (photos.length === 0) {
    return null;
  }

  return (
    <SectionContainer id="galeria" title="Um ano de aventuras">
      <GalleryCarousel photos={photos} />
    </SectionContainer>
  );
}
