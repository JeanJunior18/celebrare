import type { Theme, ThemeDefaultCopy } from '@/domain/entities/theme';

// Hero nunca entra aqui — não pode ser omitido da página pública.
export type SectionKey = 'rsvp' | 'giftRegistry' | 'location' | 'gallery' | 'guestbook';
export type SectionVisibility = Record<SectionKey, boolean>;

// Subconjunto restrito de ThemeDefaultCopy que o host pode sobrescrever por
// evento — o resto do copy do tema continua compartilhado por todos os
// eventos daquele tema (ver resolveEventCopy abaixo).
export interface EventCopyOverrides {
  nav?: { brand?: string };
  hero?: { eyebrow?: string; titlePrefix?: string; intro?: string };
  rsvp?: { subtitle?: string };
  giftRegistry?: { subtitle?: string; description?: string };
  gallery?: { title?: string };
  guestbook?: { subtitle?: string };
  footer?: { signoff?: string };
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

// O copy padrão de um tema é compartilhado por todos os eventos daquele
// tema (ex: todo evento BIRTHDAY parte do mesmo texto genérico) e pode
// referenciar o homenageado via placeholder literal `{name}`, substituído
// aqui pelo `honoreeName` do evento — mesma ideia de hero.titlePrefix +
// event.honoreeName, só que embutida no texto em vez de renderizada em
// dois nós separados.
function interpolateCopy(defaultCopy: ThemeDefaultCopy, honoreeName: string): ThemeDefaultCopy {
  const escapedName = JSON.stringify(honoreeName).slice(1, -1);
  return JSON.parse(JSON.stringify(defaultCopy).replaceAll('{name}', escapedName));
}

// Cada seção lê o copy resolvido daqui em vez de event.theme.defaultCopy
// direto, pra respeitar o override por evento e a interpolação de
// `{name}` sem perder o resto do copy do tema.
export function resolveEventCopy(event: Event): ThemeDefaultCopy {
  const defaultCopy = interpolateCopy(event.theme.defaultCopy, event.honoreeName);
  const overrides = event.copyOverrides;

  return {
    ...defaultCopy,
    nav: { ...defaultCopy.nav, brand: overrides.nav?.brand ?? defaultCopy.nav.brand },
    hero: {
      ...defaultCopy.hero,
      eyebrow: overrides.hero?.eyebrow ?? defaultCopy.hero.eyebrow,
      titlePrefix: overrides.hero?.titlePrefix ?? defaultCopy.hero.titlePrefix,
      intro: overrides.hero?.intro ?? defaultCopy.hero.intro,
    },
    rsvp: { ...defaultCopy.rsvp, subtitle: overrides.rsvp?.subtitle ?? defaultCopy.rsvp.subtitle },
    giftRegistry: {
      ...defaultCopy.giftRegistry,
      subtitle: overrides.giftRegistry?.subtitle ?? defaultCopy.giftRegistry.subtitle,
      description: overrides.giftRegistry?.description ?? defaultCopy.giftRegistry.description,
    },
    gallery: { ...defaultCopy.gallery, title: overrides.gallery?.title ?? defaultCopy.gallery.title },
    guestbook: { ...defaultCopy.guestbook, subtitle: overrides.guestbook?.subtitle ?? defaultCopy.guestbook.subtitle },
    footer: { ...defaultCopy.footer, signoff: overrides.footer?.signoff ?? defaultCopy.footer.signoff },
  };
}
