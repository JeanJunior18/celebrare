import type { Theme, ThemeDefaultCopy } from '@/domain/entities/theme';

// Hero nunca entra aqui — não pode ser omitido da página pública.
export type SectionKey = 'rsvp' | 'giftRegistry' | 'location' | 'gallery' | 'guestbook';
export type SectionVisibility = Record<SectionKey, boolean>;

// Subconjunto restrito de ThemeDefaultCopy que o host pode sobrescrever por
// evento — o resto do copy do tema continua compartilhado por todos os
// eventos daquele tema (ver resolveEventCopy abaixo).
export interface EventCopyOverrides {
  hero?: { intro?: string };
  rsvp?: { subtitle?: string };
  giftRegistry?: { subtitle?: string; description?: string };
  gallery?: { title?: string };
  guestbook?: { subtitle?: string };
}

export interface Event {
  id: string;
  ownerUserId: string | null;
  slug: string;
  honoreeName: string;
  subtitleLabel: string;
  eventDate: string;
  eventTime: string;
  venueName: string;
  venueAddress: string;
  heroImageUrl: string | null;
  googleMapsUrl: string | null;
  quoteText: string | null;
  quoteReference: string | null;
  pixKey: string | null;
  pixQrCodeUrl: string | null;
  sectionVisibility: SectionVisibility;
  copyOverrides: EventCopyOverrides;
  theme: Theme;
}

// Cada seção lê o copy resolvido daqui em vez de event.theme.defaultCopy
// direto, pra respeitar o override por evento sem perder o resto do copy
// do tema (nav e footer não têm override, passam direto).
export function resolveEventCopy(event: Event): ThemeDefaultCopy {
  const { defaultCopy } = event.theme;
  const overrides = event.copyOverrides;

  return {
    ...defaultCopy,
    hero: { ...defaultCopy.hero, intro: overrides.hero?.intro ?? defaultCopy.hero.intro },
    rsvp: { ...defaultCopy.rsvp, subtitle: overrides.rsvp?.subtitle ?? defaultCopy.rsvp.subtitle },
    giftRegistry: {
      ...defaultCopy.giftRegistry,
      subtitle: overrides.giftRegistry?.subtitle ?? defaultCopy.giftRegistry.subtitle,
      description: overrides.giftRegistry?.description ?? defaultCopy.giftRegistry.description,
    },
    gallery: { ...defaultCopy.gallery, title: overrides.gallery?.title ?? defaultCopy.gallery.title },
    guestbook: { ...defaultCopy.guestbook, subtitle: overrides.guestbook?.subtitle ?? defaultCopy.guestbook.subtitle },
  };
}
