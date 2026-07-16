'use client';

import { useActionState, useState } from 'react';

import { confirmAttendanceAction, type RsvpActionResult } from '@/app/actions/rsvp.actions';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';

interface PendingValues {
  companionCount: string;
  whatsappNumber: string;
}

/** Máscara progressiva (DD) DDDDD-DDDD / (DD) DDDD-DDDD enquanto a pessoa digita. */
function formatWhatsapp(rawValue: string): string {
  const digits = rawValue.replace(/\D/g, '').slice(0, 11);

  if (digits.length === 0) return '';
  if (digits.length <= 2) return `(${digits}`;
  if (digits.length <= 6) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  if (digits.length <= 10) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  }
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
}

export interface RsvpFormProps {
  eventId: string;
}

export function RsvpForm({ eventId }: RsvpFormProps) {
  const [state, formAction, isPending] = useActionState<RsvpActionResult | null, FormData>(
    confirmAttendanceAction,
    null,
  );
  const [dismissedState, setDismissedState] = useState<RsvpActionResult | null>(null);
  const [pendingValues, setPendingValues] = useState<PendingValues | null>(null);
  const [whatsappDisplay, setWhatsappDisplay] = useState('');

  if (state?.status === 'CREATED' || state?.status === 'UPDATED') {
    return (
      <p className="font-body text-primary-700">
        Presença confirmada! Mal podemos esperar pra celebrar com você. 💚
      </p>
    );
  }

  const askToUpdate = state?.status === 'ALREADY_EXISTS' && state !== dismissedState;

  function captureValuesBeforeSubmit(form: HTMLFormElement) {
    const formData = new FormData(form);
    setPendingValues({
      companionCount: String(formData.get('companionCount') ?? '0'),
      whatsappNumber: String(formData.get('whatsappNumber') ?? ''),
    });
  }

  return (
    <Card whimsyAccent className="w-full max-w-2xl">
      <form
        action={formAction}
        onSubmit={(event) => captureValuesBeforeSubmit(event.currentTarget)}
        className="flex flex-col gap-5"
      >
        <input type="hidden" name="eventId" value={eventId} />
        {askToUpdate && state.status === 'ALREADY_EXISTS' ? (
          <>
            <input type="hidden" name="guestName" value={state.guestName} />
            <input type="hidden" name="companionCount" value={pendingValues?.companionCount ?? '0'} />
            <input type="hidden" name="whatsappNumber" value={pendingValues?.whatsappNumber ?? ''} />
            <div className="flex flex-col items-center gap-3 rounded-xl border border-primary-200 bg-primary-50 p-4 text-center">
              <p className="font-body text-sm text-primary-700">
                Já encontramos uma confirmação de <strong>{state.guestName}</strong> com esse
                WhatsApp, com {state.companionCount}{' '}
                {state.companionCount === 1 ? 'acompanhante' : 'acompanhantes'} registrado(s).
                Quer atualizar a quantidade de acompanhantes para{' '}
                {pendingValues?.companionCount ?? '0'}?
              </p>
              <div className="flex gap-3">
                <Button type="submit" name="confirmUpdate" value="true" disabled={isPending}>
                  {isPending ? 'Atualizando…' : 'Sim, atualizar'}
                </Button>
                <Button type="button" variant="ghost" onClick={() => setDismissedState(state)}>
                  Cancelar
                </Button>
              </div>
            </div>
          </>
        ) : (
          <>
            <Input label="Nome" name="guestName" placeholder="Digite seu nome" required minLength={2} />

            <div className="flex flex-col gap-5 md:flex-row">
              <div className="md:w-48 md:shrink-0">
                <Input
                  label="Quantidade de acompanhantes"
                  name="companionCount"
                  type="number"
                  defaultValue={0}
                  min={0}
                  inputMode="numeric"
                />
              </div>
              <div className="md:flex-1">
                <Input
                  label="Whatsapp"
                  name="whatsappNumber"
                  placeholder="(00) 00000-0000"
                  required
                  inputMode="tel"
                  value={whatsappDisplay}
                  onChange={(event) => setWhatsappDisplay(formatWhatsapp(event.target.value))}
                />
              </div>
            </div>

            <div className="mt-2 flex flex-col items-center gap-2">
              <Button
                type="submit"
                name="confirmUpdate"
                value="false"
                disabled={isPending}
                className="w-full md:w-auto md:px-12"
              >
                {isPending ? 'Enviando…' : 'Confirmar presença ♡'}
              </Button>
              {state?.status === 'ERROR' && (
                <p className="font-body text-sm text-secondary-700">{state.message}</p>
              )}
            </div>
          </>
        )}
      </form>
    </Card>
  );
}
