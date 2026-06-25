'use client';

import { useActionState } from 'react';

import { leaveMessageAction } from '@/app/actions/guestbook.actions';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';

export interface GuestbookFormProps {
  eventId: string;
}

export function GuestbookForm({ eventId }: GuestbookFormProps) {
  const [state, formAction, isPending] = useActionState(leaveMessageAction, null);

  if (state?.success) {
    return <p className="font-body text-primary-700">Mensagem deixada com carinho. Obrigado! 💚</p>;
  }

  return (
    <form action={formAction} className="flex w-full max-w-md flex-col gap-4">
      <input type="hidden" name="eventId" value={eventId} />
      <Input label="Seu nome" name="guestName" placeholder="Digite seu nome" required minLength={2} />
      <Textarea
        label="Mensagem"
        name="message"
        placeholder="Deixe uma mensagem cheia de carinho para o Davi"
        required
        maxLength={500}
        rows={4}
      />
      <Button type="submit" disabled={isPending} className="w-full">
        {isPending ? 'Enviando…' : 'Deixar mensagem ✎'}
      </Button>
      {state?.message && <p className="font-body text-sm text-secondary-700">{state.message}</p>}
    </form>
  );
}
