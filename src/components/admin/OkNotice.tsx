import { CheckCircle2 } from 'lucide-react';

const MESSAGES: Record<string, string> = {
  enregistre: 'Modifications enregistrées.',
  cree: 'Élément créé.',
  supprime: 'Élément supprimé.',
};

/** Confirmation affichée après une redirection (?ok=…). */
export function OkNotice({ ok }: { ok?: string | string[] }) {
  const key = Array.isArray(ok) ? ok[0] : ok;
  if (!key || !MESSAGES[key]) return null;
  return <p className="flash flash--ok" role="status"><CheckCircle2 /> {MESSAGES[key]}</p>;
}
