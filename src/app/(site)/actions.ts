'use server';

import { db } from '@/lib/db';
import { formatDay, makeReference, nightsBetween } from '@/lib/format';
import { sendMail } from '@/lib/mail';
import { rateLimit } from '@/lib/rate-limit';
import { getSettings } from '@/lib/settings';
import { bookingSchema, conferenceSchema, contactSchema, fieldErrors } from '@/lib/validation';

export type FormState = {
  status: 'idle' | 'success' | 'error';
  message?: string;
  errors?: Record<string, string>;
  reference?: string;
  /** valeurs saisies, renvoyées en cas d'erreur (React 19 réinitialise le formulaire après l'action) */
  values?: Record<string, string>;
};

function keep(form: FormData): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [k, v] of form) if (k !== 'website' && typeof v === 'string' && !(k in out)) out[k] = v.slice(0, 4000);
  const needs = form.getAll('needs').map(String);
  if (needs.length) out.needs = needs.join('|');
  return out;
}

const TOO_MANY: FormState = {
  status: 'error',
  message: 'Trop de demandes envoyées depuis votre connexion. Réessayez dans quelques minutes ou écrivez-nous sur WhatsApp.',
};

/** Champ piège invisible : rempli uniquement par les robots. */
function isBot(form: FormData) {
  return String(form.get('website') ?? '') !== '';
}

function site() {
  return (process.env.SITE_URL ?? 'http://localhost:3000').replace(/\/$/, '');
}

const FORMAT_LABEL = { HALF_DAY: 'Demi-journée', FULL_DAY: 'Journée', MULTI_DAY: 'Plusieurs jours' } as const;

// ---------------------------------------------------------------------------

export async function submitBooking(_prev: FormState, form: FormData): Promise<FormState> {
  if (isBot(form)) return { status: 'success', reference: 'AB-000000' };
  if (!(await rateLimit('booking', 5, 600))) return { ...TOO_MANY, values: keep(form) };

  const parsed = bookingSchema.safeParse(Object.fromEntries(form));
  if (!parsed.success) return { status: 'error', message: 'Merci de corriger les champs indiqués.', errors: fieldErrors(parsed.error), values: keep(form) };
  const d = parsed.data;

  const room = d.roomId ? await db.room.findFirst({ where: { id: d.roomId, published: true }, select: { id: true, name: true } }) : null;
  const reference = makeReference('AB');

  await db.bookingRequest.create({
    data: {
      reference, roomId: room?.id, checkIn: d.checkIn, checkOut: d.checkOut, adults: d.adults, children: d.children,
      name: d.name, email: d.email, phone: d.phone, airportShuttle: d.airportShuttle, flightInfo: d.flightInfo, message: d.message,
    },
  });

  const s = await getSettings();
  const nights = nightsBetween(d.checkIn, d.checkOut);
  const summary = [
    `Référence : ${reference}`,
    `Chambre : ${room?.name ?? 'sans préférence'}`,
    `Séjour : du ${formatDay(d.checkIn)} au ${formatDay(d.checkOut)} (${nights} nuit${nights > 1 ? 's' : ''})`,
    `Voyageurs : ${d.adults} adulte(s), ${d.children} enfant(s)`,
    `Navette aéroport : ${d.airportShuttle ? `oui${d.flightInfo ? ` — ${d.flightInfo}` : ''}` : 'non'}`,
  ].join('\n');

  await Promise.all([
    sendMail({
      to: s.notifyEmail,
      replyTo: d.email,
      subject: `Nouvelle demande de réservation ${reference} — ${d.name}`,
      text: `${summary}\n\nClient : ${d.name}\nE-mail : ${d.email}\nTéléphone : ${d.phone}\n\nMessage :\n${d.message ?? '—'}\n\nGérer la demande : ${site()}/admin/reservations`,
    }),
    sendMail({
      to: d.email,
      subject: `Adélé Baké — nous avons bien reçu votre demande (${reference})`,
      text: `Bonjour ${d.name},\n\nMerci pour votre demande de réservation. Nous vérifions la disponibilité et revenons vers vous très vite (généralement dans la journée) pour vous confirmer le séjour et le tarif.\n\n${summary}\n\nPour toute question : ${s.phone} (WhatsApp) ou ${s.email}.\n\nKwabo, et à bientôt à Cotonou !\nL'équipe Adélé Baké`,
    }),
  ]);

  return { status: 'success', reference };
}

// ---------------------------------------------------------------------------

export async function submitConference(_prev: FormState, form: FormData): Promise<FormState> {
  if (isBot(form)) return { status: 'success', reference: 'SC-000000' };
  if (!(await rateLimit('conference', 5, 600))) return { ...TOO_MANY, values: keep(form) };

  const parsed = conferenceSchema.safeParse({ ...Object.fromEntries(form), needs: form.getAll('needs') });
  if (!parsed.success) return { status: 'error', message: 'Merci de corriger les champs indiqués.', errors: fieldErrors(parsed.error), values: keep(form) };
  const d = parsed.data;
  const reference = makeReference('SC');

  await db.conferenceRequest.create({
    data: {
      reference, organization: d.organization, name: d.name, email: d.email, phone: d.phone, eventDate: d.eventDate,
      format: d.format, participants: d.participants, needs: d.needs, lodging: d.lodging, message: d.message,
    },
  });

  const s = await getSettings();
  const summary = [
    `Référence : ${reference}`,
    `Date : ${formatDay(d.eventDate)} — ${FORMAT_LABEL[d.format]}`,
    `Participants : ${d.participants}`,
    `Besoins : ${d.needs.length ? d.needs.join(', ') : '—'}`,
    `Hébergement des participants : ${d.lodging ? 'oui' : 'non'}`,
  ].join('\n');

  await Promise.all([
    sendMail({
      to: s.notifyEmail,
      replyTo: d.email,
      subject: `Demande de devis salle ${reference} — ${d.organization ?? d.name}`,
      text: `${summary}\n\nContact : ${d.name}${d.organization ? ` (${d.organization})` : ''}\nE-mail : ${d.email}\nTéléphone : ${d.phone}\n\nMessage :\n${d.message ?? '—'}\n\nGérer la demande : ${site()}/admin/devis`,
    }),
    sendMail({
      to: d.email,
      subject: `Adélé Baké — votre demande de devis (${reference})`,
      text: `Bonjour ${d.name},\n\nMerci pour votre demande concernant notre salle de conférence. Nous vous envoyons un devis détaillé rapidement.\n\n${summary}\n\nL'équipe Adélé Baké — ${s.phone}`,
    }),
  ]);

  return { status: 'success', reference };
}

// ---------------------------------------------------------------------------

export async function submitContact(_prev: FormState, form: FormData): Promise<FormState> {
  if (isBot(form)) return { status: 'success' };
  if (!(await rateLimit('contact', 5, 600))) return { ...TOO_MANY, values: keep(form) };

  const parsed = contactSchema.safeParse(Object.fromEntries(form));
  if (!parsed.success) return { status: 'error', message: 'Merci de corriger les champs indiqués.', errors: fieldErrors(parsed.error), values: keep(form) };
  const d = parsed.data;

  await db.contactMessage.create({ data: d });

  const s = await getSettings();
  await sendMail({
    to: s.notifyEmail,
    replyTo: d.email,
    subject: `Message du site : ${d.subject}`,
    text: `De : ${d.name} <${d.email}>${d.phone ? ` — ${d.phone}` : ''}\n\n${d.message}\n\nVoir les messages : ${site()}/admin/messages`,
  });

  return { status: 'success' };
}
