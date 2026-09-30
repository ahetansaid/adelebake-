'use client';

import { useActionState } from 'react';
import { Send } from 'lucide-react';
import { submitConference, type FormState } from '@/app/(site)/actions';
import { CONFERENCE_NEEDS } from '@/lib/constants';
import { Field, FormAlert, Honeypot, Submit, Success } from './form-ui';

const initialState: FormState = { status: 'idle' };

export function ConferenceForm({ today }: { today: string }) {
  const [state, action] = useActionState(submitConference, initialState);

  if (state.status === 'success') {
    return (
      <Success title="Demande de devis envoyée">
        <p>Votre référence :</p>
        <p className="ref">{state.reference}</p>
        <p>Nous vous envoyons une proposition détaillée rapidement. Un récapitulatif vient de vous être envoyé par e-mail.</p>
      </Success>
    );
  }

  return (
    <form action={action} className="form" noValidate>
      <Honeypot />
      <FormAlert state={state} />
      <Field name="organization" label="Organisation (facultatif)" state={state} full>
        {(p) => <input {...p} autoComplete="organization" maxLength={160} />}
      </Field>
      <Field name="name" label="Nom du contact" state={state}>
        {(p) => <input {...p} autoComplete="name" required maxLength={120} />}
      </Field>
      <Field name="phone" label="Téléphone / WhatsApp" state={state}>
        {(p) => <input {...p} type="tel" autoComplete="tel" required maxLength={40} />}
      </Field>
      <Field name="email" label="E-mail" state={state} full>
        {(p) => <input {...p} type="email" autoComplete="email" required maxLength={255} />}
      </Field>
      <Field name="eventDate" label="Date de l'événement" state={state}>
        {(p) => <input {...p} type="date" min={today} required />}
      </Field>
      <Field name="participants" label="Nombre de participants" state={state}>
        {(p) => <input {...p} type="number" min={1} max={500} inputMode="numeric" required />}
      </Field>
      <Field name="format" label="Formule" state={state} full>
        {(p) => (
          <select {...p} defaultValue={p.defaultValue ?? 'FULL_DAY'}>
            <option value="HALF_DAY">Demi-journée</option>
            <option value="FULL_DAY">Journée complète</option>
            <option value="MULTI_DAY">Plusieurs jours</option>
          </select>
        )}
      </Field>
      <fieldset className="field full">
        <legend>Besoins</legend>
        <div className="checks">
          {CONFERENCE_NEEDS.map((n) => (
            <label key={n} className="check"><input type="checkbox" name="needs" value={n} defaultChecked={state.values?.needs?.split('|').includes(n)} /> {n}</label>
          ))}
        </div>
      </fieldset>
      <div className="field full">
        <label className="check" style={{ alignSelf: 'flex-start' }}>
          <input type="checkbox" name="lodging" defaultChecked={state.values?.lodging === 'on'} /> Hébergement de participants sur place
        </label>
      </div>
      <Field name="message" label="Précisions (facultatif)" state={state} full>
        {(p) => <textarea {...p} maxLength={2000} placeholder="Programme, disposition de la salle, horaires…" />}
      </Field>
      <div className="full"><Submit><Send /> Demander un devis</Submit></div>
    </form>
  );
}
