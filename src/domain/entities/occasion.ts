export interface OccasionDefaultCopy {
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

export interface Occasion {
  id: string;
  slug: string;
  name: string;
  defaultCopy: OccasionDefaultCopy;
}
