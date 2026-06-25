'use client';

import { useActionState } from 'react';

import { loginHostAction } from '@/app/actions/auth.actions';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';

export function LoginForm() {
  const [state, formAction, isPending] = useActionState(loginHostAction, null);

  if (state?.success) {
    return <p className="font-body text-primary-700">Login realizado! 💚</p>;
  }

  return (
    <Card whimsyAccent className="w-full max-w-md">
      <form action={formAction} className="flex flex-col gap-5">
        <Input label="Email" name="email" type="email" placeholder="voce@email.com" required />
        <Input label="Senha" name="password" type="password" required minLength={8} />

        <Button type="submit" disabled={isPending} className="w-full">
          {isPending ? 'Entrando…' : 'Entrar'}
        </Button>

        {state?.message && <p className="font-body text-sm text-secondary-700">{state.message}</p>}
      </form>
    </Card>
  );
}
