import Image from 'next/image';
import { Badge } from '@/components/ui/Badge';
import { HeroImageFallback } from '@/components/ui/HeroImageFallback';
import { HeartDivider } from '@/components/ui/SectionContainer';
import { resolveEventCopy, type Event } from '@/domain/entities/event';

export interface HeroSectionProps {
  event: Event;
}

export function HeroSection({ event }: HeroSectionProps) {
  const { eyebrow, intro, titlePrefix, tagline } = resolveEventCopy(event).hero;
  const imageUrl = event.heroImageUrl ?? event.theme.defaultIllustrationUrl;

  return (
    <section id="inicio" className="relative w-full overflow-hidden px-6 pt-20 pb-16 md:pt-28 md:pb-24">
      <div
        aria-hidden
        className="pointer-events-none absolute -top-24 right-[-20%] h-72 w-72 rounded-full opacity-40 blur-3xl lg:h-96 lg:w-96"
        style={{
          background:
            'radial-gradient(circle, var(--color-whimsy-sky), var(--color-whimsy-mint) 45%, transparent 70%)',
        }}
      />

      <div className="relative mx-auto flex max-w-xl flex-col items-center text-center lg:max-w-5xl lg:flex-row lg:items-center lg:gap-16 lg:text-left">
        <div className="flex flex-col items-center lg:items-start">
          <p className="font-body text-xs font-semibold uppercase tracking-[0.2em] text-primary-600">
            {eyebrow}
          </p>
          <p className="mt-3 max-w-md font-body text-base leading-relaxed text-ink-soft lg:order-2 lg:mt-6">
            {intro}
          </p>

          <h1 className="mt-3 font-display text-3xl uppercase tracking-[0.1em] text-primary-700 lg:order-1 lg:mt-0 lg:text-4xl">
            {titlePrefix}
          </h1>
          <p className="font-script text-6xl leading-none text-primary-700 lg:order-1 lg:text-7xl">
            {event.honoreeName}
          </p>

          <Badge className="mt-4 px-5 py-2 text-base lg:order-1">{event.subtitleLabel}</Badge>

          <div className="mt-4 lg:order-1">
            <HeartDivider />
          </div>

          <p className="mt-4 max-w-xs font-script text-2xl text-primary-600 lg:order-3 lg:mt-6">{tagline}</p>
        </div>

        <div className="relative mt-10 h-48 w-full max-w-sm overflow-hidden rounded-[2.5rem] border border-primary-200/60 shadow-card lg:mt-0 lg:h-80 lg:flex-1">
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt={`Foto de ${event.honoreeName}`}
              fill
              sizes="(min-width: 1024px) 50vw, 100vw"
              className="object-cover object-top"
              priority
            />
          ) : (
            <HeroImageFallback honoreeName={event.honoreeName} />
          )}
        </div>
      </div>
    </section>
  );
}
