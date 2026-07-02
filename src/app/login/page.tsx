import Link from 'next/link';
import { redirect } from 'next/navigation';

import { BrandMark } from '@/components/brand-mark';
import { LoginForm } from '@/components/forms/login-form';
import { PlatformShell } from '@/components/platform-shell';
import { SectionContainer } from '@/components/ui/SectionContainer';
import { auth } from '@/infrastructure/auth/auth';

export default async function LoginPage() {
  const session = await auth();
  if (session?.user?.id) redirect('/dashboard');

  return (
    <PlatformShell>
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
    </PlatformShell>
  );
}
