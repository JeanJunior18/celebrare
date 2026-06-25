export interface ThemeColorTokens {
  primary: Record<'50' | '100' | '200' | '300' | '400' | '500' | '600' | '700' | '800' | '900', string>;
  secondary: Record<'100' | '300' | '500' | '700', string>;
  whimsy: Record<'pink' | 'yellow' | 'sky' | 'mint', string>;
  background: string;
  surface: string;
  ink: string;
  inkSoft: string;
  accentForeground: string;
}

export interface ThemeDefaultCopy {
  nav: { brand: string; links: { href: string; label: string }[] };
  hero: { eyebrow: string; intro: string; titlePrefix: string; tagline: string };
  rsvp: { title: string; subtitle: string };
  giftRegistry: {
    title: string;
    subtitle: string;
    description: string;
    pixCardTitle: string;
    pixCardSubtitle: string;
  };
  gallery: { title: string };
  guestbook: { title: string; subtitle: string };
  footer: { signoff: string };
}

export interface Theme {
  id: string;
  slug: string;
  name: string;
  colorTokens: ThemeColorTokens;
  defaultCopy: ThemeDefaultCopy;
  defaultIllustrationUrl: string | null;
}
