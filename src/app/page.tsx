import Link from 'next/link';

import { BrandMark } from '@/components/brand-mark';
import { PlatformShell } from '@/components/platform-shell';
import { SectionContainer } from '@/components/ui/SectionContainer';

// Placeholder até a landing page de verdade ser construída — a raiz
// deixou de servir um evento fixo (docs/saas-platform-plan.md). Sem
// leitura de banco, então pode ser estática; metadata vem do fallback
// genérico em app/layout.tsx.
export default function Home() {
  return (
    <PlatformShell>
      <main className="flex flex-1 flex-col">
        <BrandMark />
        <SectionContainer
          title="Celebrare"
          subtitle="Sua página de convite e confirmação de presença, em breve por aqui."
        >
          <p className="font-body text-sm text-ink-soft">
            Já tem uma conta?{' '}
            <Link href="/login" className="font-semibold text-primary-700 underline">
              Entrar
            </Link>
          </p>
        </SectionContainer>
      </main>
    </PlatformShell>
  );
}
