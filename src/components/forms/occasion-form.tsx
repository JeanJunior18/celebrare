'use client';

import { useActionState } from 'react';

import {
  createOccasionAction,
  updateOccasionAction,
  type OccasionActionResult,
} from '@/app/actions/internal-occasion.actions';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import type { Occasion } from '@/domain/entities/occasion';

export interface OccasionFormProps {
  occasion?: Occasion;
}

export function OccasionForm({ occasion }: OccasionFormProps) {
  const action = occasion ? updateOccasionAction : createOccasionAction;
  const [state, formAction, isPending] = useActionState<OccasionActionResult | null, FormData>(action, null);

  if (state?.success) {
    return <p className="font-body text-primary-700">Ocasião salva! Atualize a página pra ver. 💚</p>;
  }

  return (
    <Card whimsyAccent className="w-full max-w-2xl">
      <form action={formAction} className="flex flex-col gap-5">
        {occasion && <input type="hidden" name="occasionId" value={occasion.id} />}

        {occasion ? (
          <Input label="Slug" name="slug" defaultValue={occasion.slug} disabled />
        ) : (
          <Input label="Slug" name="slug" placeholder="ex: WEDDING" required minLength={2} />
        )}

        <Input label="Nome" name="name" defaultValue={occasion?.name} required minLength={2} />

        <Textarea
          label="Textos padrão (JSON — default_copy)"
          name="defaultCopy"
          defaultValue={occasion ? JSON.stringify(occasion.defaultCopy, null, 2) : ''}
          required
          rows={14}
          className="font-mono text-xs"
        />

        <div className="mt-2 flex flex-col items-center gap-2">
          <Button type="submit" disabled={isPending} className="w-full md:w-auto md:px-12">
            {isPending ? 'Salvando…' : occasion ? 'Salvar alterações' : 'Criar ocasião'}
          </Button>
          {state?.message && <p className="font-body text-sm text-secondary-700">{state.message}</p>}
        </div>
      </form>
    </Card>
  );
}
