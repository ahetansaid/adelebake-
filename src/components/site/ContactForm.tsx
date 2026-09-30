'use client';

import { useActionState } from 'react';
import { Send } from 'lucide-react';
import { submitContact, type FormState } from '@/app/(site)/actions';
import { Field, FormAlert, Honeypot, Submit, Success } from './form-ui';

const initialState: FormState = { status: 'idle' };

export function ContactForm() {
  const [state, action] = useActionState(submitContact, initialState);

  if (state.status === 'success') {
    return (
      <Success title="Message envoyé">
        <p>Merci ! Nous vous répondons au plus vite.</p>
      </Success>
    );
  }

  return (
    <form action={action} className="form" noValidate>
      <Honeypot />
      <FormAlert state={state} />
      <Field name="name" label="Nom" state={state}>
        {(p) => <input {...p} autoComplete="name" required maxLength={120} />}
      </Field>
      <Field name="email" label="E-mail" state={state}>
        {(p) => <input {...p} type="email" autoComplete="email" required maxLength={255} />}
      </Field>
      <Field name="phone" label="Téléphone (facultatif)" state={state}>
        {(p) => <input {...p} type="tel" autoComplete="tel" maxLength={40} />}
      </Field>
      <Field name="subject" label="Objet" state={state}>
        {(p) => <input {...p} required maxLength={160} />}
      </Field>
      <Field name="message" label="Message" state={state} full>
        {(p) => <textarea {...p} required maxLength={4000} />}
      </Field>
      <div className="full"><Submit><Send /> Envoyer</Submit></div>
    </form>
  );
}
