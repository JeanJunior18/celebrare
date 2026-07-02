import type { Metadata } from 'next';

import type { Event } from '@/domain/entities/event';

// Metadata (title/OG/Twitter) por evento — antes hardcoded pro Davi em
// app/layout.tsx; agora cada página (`/` e `/e/[slug]`) gera a sua via
// `generateMetadata` chamando isso depois de buscar o evento
// (docs/saas-platform-plan.md, fase 7). URLs relativas aqui são resolvidas
// contra `metadataBase` (app/layout.tsx).
export function buildEventMetadata(event: Event): Metadata {
  const { titlePrefix } = event.theme.defaultCopy.hero;
  const title = `${titlePrefix} ${event.honoreeName} — ${event.subtitleLabel}`;
  const description = `Convite e confirmação de presença para ${titlePrefix} ${event.honoreeName}.`;
  const rawImageUrl = event.heroImageUrl ?? event.theme.defaultIllustrationUrl;
  const imageUrl = rawImageUrl
    ? `/_next/image?url=${encodeURIComponent(rawImageUrl)}&w=1200&q=75`
    : undefined;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      siteName: 'Celebrare',
      type: 'website',
      url: `/e/${event.slug}`,
      ...(imageUrl ? { images: [{ url: imageUrl, alt: event.honoreeName }] } : {}),
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      ...(imageUrl ? { images: [imageUrl] } : {}),
    },
  };
}
