import type { Event } from '@/domain/entities/event';

export interface FooterSectionProps {
  event: Event;
}

export function FooterSection({ event }: FooterSectionProps) {
  return (
    <footer className="w-full bg-primary-700 px-6 py-10 text-center">
      {event.quoteText && (
        <p className="mx-auto max-w-md font-script text-2xl text-accent-foreground italic">
          “{event.quoteText}”
        </p>
      )}
      {event.quoteReference && (
        <p className="mt-2 font-body text-xs font-semibold uppercase tracking-wide text-primary-100">
          {event.quoteReference}
        </p>
      )}
      <p className="mt-6 font-body text-xs text-primary-200">{event.theme.defaultCopy.footer.signoff}</p>
    </footer>
  );
}
