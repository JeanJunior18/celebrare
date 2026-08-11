'use client';

import { useState, useTransition } from 'react';

import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import type { Rsvp } from '@/domain/entities/rsvp';

export interface RsvpListProps {
  rsvps: Rsvp[];
  deleteAction: (rsvpId: string) => Promise<{ success: boolean; message?: string }>;
  updateCompanionCountAction: (
    rsvpId: string,
    companionCount: number,
  ) => Promise<{ success: boolean; message?: string }>;
}

export function RsvpList({ rsvps, deleteAction, updateCompanionCountAction }: RsvpListProps) {
  const [items, setItems] = useState(rsvps);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [companionDrafts, setCompanionDrafts] = useState<Record<string, number>>({});
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [errorByRsvp, setErrorByRsvp] = useState<Record<string, string>>({});
  const [isPending, startTransition] = useTransition();

  function handleStartEdit(rsvp: Rsvp) {
    setCompanionDrafts((current) => ({ ...current, [rsvp.id]: rsvp.companionCount }));
    setEditingId(rsvp.id);
  }

  function handleCancelEdit(rsvp: Rsvp) {
    setEditingId(null);
    setErrorByRsvp((current) => {
      const rest = { ...current };
      delete rest[rsvp.id];
      return rest;
    });
  }

  function handleDelete(rsvp: Rsvp) {
    const confirmed = window.confirm(`Remover a confirmação de ${rsvp.guestName}? Essa ação não pode ser desfeita.`);
    if (!confirmed) return;

    setPendingId(rsvp.id);
    startTransition(async () => {
      const result = await deleteAction(rsvp.id);
      setPendingId(null);
      if (result.success) {
        setItems((current) => current.filter((item) => item.id !== rsvp.id));
      } else {
        setErrorByRsvp((current) => ({ ...current, [rsvp.id]: result.message ?? 'Erro ao remover.' }));
      }
    });
  }

  function handleSaveCompanionCount(rsvp: Rsvp) {
    const draft = companionDrafts[rsvp.id];
    if (draft === undefined || draft === rsvp.companionCount) {
      setEditingId(null);
      return;
    }

    setPendingId(rsvp.id);
    startTransition(async () => {
      const result = await updateCompanionCountAction(rsvp.id, draft);
      setPendingId(null);
      if (result.success) {
        setItems((current) =>
          current.map((item) => (item.id === rsvp.id ? { ...item, companionCount: draft } : item)),
        );
        setEditingId(null);
        setErrorByRsvp((current) => {
          const rest = { ...current };
          delete rest[rsvp.id];
          return rest;
        });
      } else {
        setErrorByRsvp((current) => ({ ...current, [rsvp.id]: result.message ?? 'Erro ao atualizar.' }));
      }
    });
  }

  if (items.length === 0) {
    return <p className="font-body text-ink-soft">Ninguém confirmou presença ainda.</p>;
  }

  return (
    <div className="grid w-full max-w-2xl gap-3">
      {items.map((rsvp) => {
        const isEditing = editingId === rsvp.id;
        const draft = companionDrafts[rsvp.id] ?? rsvp.companionCount;
        const rowPending = isPending && pendingId === rsvp.id;

        return (
          <Card key={rsvp.id} className="flex flex-col gap-3">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="font-display text-primary-700">{rsvp.guestName}</p>
                <p className="font-body text-xs text-ink-soft">{rsvp.whatsappNumber}</p>
              </div>
              <Button
                type="button"
                variant="ghost"
                disabled={rowPending}
                onClick={() => handleDelete(rsvp)}
                className="px-3 py-2 text-xs text-secondary-700 hover:bg-secondary-50"
              >
                Remover
              </Button>
            </div>

            <div className="flex items-center gap-2">
              {isEditing ? (
                <>
                  <label className="font-body text-xs text-ink-soft" htmlFor={`companion-count-${rsvp.id}`}>
                    Acompanhantes
                  </label>
                  <input
                    id={`companion-count-${rsvp.id}`}
                    type="number"
                    min={0}
                    value={draft}
                    disabled={rowPending}
                    autoFocus
                    onChange={(event) =>
                      setCompanionDrafts((current) => ({
                        ...current,
                        [rsvp.id]: Math.max(0, Number(event.target.value)),
                      }))
                    }
                    className="w-16 rounded-lg border border-primary-200 bg-surface px-2 py-1 font-body text-sm text-ink focus:outline-none focus:ring-2 focus:ring-primary-400"
                  />
                  <Button
                    type="button"
                    variant="secondary"
                    disabled={rowPending}
                    onClick={() => handleSaveCompanionCount(rsvp)}
                    className="px-3 py-1.5 text-xs"
                  >
                    {rowPending ? 'Salvando…' : 'Confirmar'}
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    disabled={rowPending}
                    onClick={() => handleCancelEdit(rsvp)}
                    className="px-3 py-1.5 text-xs"
                  >
                    Cancelar
                  </Button>
                </>
              ) : (
                <>
                  <span className="font-body text-sm text-ink-soft">
                    {rsvp.companionCount} {rsvp.companionCount === 1 ? 'acompanhante' : 'acompanhantes'}
                  </span>
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => handleStartEdit(rsvp)}
                    className="px-3 py-1.5 text-xs text-primary-700"
                  >
                    Editar
                  </Button>
                </>
              )}
            </div>

            {errorByRsvp[rsvp.id] && (
              <p className="font-body text-xs text-secondary-700">{errorByRsvp[rsvp.id]}</p>
            )}
          </Card>
        );
      })}
    </div>
  );
}
