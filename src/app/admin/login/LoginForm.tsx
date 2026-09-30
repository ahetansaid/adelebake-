'use client';

import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { AlertCircle, LogIn } from 'lucide-react';
import { login, type LoginState } from './actions';

function Submit() {
  const { pending } = useFormStatus();
  return <button type="submit" className="a-btn a-btn--primary" disabled={pending}><LogIn /> {pending ? 'Connexion…' : 'Se connecter'}</button>;
}

export function LoginForm() {
  const [state, action] = useActionState(login, {} as LoginState);
  return (
    <form action={action} className="f-grid" style={{ gridTemplateColumns: '1fr' }}>
      {state.error && <p className="flash flash--err" role="alert"><AlertCircle /> {state.error}</p>}
      <label className="f"><span>E-mail</span><input name="email" type="email" autoComplete="username" required autoFocus={!state.email} defaultValue={state.email} /></label>
      <label className="f"><span>Mot de passe</span><input name="password" type="password" autoComplete="current-password" required autoFocus={!!state.email} /></label>
      <Submit />
    </form>
  );
}
