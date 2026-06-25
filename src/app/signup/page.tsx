import Link from 'next/link';

import { BrandMark } from '@/components/brand-mark';
import { SignupForm } from '@/components/forms/signup-form';
import { SectionContainer } from '@/components/ui/SectionContainer';

export default function SignupPage() {
  return (
    <main className="flex flex-1 flex-col">
      <BrandMark />
      <SectionContainer title="Criar conta" subtitle="Cadastre-se pra criar e gerenciar seu evento.">
        <SignupForm />
        <p className="mt-6 font-body text-sm text-ink-soft">
          Já tem conta?{' '}
          <Link href="/login" className="font-semibold text-primary-700 underline">
            Entrar
          </Link>
        </p>
      </SectionContainer>
    </main>
  );
}
