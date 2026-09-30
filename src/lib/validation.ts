import { z } from 'zod';
import { CONFERENCE_NEEDS } from './constants';

const trimmed = (max: number) => z.string().trim().max(max);
const required = (label: string, max: number) => trimmed(max).min(1, `${label} est obligatoire.`);

const phone = z
  .string()
  .trim()
  .min(8, 'Numéro de téléphone trop court.')
  .max(40)
  .regex(/^[+\d][\d\s().-]{6,}$/, 'Numéro de téléphone invalide.');

const email = z.string().trim().max(255).email('Adresse e-mail invalide.');

/** Date « AAAA-MM-JJ » → Date à minuit UTC (colonne @db.Date). */
const day = (label: string) =>
  z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, `${label} invalide.`)
    .transform((v) => new Date(`${v}T00:00:00.000Z`))
    .refine((d) => !Number.isNaN(d.getTime()), `${label} invalide.`);

function todayUtc() {
  const now = new Date();
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
}

const optionalText = (max: number) =>
  trimmed(max)
    .optional()
    .transform((v) => (v ? v : undefined));

export const bookingSchema = z
  .object({
    roomId: z.string().trim().max(40).optional().transform((v) => v || undefined),
    checkIn: day("Date d'arrivée"),
    checkOut: day('Date de départ'),
    adults: z.coerce.number().int().min(1, 'Au moins 1 adulte.').max(12),
    children: z.coerce.number().int().min(0).max(12).default(0),
    name: required('Le nom', 120),
    email,
    phone,
    airportShuttle: z.preprocess((v) => v === 'on' || v === 'true', z.boolean()),
    flightInfo: optionalText(120),
    message: optionalText(2000),
  })
  .refine((d) => d.checkIn >= todayUtc(), { path: ['checkIn'], message: "La date d'arrivée est déjà passée." })
  .refine((d) => d.checkOut > d.checkIn, { path: ['checkOut'], message: "Le départ doit être après l'arrivée." })
  .refine((d) => (d.checkOut.getTime() - d.checkIn.getTime()) / 86_400_000 <= 60, {
    path: ['checkOut'],
    message: 'Pour un séjour de plus de 60 nuits, contactez-nous directement.',
  });

export { CONFERENCE_NEEDS };

export const conferenceSchema = z
  .object({
    organization: optionalText(160),
    name: required('Le nom', 120),
    email,
    phone,
    eventDate: day("Date de l'événement"),
    format: z.enum(['HALF_DAY', 'FULL_DAY', 'MULTI_DAY'], { message: 'Choisissez une formule.' }),
    participants: z.coerce.number().int().min(1, 'Au moins 1 participant.').max(500),
    needs: z.array(z.enum(CONFERENCE_NEEDS)).default([]),
    lodging: z.preprocess((v) => v === 'on' || v === 'true', z.boolean()),
    message: optionalText(2000),
  })
  .refine((d) => d.eventDate >= todayUtc(), { path: ['eventDate'], message: 'Cette date est déjà passée.' });

export const contactSchema = z.object({
  name: required('Le nom', 120),
  email,
  phone: z
    .string()
    .trim()
    .max(40)
    .optional()
    .transform((v) => v || undefined)
    .pipe(z.string().regex(/^[+\d][\d\s().-]{6,}$/, 'Numéro de téléphone invalide.').optional()),
  subject: required("L'objet", 160),
  message: trimmed(4000).min(10, 'Votre message est un peu court (10 caractères minimum).'),
});

/** Erreurs zod → { champ: message } pour l'affichage sous chaque champ. */
export function fieldErrors(error: z.ZodError) {
  const out: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = String(issue.path[0] ?? 'form');
    out[key] ??= issue.message;
  }
  return out;
}
