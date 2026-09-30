'use client';

import { useActionState, useState, type ReactNode } from 'react';
import { useFormStatus } from 'react-dom';
import { AlertCircle, CheckCircle2, Loader2, Save, Trash2 } from 'lucide-react';
import type { ActionState } from '@/app/admin/(panel)/actions';

export function SaveButton({ label = 'Enregistrer' }: { label?: string }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className="a-btn a-btn--primary" disabled={pending}>
      {pending ? <Loader2 /> : <Save />} {pending ? 'Enregistrement…' : label}
    </button>
  );
}

export function Flash({ state }: { state: ActionState }) {
  if (state.error) return <p className="flash flash--err" role="alert"><AlertCircle /> {state.error}</p>;
  if (state.ok) return <p className="flash flash--ok" role="status"><CheckCircle2 /> {state.ok}</p>;
  return null;
}

/** Formulaire relié à une action serveur, avec message de retour. */
export function ActionForm({
  action, children, className = 'f-grid', multipart,
}: {
  action: (prev: ActionState, f: FormData) => Promise<ActionState>;
  children: ReactNode; className?: string; multipart?: boolean;
}) {
  const [state, formAction] = useActionState(action, {} as ActionState);
  return (
    <form action={formAction} className={className} encType={multipart ? 'multipart/form-data' : undefined}>
      <div className="full"><Flash state={state} /></div>
      {children}
    </form>
  );
}

/** Bouton qui demande confirmation avant d'appeler une action (suppression…). */
export function ConfirmButton({
  action, label = 'Supprimer', question = 'Supprimer définitivement ?', className = 'a-btn a-btn--danger', icon = true,
}: {
  action: () => Promise<void>; label?: string; question?: string; className?: string; icon?: boolean;
}) {
  const [pending, setPending] = useState(false);
  return (
    <button
      type="button"
      className={className}
      disabled={pending}
      onClick={async () => {
        if (!window.confirm(question)) return;
        setPending(true);
        try { await action(); } finally { setPending(false); }
      }}
    >
      {icon && <Trash2 />} {label}
    </button>
  );
}

/** Bouton simple déclenchant une action serveur (changement de statut…). */
export function ActionButton({ action, children, className = 'a-btn a-btn--ghost' }: { action: () => Promise<void>; children: ReactNode; className?: string }) {
  const [pending, setPending] = useState(false);
  return (
    <button type="button" className={className} disabled={pending} onClick={async () => { setPending(true); try { await action(); } finally { setPending(false); } }}>
      {children}
    </button>
  );
}
