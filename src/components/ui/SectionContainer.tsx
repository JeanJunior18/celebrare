import type { HTMLAttributes, ReactNode } from 'react';

export interface SectionContainerProps extends HTMLAttributes<HTMLElement> {
  title?: string;
  subtitle?: ReactNode;
}

export function HeartDivider() {
  return (
    <svg
      aria-hidden
      viewBox="0 0 24 24"
      className="h-4 w-4 fill-primary-500"
    >
      <path d="M12 21s-7.5-4.6-10.2-9.3C.3 9.1 1.2 5.7 4.3 4.7c2-.6 4 .2 5.2 1.9C10.7 5 12.7 4.1 14.7 4.7c3.1 1 4 4.4 2.5 7-2.7 4.7-10.2 9.3-10.2 9.3z" />
    </svg>
  );
}

export function SectionContainer({
  title,
  subtitle,
  className = '',
  children,
  ...rest
}: SectionContainerProps) {
  return (
    <section className={`w-full px-6 py-16 md:py-24 ${className}`} {...rest}>
      <div className="mx-auto flex max-w-xl flex-col items-center md:max-w-4xl">
        {title && (
          <div className="mb-10 flex flex-col items-center gap-3 text-center">
            <h2 className="font-display text-2xl uppercase tracking-[0.08em] text-primary-700 md:text-3xl">
              {title}
            </h2>
            <HeartDivider />
            {subtitle && (
              <p className="max-w-md font-body text-ink-soft">{subtitle}</p>
            )}
          </div>
        )}
        {children}
      </div>
    </section>
  );
}
