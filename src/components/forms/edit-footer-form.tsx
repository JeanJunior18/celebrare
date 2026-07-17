'use client';

import { useActionState } from 'react';

import { updateDashboardEventFooterAction } from '@/app/actions/dashboard.actions';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';

export interface EditFooterFormProps {
  quoteText: string;
  quoteReference: string;
  signoff: string;
  overrideSignoff: string;
}

export function EditFooterForm({ quoteText, quoteReference, signoff, overrideSignoff }: EditFooterFormProps) {
  const [state, formAction, isPending] = useActionState(updateDashboardEventFooterAction, null);

  return (
    <Card whimsyAccent className="w-full max-w-2xl">
      <form action={formAction} className="flex flex-col gap-5">
        <h3 className="font-display text-lg text-primary-700">Rodapé</h3>

        <Input label="Citação (opcional)" name="quoteText" defaultValue={quoteText} />
        <Input label="Referência da citação (opcional)" name="quoteReference" defaultValue={quoteReference} />
        <Input label="Assinatura" name="signoff" placeholder={signoff} defaultValue={overrideSignoff} />

        <div className="mt-2 flex flex-col items-start gap-2">
          <Button type="submit" disabled={isPending}>
            {isPending ? 'Salvando…' : 'Salvar'}
          </Button>
          {state?.success && <p className="font-body text-sm text-primary-700">Salvo! ♡</p>}
          {state?.success === false && <p className="font-body text-sm text-secondary-700">{state.message}</p>}
        </div>
      </form>
    </Card>
  );
}
