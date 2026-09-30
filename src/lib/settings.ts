import { cache } from 'react';
import { db } from './db';

/** Paramètres modifiables depuis le back-office, avec leur valeur par défaut. */
export const SETTING_DEFAULTS = {
  phone: '+229 01 62 25 21 94',
  whatsapp: '2290162252194',
  email: 'contact@adelebake.com',
  notifyEmail: 'contact@adelebake.com',
  address: "Quartier de l'aéroport, Cotonou, Bénin",
  airportDistance: "≈ 2 km de l'aéroport de Cotonou",
  receptionHours: 'Tous les jours, de 7 h à 23 h',
  checkIn: 'À partir de 13 h',
  checkOut: "Jusqu'à 11 h",
  conferenceCapacity: '40',
  facebook: 'https://www.facebook.com/adelebake229/',
  instagram: 'https://www.instagram.com/adelebake/',
  mapsUrl: 'https://www.google.com/maps/search/Adele+Bake+Cotonou',
} as const;

export type SettingKey = keyof typeof SETTING_DEFAULTS;
export type SiteSettings = Record<SettingKey, string>;

export const SETTING_LABELS: Record<SettingKey, string> = {
  phone: 'Téléphone affiché',
  whatsapp: 'Numéro WhatsApp (chiffres uniquement, avec indicatif 229)',
  email: 'E-mail public',
  notifyEmail: 'E-mail qui reçoit les demandes',
  address: 'Adresse',
  airportDistance: "Distance de l'aéroport",
  receptionHours: "Horaires d'accueil",
  checkIn: 'Arrivée (check-in)',
  checkOut: 'Départ (check-out)',
  conferenceCapacity: 'Capacité de la salle de conférence (personnes)',
  facebook: 'Page Facebook',
  instagram: 'Compte Instagram',
  mapsUrl: 'Lien Google Maps',
};

/** Lecture groupée, mise en cache le temps d'une requête. */
export const getSettings = cache(async (): Promise<SiteSettings> => {
  const rows = await db.setting.findMany();
  const values = { ...SETTING_DEFAULTS } as SiteSettings;
  for (const row of rows) {
    if (row.key in values && row.value.trim() !== '') values[row.key as SettingKey] = row.value;
  }
  return values;
});

export function whatsappLink(number: string, text?: string) {
  const digits = number.replace(/\D/g, '');
  return `https://wa.me/${digits}${text ? `?text=${encodeURIComponent(text)}` : ''}`;
}
