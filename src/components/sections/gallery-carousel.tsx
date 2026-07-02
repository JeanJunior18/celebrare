'use client';

import Image from 'next/image';
import { useRef } from 'react';

import type { GalleryPhoto } from '@/domain/entities/gallery-photo';

export interface GalleryCarouselProps {
  photos: GalleryPhoto[];
}

export function GalleryCarousel({ photos }: GalleryCarouselProps) {
  const scrollerRef = useRef<HTMLDivElement>(null);

  function scrollByCard(direction: 1 | -1) {
    scrollerRef.current?.scrollBy({ left: direction * 220, behavior: 'smooth' });
  }

  return (
    <div className="relative w-full">
      <div
        ref={scrollerRef}
        className="flex w-full snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth pb-2"
      >
        {photos.map((photo) => (
          <figure
            key={photo.id}
            className="flex w-44 shrink-0 snap-start flex-col items-center gap-2 md:w-52"
          >
            <div className="relative h-44 w-44 overflow-hidden rounded-2xl border border-primary-100/60 shadow-card md:h-52 md:w-52">
              <Image
                src={photo.imageUrl}
                alt={photo.description}
                fill
                className="object-cover"
                sizes="(min-width: 768px) 13rem, 11rem"
              />
            </div>
            <figcaption className="font-body text-xs font-semibold uppercase tracking-wide text-primary-700">
              {photo.description}
            </figcaption>
          </figure>
        ))}
      </div>

      <button
        type="button"
        aria-label="Foto anterior"
        onClick={() => scrollByCard(-1)}
        className="absolute top-1/2 left-0 hidden -translate-x-3 -translate-y-1/2 rounded-full bg-surface p-2 shadow-card md:flex"
      >
        ‹
      </button>
      <button
        type="button"
        aria-label="Próxima foto"
        onClick={() => scrollByCard(1)}
        className="absolute top-1/2 right-0 hidden translate-x-3 -translate-y-1/2 rounded-full bg-surface p-2 shadow-card md:flex"
      >
        ›
      </button>
    </div>
  );
}
