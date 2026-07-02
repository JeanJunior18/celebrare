import type { InputHTMLAttributes } from 'react';

export interface SwitchProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label: string;
}

export function Switch({ label, id, name, className = '', ...rest }: SwitchProps) {
  const fieldId = id ?? name;

  return (
    // Sem `htmlFor` — o input já vem aninhado, associação implícita.
    // Repetir `htmlFor`/`id` apontando pro mesmo elemento faz o clique no
    // label disparar o toggle duas vezes no Chromium (uma pelo aninhamento,
    // outra pelo `for`), cancelando a mudança.
    <label className={`flex w-full items-center justify-between gap-3 ${className}`}>
      <span className="font-body text-xs font-semibold uppercase tracking-wide text-primary-700">{label}</span>
      <input
        id={fieldId}
        name={name}
        type="checkbox"
        className="peer sr-only"
        {...rest}
      />
      <span
        aria-hidden
        className="relative h-6 w-11 shrink-0 rounded-full bg-primary-200 transition-colors after:absolute after:top-0.5 after:left-0.5 after:h-5 after:w-5 after:rounded-full after:bg-surface after:shadow-sm after:transition-transform peer-checked:bg-primary-600 peer-checked:after:translate-x-5 peer-focus-visible:ring-2 peer-focus-visible:ring-primary-400"
      />
    </label>
  );
}
