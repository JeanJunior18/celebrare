import Image from 'next/image';

import { listGiftItems } from '@/application/use-cases/list-gift-items.use-case';
import { CopyPixKey } from '@/components/gift/copy-pix-key';
import { GiftGallery } from '@/components/gift/gift-gallery';
import { Card } from '@/components/ui/Card';
import { SectionContainer } from '@/components/ui/SectionContainer';
import { eventConfig } from '@/config/event.config';
import { db } from '@/infrastructure/postgres/client';
import { PostgresGiftRepository } from '@/infrastructure/postgres/gift-repository.postgres';

export async function GiftRegistrySection() {
  const repository = new PostgresGiftRepository(db);
  const { registryItems, diaperPacks } = await listGiftItems(repository);
  const allItems = [...registryItems, ...diaperPacks];

  return (
    <SectionContainer
      id="presentes"
      title="Lista de presentes"
      subtitle="O melhor presente é ter você conosco! Mas, se quiser nos presentear, escolha como preferir:"
    >
      <p className="mb-8 max-w-xl text-center font-body text-sm italic text-ink-soft">
        Preparamos uma lista com algumas sugestões de presentes para o Davi. Ela serve apenas como inspiração: você pode comprar pelos links, escolher em outro lugar ou presentear da forma que preferir. Damos preferência a brinquedos educativos e pedagógicos, que ajudam no desenvolvimento e nas descobertas dessa fase.
      </p>

      <div className="flex w-full flex-col gap-8">
        <Card whimsyAccent className="flex flex-col items-center gap-2 text-center">
          <h3 className="font-display text-lg text-primary-700">Pix presente</h3>
          <p className="font-body text-sm text-ink-soft">Contribua com qualquer valor.</p>
          <div className="relative h-40 w-40 overflow-hidden rounded-xl border border-primary-100/60 bg-white">
            <Image
              src={eventConfig.pix.qrCodeImageUrl}
              alt="QR code Pix"
              fill
              className="object-contain p-2"
              sizes="160px"
            />
          </div>
          <CopyPixKey pixKey={eventConfig.pix.key} />
        </Card>

        {allItems.length > 0 && <GiftGallery items={allItems} />}
      </div>
    </SectionContainer>
  );
}
