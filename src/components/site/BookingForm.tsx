'use client';

import { useActionState, useState } from 'react';
import { Send } from 'lucide-react';
import { submitBooking, type FormState } from '@/app/(site)/actions';
import { Field, FormAlert, Honeypot, Submit, Success } from './form-ui';

type Props = {
  rooms: { id: string; name: string; pricePerNight: number }[];
  initial: { roomId?: string; checkIn?: string; checkOut?: string; adults?: string; children?: string };
  today: string;
  whatsappHref: string;
};

const initialState: FormState = { status: 'idle' };

export function BookingForm({ rooms, initial, today, whatsappHref }: Props) {
  const [state, action] = useActionState(submitBooking, initialState);
  const [checkIn, setCheckIn] = useState(initial.checkIn ?? '');
  // champs contrôlés : non concernés par la réinitialisation du formulaire après l'action
  const [shuttle, setShuttle] = useState(true);

  if (state.status === 'success') {
    return (
      <Success title="Demande bien reçue — merci !">
        <p>Votre référence :</p>
        <p className="ref">{state.reference}</p>
        <p>Nous vérifions la disponibilité et vous répondons très vite, généralement dans la journée, par e-mail ou WhatsApp. Un récapitulatif vient de vous être envoyé.</p>
        <a className="btn btn--line" href={whatsappHref} target="_blank" rel="noopener noreferrer">Une question ? Écrivez-nous sur WhatsApp</a>
      </Success>
    );
  }

  return (
    <form action={action} className="form" noValidate>
      <Honeypot />
      <FormAlert state={state} />

      <Field name="roomId" label="Chambre souhaitée" state={state} full>
        {(p) => (
          <select {...p} defaultValue={p.defaultValue ?? initial.roomId ?? ''}>
            <option value="">Pas de préférence — conseillez-moi</option>
            {rooms.map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}
          </select>
        )}
      </Field>

      <Field name="checkIn" label="Arrivée" state={state}>
        {({ defaultValue: _d, ...p }) => <input {...p} type="date" min={today} required value={checkIn} onChange={(e) => setCheckIn(e.target.value)} />}
      </Field>
      <Field name="checkOut" label="Départ" state={state}>
        {(p) => <input {...p} type="date" min={checkIn || today} required defaultValue={p.defaultValue ?? initial.checkOut} />}
      </Field>
      <Field name="adults" label="Adultes" state={state}>
        {(p) => (
          <select {...p} defaultValue={p.defaultValue ?? initial.adults ?? '2'}>
            {[1, 2, 3, 4, 5, 6].map((n) => <option key={n}>{n}</option>)}
          </select>
        )}
      </Field>
      <Field name="children" label="Enfants" state={state}>
        {(p) => (
          <select {...p} defaultValue={p.defaultValue ?? initial.children ?? '0'}>
            {[0, 1, 2, 3, 4].map((n) => <option key={n}>{n}</option>)}
          </select>
        )}
      </Field>

      <Field name="name" label="Nom complet" state={state} full>
        {(p) => <input {...p} autoComplete="name" required maxLength={120} />}
      </Field>
      <Field name="email" label="E-mail" state={state}>
        {(p) => <input {...p} type="email" autoComplete="email" required maxLength={255} />}
      </Field>
      <Field name="phone" label="Téléphone / WhatsApp" state={state} hint="Avec l'indicatif, ex. +229 01 00 00 00 00">
        {(p) => <input {...p} type="tel" autoComplete="tel" required maxLength={40} />}
      </Field>

      <div className="field full">
        <label className="check" style={{ alignSelf: 'flex-start' }}>
          <input type="checkbox" name="airportShuttle" checked={shuttle} onChange={(e) => setShuttle(e.target.checked)} />
          Je souhaite la navette aéroport offerte
        </label>
      </div>
      {shuttle && (
        <Field name="flightInfo" label="Vol et heure d'arrivée (si connus)" state={state} full hint="Ex. ET 921 — arrivée 14 h 20">
          {(p) => <input {...p} maxLength={120} />}
        </Field>
      )}

      <Field name="message" label="Message (facultatif)" state={state} full>
        {(p) => <textarea {...p} maxLength={2000} placeholder="Heure d'arrivée, besoins particuliers, régime alimentaire…" />}
      </Field>

      <div className="full">
        <Submit><Send /> Envoyer ma demande</Submit>
        <p className="note" style={{ marginTop: '.8rem' }}>
          Aucun paiement en ligne : nous confirmons d&apos;abord la disponibilité et le tarif avec vous.
        </p>
      </div>
    </form>
  );
}
