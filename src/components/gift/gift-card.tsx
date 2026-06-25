'use client';

import Image from 'next/image';
import type { ReactNode } from 'react';
import { useOptimistic, useState, useTransition } from 'react';

import { claimDiaperPackAction, claimRegistryItemAction } from '@/app/actions/gift.actions';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import type { GiftItem } from '@/domain/entities/gift-item';
import { GiftCategory } from '@/domain/enums/gift-category';
import { GiftStatus } from '@/domain/enums/gift-status';

export interface GiftCardProps {
  item: GiftItem;
  eventId: string;
}

interface GiftClaimStrategy {
  ctaLabel: string;
  claimedLabel: string;
  categoryLabel: string;
  claim: (formData: FormData) => Promise<{ success: boolean; message?: string }>;
  renderExtraFields?: () => ReactNode;
}

const claimStrategyByCategory: Record<GiftCategory, GiftClaimStrategy> = {
  [GiftCategory.REGISTRY_ITEM]: {
    ctaLabel: 'Quero dar esse presente',
    claimedLabel: 'Já reservado, obrigado!',
    categoryLabel: 'Lista de presentes',
    claim: claimRegistryItemAction,
  },
  [GiftCategory.DIAPER_PACK]: {
    ctaLabel: 'Reservar',
    claimedLabel: 'Obrigado pela reserva!',
    categoryLabel: 'Presente',
    claim: claimDiaperPackAction,
    renderExtraFields: () => (
      <Input
        label="Quantidade"
        name="quantity"
        type="number"
        defaultValue={1}
        min={1}
        inputMode="numeric"
      />
    ),
  },
};

function GiftThumbnail({ item, onOpen }: { item: GiftItem; onOpen: () => void }) {
  if (!item.imageUrl) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-primary-50 text-3xl text-primary-300">
        🎁
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={onOpen}
      aria-label={`Ver foto de ${item.name} em tamanho grande`}
      className="relative block h-full w-full cursor-zoom-in"
    >
      <Image
        src={item.imageUrl}
        alt={item.name}
        fill
        className="object-cover transition-transform duration-300 hover:scale-105"
        sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
      />
    </button>
  );
}

export function GiftCard({ item, eventId }: GiftCardProps) {
  const strategy = claimStrategyByCategory[item.category];
  const [confirmedItem, setConfirmedItem] = useState(item);
  const [optimisticItem, setOptimisticItem] = useOptimistic(confirmedItem);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  const isClaimed = optimisticItem.status !== GiftStatus.AVAILABLE;

  function handleSubmit(formData: FormData) {
    formData.set('eventId', eventId);
    formData.set('giftItemId', item.id);
    setFeedback(null);

    startTransition(async () => {
      setOptimisticItem({ ...item, status: GiftStatus.CLAIMED });

      const result = await strategy.claim(formData);

      if (result.success) {
        setConfirmedItem({ ...item, status: GiftStatus.CLAIMED });
      } else {
        setFeedback(result.message ?? 'Não foi possível reservar esse item.');
      }
    });
  }

  return (
    <Card className="flex flex-col gap-3">
      <div className="relative -m-6 mb-0 aspect-square overflow-hidden rounded-t-2xl">
        <GiftThumbnail item={item} onOpen={() => setIsLightboxOpen(true)} />
        <Badge className="absolute top-3 left-3 shadow-card">{strategy.categoryLabel}</Badge>
      </div>

      <div className="flex items-start justify-between gap-3 pt-1">
        <div>
          <h3 className="font-display text-lg text-primary-700">{item.name}</h3>
          {item.sizeLabel && (
            <Badge variant="outline" className="mt-1">
              {item.sizeLabel}
            </Badge>
          )}
        </div>
      </div>

      {item.description && <p className="font-body text-sm text-ink-soft">{item.description}</p>}

      {isClaimed ? (
        <div className="flex flex-col gap-3">
          <p className="font-body text-sm font-semibold text-primary-700">{strategy.claimedLabel}</p>
          {item.purchaseUrl && (
            <a
              href={item.purchaseUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-full border border-primary-300 bg-surface px-6 py-3 font-body text-sm font-semibold uppercase tracking-wide text-primary-700 transition-colors hover:bg-primary-50"
            >
              Comprar
            </a>
          )}
        </div>
      ) : (
        <form action={handleSubmit} className="flex flex-col gap-3">
          <Input label="Seu nome" name="guestName" placeholder="Digite seu nome" required minLength={2} />
          {strategy.renderExtraFields?.()}
          <div className="flex gap-3">
            <Button type="submit" disabled={isPending} className="flex-1">
              {isPending ? 'Reservando…' : strategy.ctaLabel}
            </Button>
            {item.purchaseUrl && (
              <a
                href={item.purchaseUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex flex-1 items-center justify-center gap-2 rounded-full border border-primary-300 bg-surface px-6 py-3 font-body text-sm font-semibold uppercase tracking-wide text-primary-700 transition-colors hover:bg-primary-50"
              >
                Comprar
              </a>
            )}
          </div>
          {feedback && <p className="font-body text-sm text-secondary-700">{feedback}</p>}
        </form>
      )}

      {isLightboxOpen && item.imageUrl && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={item.name}
          onClick={() => setIsLightboxOpen(false)}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-6"
        >
          <button
            type="button"
            aria-label="Fechar"
            onClick={() => setIsLightboxOpen(false)}
            className="absolute top-4 right-4 flex h-10 w-10 items-center justify-center rounded-full bg-surface text-lg text-primary-700"
          >
            ✕
          </button>
          {/* eslint-disable-next-line @next/next/no-img-element -- overlay de tamanho variável, sem necessidade de otimização do next/image */}
          <img
            src={item.imageUrl}
            alt={item.name}
            className="max-h-full max-w-full rounded-2xl object-contain"
            onClick={(event) => event.stopPropagation()}
          />
        </div>
      )}
    </Card>
  );
}
