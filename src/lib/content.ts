import 'server-only';
import type { MenuSection } from '@prisma/client';
import { db } from './db';

export const MENU_SECTIONS: { key: MenuSection; label: string; intro: string }[] = [
  { key: 'BENINOIS', label: 'Cuisine béninoise', intro: 'Les classiques de la maison, préparés chaque jour.' },
  { key: 'GRILLADES', label: 'Grillades & barbecue', intro: 'Au feu de bois, le soir dans la cour.' },
  { key: 'PETIT_DEJEUNER', label: 'Petit-déjeuner', intro: 'Servi dès 6 h 30, en salle ou sur la terrasse.' },
  { key: 'BOISSONS', label: 'Bar & jus maison', intro: 'Jus pressés, boissons locales et cocktails.' },
];

const roomCardSelect = {
  id: true, slug: true, name: true, capacity: true, bedType: true, sizeM2: true, pricePerNight: true, coverId: true,
  cover: { select: { alt: true } },
} as const;

export function publishedRooms(take?: number) {
  return db.room.findMany({ where: { published: true }, orderBy: [{ sortOrder: 'asc' }, { pricePerNight: 'asc' }], select: roomCardSelect, take });
}

export function publishedTestimonials() {
  return db.testimonial.findMany({
    where: { published: true }, orderBy: { sortOrder: 'asc' },
    select: { id: true, author: true, origin: true, quote: true, isExample: true },
  });
}

export function publishedExperiences(take?: number) {
  return db.experience.findMany({ where: { published: true }, orderBy: { sortOrder: 'asc' }, take, include: { image: { select: { alt: true } } } });
}

export async function menuBySection() {
  const items = await db.menuItem.findMany({ where: { published: true }, orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }] });
  return MENU_SECTIONS.map((s) => ({ ...s, items: items.filter((i) => i.section === s.key) }));
}

/** Date du jour au Bénin, format AAAA-MM-JJ (valeur min des champs date). */
export function todayIso() {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Africa/Porto-Novo' }).format(new Date());
}
