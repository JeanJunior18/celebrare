import Image from 'next/image';

import { listGiftItems } from '@/application/use-cases/list-gift-items.use-case';
import { CopyPixKey } from '@/components/gift/copy-pix-key';
import { GiftGallery } from '@/components/gift/gift-gallery';
import { Card } from '@/components/ui/Card';
import { SectionContainer } from '@/components/ui/SectionContainer';
import { resolveEventCopy, type Event } from '@/domain/entities/event';
import { db } from '@/infrastructure/postgres/client';
import { PostgresGiftRepository } from '@/infrastructure/postgres/gift-repository.postgres';

export interface GiftRegistrySectionProps {
  event: Event;
}

export async function GiftRegistrySection({ event }: GiftRegistrySectionProps) {
  const repository = new PostgresGiftRepository(db);
  const { registryItems, bulkItems } = await listGiftItems(repository, event.id);
  const allItems = [...registryItems, ...bulkItems];
  const { title, subtitle, description, pixCardTitle, pixCardSubtitle } = resolveEventCopy(event).giftRegistry;

  return (
    <SectionContainer id="presentes" title={title} subtitle={subtitle}>
      {description && (
        <p className="mb-8 max-w-xl text-center font-body text-sm italic text-ink-soft">{description}</p>
      )}

      <div className="flex w-full flex-col gap-8">
        {event.pixKey && (
          <Card whimsyAccent className="flex flex-col items-center gap-2 text-center">
            <h3 className="font-display text-lg text-primary-700">{pixCardTitle}</h3>
            <p className="font-body text-sm text-ink-soft">{pixCardSubtitle}</p>
            {event.pixQrCodeUrl && (
              <div className="relative h-40 w-40 overflow-hidden rounded-xl border border-primary-100/60 bg-white">
                <Image
                  src={event.pixQrCodeUrl}
                  alt="QR code Pix"
                  fill
                  className="object-contain p-2"
                  sizes="160px"
                />
              </div>
            )}
            <CopyPixKey pixKey={event.pixKey} />
          </Card>
        )}

        {allItems.length > 0 && <GiftGallery items={allItems} eventId={event.id} />}
      </div>
    </SectionContainer>
  );
}
