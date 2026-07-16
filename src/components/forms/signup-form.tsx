'use client';

import { useActionState } from 'react';

import { registerHostAction } from '@/app/actions/auth.actions';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';

export function SignupForm() {
  const [state, formAction, isPending] = useActionState(registerHostAction, null);

  return (
    <Card whimsyAccent className="w-full max-w-md">
      <form action={formAction} className="flex flex-col gap-5">
        <Input label="Nome" name="name" placeholder="Digite seu nome" minLength={2} />
        <Input label="Email" name="email" type="email" placeholder="voce@email.com" required />
        <Input label="Senha" name="password" type="password" required minLength={8} />

        <Button type="submit" disabled={isPending} className="w-full">
          {isPending ? 'Criando conta…' : 'Criar conta'}
        </Button>

        {state?.message && <p className="font-body text-sm text-secondary-700">{state.message}</p>}
      </form>
    </Card>
  );
}
