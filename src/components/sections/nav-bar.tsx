'use client';

import { useState } from 'react';

import { BoatIcon } from '@/components/ui/BoatIcon';
import type { Event } from '@/domain/entities/event';

export interface NavBarProps {
  event: Event;
}

export function NavBar({ event }: NavBarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { brand, links: navLinks } = event.theme.defaultCopy.nav;

  return (
    <header className="sticky top-0 z-50 w-full border-b border-primary-100/60 bg-background/90 backdrop-blur">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-3">
        <a href="#inicio" className="flex items-center gap-2 font-display text-sm uppercase tracking-[0.15em] text-primary-700">
          <BoatIcon className="h-5 w-5" />
          {brand}
        </a>

        <nav className="hidden items-center gap-6 md:flex">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="font-body text-xs font-semibold uppercase tracking-wide text-primary-700 transition-colors hover:text-primary-900"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <button
          type="button"
          aria-label={isOpen ? 'Fechar menu' : 'Abrir menu'}
          aria-expanded={isOpen}
          onClick={() => setIsOpen((open) => !open)}
          className="flex h-9 w-9 items-center justify-center rounded-full text-primary-700 md:hidden"
        >
          {isOpen ? '✕' : '☰'}
        </button>
      </div>

      {isOpen && (
        <nav className="flex flex-col gap-1 border-t border-primary-100/60 bg-background px-6 py-4 md:hidden">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={() => setIsOpen(false)}
              className="rounded-lg px-2 py-2 font-body text-sm font-semibold uppercase tracking-wide text-primary-700 hover:bg-primary-50"
            >
              {link.label}
            </a>
          ))}
        </nav>
      )}
    </header>
  );
}
