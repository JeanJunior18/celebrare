'use client';

import { useActionState } from 'react';

import { updateDashboardEventOccasionAction } from '@/app/actions/dashboard.actions';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Select } from '@/components/ui/Select';
import type { Occasion } from '@/domain/entities/occasion';

export interface EditOccasionFormProps {
  occasions: Occasion[];
  currentOccasionId: string;
}

export function EditOccasionForm({ occasions, currentOccasionId }: EditOccasionFormProps) {
  const [state, formAction, isPending] = useActionState(updateDashboardEventOccasionAction, null);

  return (
    <Card whimsyAccent className="w-full max-w-2xl">
      <form action={formAction} className="flex flex-col gap-5">
        <h3 className="font-display text-lg text-primary-700">Ocasião</h3>

        <Select
          label="Ocasião do evento"
          name="occasionId"
          required
          defaultValue={currentOccasionId}
          options={occasions.map((occasion) => ({ value: occasion.id, label: occasion.name }))}
        />

        <div className="flex flex-col items-start gap-2">
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
