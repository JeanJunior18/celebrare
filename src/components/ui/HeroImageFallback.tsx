import { HeartDivider } from '@/components/ui/SectionContainer';

export interface HeroImageFallbackProps {
  honoreeName: string;
}

// "Ana & João", "Ana e João", "Ana and João" ou "Ana + João" -> monograma
// de casal ("A & J"); qualquer outro nome cai pra uma inicial só.
function getInitials(honoreeName: string): string {
  const names = honoreeName
    .split(/\s*(?:&|\+|\/|\be\b|\band\b)\s*/i)
    .map((name) => name.trim())
    .filter(Boolean);

  if (names.length < 2) return honoreeName.trim().charAt(0).toUpperCase() || '♡';

  return `${names[0].charAt(0).toUpperCase()} & ${names[names.length - 1].charAt(0).toUpperCase()}`;
}

export function HeroImageFallback({ honoreeName }: HeroImageFallbackProps) {
  const initials = getInitials(honoreeName);
  const isCouple = initials.length > 1;

  return (
    <div
      className="relative flex h-full w-full items-center justify-center"
      style={{
        background:
          'linear-gradient(135deg, var(--color-whimsy-sky) 0%, var(--color-background) 55%, var(--color-whimsy-mint) 100%)',
      }}
    >
      <div
        aria-hidden
        className="animate-float-soft absolute -top-6 -left-6 h-24 w-24 rounded-full opacity-50 blur-2xl"
        style={{ background: 'var(--color-whimsy-pink)' }}
      />
      <div
        aria-hidden
        className="animate-float-soft absolute -right-6 -bottom-8 h-28 w-28 rounded-full opacity-50 blur-2xl [animation-delay:-3.5s]"
        style={{ background: 'var(--color-whimsy-yellow)' }}
      />
      <div aria-hidden className="absolute inset-3 rounded-[2rem] border-2 border-dashed border-primary-300/40" />

      <div className="relative flex flex-col items-center gap-2">
        <div className="flex h-20 w-20 items-center justify-center rounded-full border border-primary-200/70 bg-surface/85 shadow-card backdrop-blur-sm lg:h-24 lg:w-24">
          <span
            className={`font-script leading-none text-primary-700 ${
              isCouple ? 'text-2xl lg:text-3xl' : 'text-5xl lg:text-6xl'
            }`}
          >
            {initials}
          </span>
        </div>
        <HeartDivider />
      </div>
    </div>
  );
}
