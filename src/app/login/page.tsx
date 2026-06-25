import Link from 'next/link';

import { BrandMark } from '@/components/brand-mark';
import { LoginForm } from '@/components/forms/login-form';
import { SectionContainer } from '@/components/ui/SectionContainer';

export default function LoginPage() {
  return (
    <main className="flex flex-1 flex-col">
      <BrandMark />
      <SectionContainer title="Entrar" subtitle="Acesse sua conta de host.">
        <LoginForm />
        <p className="mt-6 font-body text-sm text-ink-soft">
          Ainda não tem conta?{' '}
          <Link href="/signup" className="font-semibold text-primary-700 underline">
            Criar conta
          </Link>
        </p>
      </SectionContainer>
    </main>
  );
}
