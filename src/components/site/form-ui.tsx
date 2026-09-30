'use client';

import { useFormStatus } from 'react-dom';
import { AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';
import type { ReactNode } from 'react';
import type { FormState } from '@/app/(site)/actions';

export function Submit({ children }: { children: ReactNode }) {
  const { pending } = useFormStatus();
  return (
    <button className="btn btn--copper" type="submit" disabled={pending} aria-disabled={pending}>
      {pending ? <><Loader2 className="spin" /> Envoi en cours…</> : children}
    </button>
  );
}

/** Champ piège : invisible pour les humains, rempli par les robots. */
export function Honeypot() {
  return (
    <div className="hp" aria-hidden="true">
      <label>Site web <input type="text" name="website" tabIndex={-1} autoComplete="off" /></label>
    </div>
  );
}

export function FormAlert({ state }: { state: FormState }) {
  if (state.status !== 'error' || !state.message) return null;
  return (
    <p className="alert alert--err" role="alert">
      <AlertCircle /> {state.message}
    </p>
  );
}

export function Success({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="success" role="status">
      <CheckCircle2 />
      <h2>{title}</h2>
      {children}
    </div>
  );
}

type FieldProps = {
  name: string; label: string; state: FormState; full?: boolean; hint?: string;
  children: (a11y: { id: string; name: string; defaultValue?: string; 'aria-invalid'?: boolean; 'aria-describedby'?: string }) => ReactNode;
};

/** Libellé + contrôle + message d'erreur relié par aria-describedby. */
export function Field({ name, label, state, full, hint, children }: FieldProps) {
  const id = `f-${name}`;
  const err = state.errors?.[name];
  return (
    <label className={`field${full ? ' full' : ''}`} htmlFor={id}>
      <span>{label}</span>
      {children({ id, name, defaultValue: state.values?.[name], 'aria-invalid': err ? true : undefined, 'aria-describedby': err ? `${id}-err` : hint ? `${id}-hint` : undefined })}
      {err ? <small id={`${id}-err`}>{err}</small> : hint ? <em className="hint" id={`${id}-hint`}>{hint}</em> : null}
    </label>
  );
}
