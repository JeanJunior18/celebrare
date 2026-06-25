import { RsvpForm } from '@/components/forms/rsvp-form';
import { SectionContainer } from '@/components/ui/SectionContainer';
import type { Event } from '@/domain/entities/event';

export interface RsvpSectionProps {
  event: Event;
}

export function RsvpSection({ event }: RsvpSectionProps) {
  const { title, subtitle } = event.theme.defaultCopy.rsvp;

  return (
    <SectionContainer id="presenca" title={title} subtitle={subtitle}>
      <RsvpForm eventId={event.id} />
    </SectionContainer>
  );
}
