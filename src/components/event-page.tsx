import { FooterSection } from '@/components/sections/footer-section';
import { GallerySection } from '@/components/sections/gallery-section';
import { GiftRegistrySection } from '@/components/sections/gift-registry-section';
import { GuestbookSection } from '@/components/sections/guestbook-section';
import { HeroSection } from '@/components/sections/hero-section';
import { InfoCardsSection } from '@/components/sections/info-cards-section';
import { NavBar } from '@/components/sections/nav-bar';
import { RsvpSection } from '@/components/sections/rsvp-section';
import { themeCssVariables } from '@/components/theme-css-variables';
import type { Event } from '@/domain/entities/event';

export interface EventPageProps {
  event: Event;
}

// Composição compartilhada por `app/page.tsx` (evento do Davi, slug fixo) e
// `app/e/[slug]/page.tsx` (qualquer evento) — mesmo conteúdo, parametrizado
// por `event` em vez do antigo `eventConfig` hardcoded (docs/saas-platform-plan.md, fase 7).
export function EventPage({ event }: EventPageProps) {
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: themeCssVariables(event.theme) }} />
      <NavBar event={event} />
      <main className="flex flex-1 flex-col">
        <HeroSection event={event} />
        <InfoCardsSection event={event} />
        <RsvpSection event={event} />
        <GiftRegistrySection event={event} />
        <GallerySection event={event} />
        <GuestbookSection event={event} />
        <FooterSection event={event} />
      </main>
    </>
  );
}
