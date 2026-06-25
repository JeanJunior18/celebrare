import type { Theme } from '@/domain/entities/theme';

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
  theme: Theme;
}
