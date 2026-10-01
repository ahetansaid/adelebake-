/**
 * Met à jour la page « Découvrir » : nouvelles photos (dossier local) + nouvelles excursions.
 *   npx tsx --env-file=.env scripts/update-decouvrir.ts "C:\Users\...\imgbank"
 * Idempotent : une excursion existante n'est pas dupliquée, sa photo n'est remplacée qu'une fois
 * (si elle provient encore de Pexels).
 */
import { PrismaClient } from '@prisma/client';
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import sharp from 'sharp';

const dir = process.argv[2];
if (!dir) {
  console.error('Usage : npx tsx --env-file=.env scripts/update-decouvrir.ts <dossier-images>');
  process.exit(1);
}
const db = new PrismaClient();
const files = readdirSync(dir);

function file(prefix: string) {
  const f = files.find((n) => n.startsWith(prefix));
  if (!f) throw new Error(`Image introuvable : ${prefix}…`);
  return join(dir, f);
}

async function store(prefix: string, alt: string, filename: string) {
  const { data, info } = await sharp(readFileSync(file(prefix)))
    .rotate()
    .resize({ width: 2000, height: 2000, fit: 'inside', withoutEnlargement: true })
    .webp({ quality: 84 })
    .toBuffer({ resolveWithObject: true });
  const m = await db.media.create({
    data: { filename: `${filename}.webp`, mimeType: 'image/webp', width: info.width, height: info.height, size: info.size, data: new Uint8Array(data), alt },
  });
  return m.id;
}

type Exp = {
  slug: string; title: string; summary: string; description: string; schedule: string; price: number | null; sortOrder: number;
  image: { prefix: string; alt: string; filename: string };
};

// Photos remplacées sur les excursions existantes (seulement si elles viennent encore de Pexels)
const NEW_PHOTOS: Record<string, Exp['image']> = {
  ganvie: { prefix: 'Pour bien mener sa barque', alt: 'Pirogue devant les maisons sur pilotis de Ganvié, sur le lac Nokoué', filename: 'ganvie-pirogue-lac-nokoue' },
  ouidah: { prefix: '196821446200052009', alt: 'La Porte du Non-Retour sur la plage de Ouidah', filename: 'ouidah-porte-du-non-retour' },
  'cotonou-gourmand': { prefix: 'march', alt: 'Étals du marché Ganhi à Cotonou', filename: 'cotonou-marche-ganhi' },
};

const NEW_EXPERIENCES: Exp[] = [
  {
    slug: 'abomey', title: 'Abomey, la cité des rois', schedule: 'Sur demande · journée (≈ 2 h 30 de route)', price: null, sortOrder: 4,
    summary: 'Les palais royaux du Danxomè, inscrits au patrimoine mondial de l’UNESCO.',
    description: "Ancienne capitale du royaume du Danxomè, Abomey conserve les palais de ses rois, inscrits au patrimoine mondial de l'UNESCO depuis 1985. Bas-reliefs, trônes et récits des Amazones du Dahomey : une plongée dans l'histoire du Bénin.\n\nJournée complète avec chauffeur au départ de la maison ; visite guidée sur place.",
    image: { prefix: 'Palais royal d', alt: "Le palais royal d'Abomey, ancienne capitale du royaume du Danxomè", filename: 'abomey-palais-royal' },
  },
  {
    slug: 'plages-route-des-peches', title: 'Les plages de la route des Pêches', schedule: 'Sur demande · demi-journée', price: null, sortOrder: 5,
    summary: 'Sable fin, cocotiers et villages de pêcheurs, aux portes de Cotonou.',
    description: "La route des Pêches longe l'océan de Cotonou jusqu'à Ouidah : longues plages de sable, villages de pêcheurs et paillotes où déjeuner de poisson grillé les pieds dans le sable.\n\nAttention : la baignade y est souvent dangereuse à cause des courants ; nous vous indiquons les endroits sûrs.",
    image: { prefix: 'Nos bonnes adresses', alt: 'Plage et cocotiers le long de la route des Pêches, près de Cotonou', filename: 'plage-route-des-peches' },
  },
  {
    slug: 'dassa-zoume', title: 'Dassa-Zoumé, la ville aux 41 collines', schedule: 'Sur demande · journée (≈ 3 h de route)', price: null, sortOrder: 6,
    summary: 'Collines granitiques, randonnée et lieu de pèlerinage au cœur du Bénin.',
    description: "Au centre du pays, Dassa-Zoumé est surnommée « la ville aux 41 collines » pour ses reliefs de granit. On y randonne entre les rochers et l'on visite la grotte mariale d'Arigbo, grand lieu de pèlerinage.\n\nJournée complète avec chauffeur ; idéale pour découvrir le Bénin de l'intérieur.",
    image: { prefix: 'Les collines de Dassa', alt: 'Les collines granitiques de Dassa-Zoumé', filename: 'dassa-zoume-collines' },
  },
];

async function main() {
  console.log(`Base : ${(process.env.DATABASE_URL ?? '').replace(/:\/\/[^@]+@/, '://***@').replace(/\?.*/, '')}`);

  for (const [slug, img] of Object.entries(NEW_PHOTOS)) {
    const e = await db.experience.findUnique({ where: { slug }, include: { image: { select: { filename: true } } } });
    if (!e) { console.log(`  · ${slug} absente, ignorée`); continue; }
    if (e.image && !e.image.filename.startsWith('pexels-')) { console.log(`  = ${slug} : photo déjà personnalisée, inchangée`); continue; }
    const id = await store(img.prefix, img.alt, img.filename);
    await db.experience.update({ where: { id: e.id }, data: { imageId: id } });
    if (e.imageId) await db.media.delete({ where: { id: e.imageId } }).catch(() => undefined);
    console.log(`  ~ ${slug} : nouvelle photo`);
  }

  // Le marché Ganhi rejoint Dantokpa dans le texte de la visite gourmande
  await db.experience.updateMany({
    where: { slug: 'cotonou-gourmand', description: { not: { contains: 'Ganhi' } } },
    data: { description: "Plongée dans les grands marchés de Cotonou — Dantokpa, l'un des plus grands d'Afrique de l'Ouest, et le marché Ganhi — puis dégustation dans les maquis du quartier.\n\nDemi-journée à pied et en taxi-moto, avec un guide de la maison." },
  });

  for (const x of NEW_EXPERIENCES) {
    if (await db.experience.findUnique({ where: { slug: x.slug } })) { console.log(`  = ${x.slug} existe déjà`); continue; }
    const { image, ...data } = x;
    await db.experience.create({ data: { ...data, imageId: await store(image.prefix, image.alt, image.filename) } });
    console.log(`  + ${x.title}`);
  }
  console.log(`✓ ${await db.experience.count({ where: { published: true } })} excursions publiées`);
}

main().catch((e) => { console.error(e); process.exitCode = 1; }).finally(() => db.$disconnect());
