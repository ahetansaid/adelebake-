/**
 * Données de départ (idempotent : relançable sans doublons).
 * Contenus indicatifs à faire valider par l'établissement ; avis marqués « exemple ».
 * Les photos Pexels sont téléchargées puis stockées en base comme n'importe quelle photo envoyée depuis le back-office.
 */
import { PrismaClient, type MenuSection } from '@prisma/client';
import bcrypt from 'bcryptjs';
import sharp from 'sharp';

const db = new PrismaClient();
const px = (id: number) => `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&w=1800`;

async function image(pexelsId: number, alt: string) {
  try {
    const res = await fetch(px(pexelsId));
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const { data, info } = await sharp(Buffer.from(await res.arrayBuffer()))
      .resize({ width: 2000, height: 2000, fit: 'inside', withoutEnlargement: true })
      .webp({ quality: 82 })
      .toBuffer({ resolveWithObject: true });
    const m = await db.media.create({
      data: { filename: `pexels-${pexelsId}.webp`, mimeType: 'image/webp', width: info.width, height: info.height, size: info.size, data: new Uint8Array(data), alt },
    });
    return m.id;
  } catch (err) {
    console.warn(`  ! photo ${pexelsId} non téléchargée (${(err as Error).message}) — à ajouter depuis le back-office`);
    return null;
  }
}

const ROOMS = [
  {
    slug: 'chambre-classique', name: 'Chambre Classique', pricePerNight: 35000, capacity: 2, bedType: 'Lit double', sortOrder: 1,
    summary: "L'essentiel, bien fait : une chambre calme et fraîche pour une escale ou un court séjour.",
    description: "Une chambre chaleureuse aux boiseries, avec un grand lit double, une salle de bain privée avec douche et la climatisation.\n\nIdéale pour une nuit d'escale entre deux vols : la navette vous récupère à l'aéroport, et le petit-déjeuner béninois vous attend le matin.",
    amenities: ['Climatisation', 'Salle de bain privée', 'Wi-Fi', 'TV écran plat', 'Petit-déjeuner inclus', 'Moustiquaire'],
    photos: [[9130978, 'Chambre aux boiseries et lit double'], [14690432, 'Plateau de petit-déjeuner']] as [number, string][],
  },
  {
    slug: 'chambre-superieure', name: 'Chambre Supérieure', pricePerNight: 45000, capacity: 2, bedType: 'Grand lit', sortOrder: 2,
    summary: 'Plus d’espace, un coin salon en rotin et une fenêtre sur la cour et ses palmiers.',
    description: "Plus spacieuse, la chambre Supérieure offre un coin salon en rotin pour lire ou travailler, un grand lit et une salle de bain privée.\n\nSa fenêtre donne sur la cour : le matin, le chant des oiseaux ; le soir, les lumières du barbecue.",
    amenities: ['Climatisation', 'Salle de bain privée', 'Coin salon', 'Wi-Fi', 'TV écran plat', 'Petit-déjeuner inclus'],
    photos: [[237371, 'Chambre spacieuse avec assiettes décoratives au mur'], [15156681, 'Coin salon en rotin']] as [number, string][],
  },
  {
    slug: 'suite-adele', name: 'Suite Adélé', pricePerNight: 60000, capacity: 3, bedType: 'Grand lit + canapé', sortOrder: 3,
    summary: 'Chambre et bureau séparés : idéale pour les séjours d’affaires et les missions longues.',
    description: "Notre plus belle chambre : un espace nuit au calme, un bureau séparé pour travailler, et une salle de bain privée.\n\nPensée pour les missions de plusieurs jours, elle se combine parfaitement avec la salle de conférence.",
    amenities: ['Climatisation', 'Bureau séparé', 'Salle de bain privée', 'Wi-Fi haut débit', 'TV écran plat', 'Petit-déjeuner inclus', 'Minibar'],
    photos: [[5883728, 'Suite aux tons bruns et lumière tamisée'], [8112338, 'Salon en rotin']] as [number, string][],
  },
];

const MENU: { section: MenuSection; name: string; description?: string; price?: number; featured?: boolean }[] = [
  { section: 'BENINOIS', name: 'Amiwo au poulet', description: 'Pâte de maïs rouge à la tomate, poulet mijoté.', price: 3500, featured: true },
  { section: 'BENINOIS', name: 'Poisson braisé & aloko', description: 'Poisson du jour grillé, bananes plantains frites, piment frais.', price: 5000, featured: true },
  { section: 'BENINOIS', name: 'Pâte de maïs, sauce gboma', description: 'Sauce aux feuilles de gboma, viande ou poisson fumé.', price: 2500 },
  { section: 'BENINOIS', name: 'Atassi', description: 'Riz et haricots, sauce tomate, œuf dur.', price: 2000 },
  { section: 'BENINOIS', name: 'Riz sauce arachide', description: 'Sauce onctueuse à l’arachide, poulet ou bœuf.', price: 3000 },
  { section: 'GRILLADES', name: 'Brochettes de bœuf', description: 'Marinées aux épices, servies avec alloco ou frites.', price: 3000, featured: true },
  { section: 'GRILLADES', name: 'Poulet braisé', description: 'Demi-poulet bicyclette au feu de bois.', price: 4500 },
  { section: 'GRILLADES', name: 'Maïs grillé', price: 1000 },
  { section: 'PETIT_DEJEUNER', name: 'Petit-déjeuner béninois', description: 'Bouillie, akara, fruits de saison, café ou thé.', price: 2000, featured: true },
  { section: 'PETIT_DEJEUNER', name: 'Petit-déjeuner continental', description: 'Pain, beurre, confiture, omelette, jus, boisson chaude.', price: 3000 },
  { section: 'BOISSONS', name: 'Bissap maison', description: "Infusion d'hibiscus, servie bien fraîche.", price: 1000, featured: true },
  { section: 'BOISSONS', name: 'Jus de baobab', price: 1000 },
  { section: 'BOISSONS', name: 'Gingembre pressé', price: 1000 },
  { section: 'BOISSONS', name: 'Bière locale', price: 1000 },
  { section: 'BOISSONS', name: 'Cocktail au sodabi', description: 'L’eau-de-vie de palme béninoise, version cocktail.', price: 2500 },
];

const EXPERIENCES = [
  {
    slug: 'ganvie', title: 'Ganvié, la cité lacustre', schedule: 'Chaque samedi, départ 8 h', price: 15000, sortOrder: 1, photo: [6729840, 'Pêcheur en pirogue sur le lac Nokoué'] as [number, string],
    summary: 'La « Venise de l’Afrique » en pirogue, sur le lac Nokoué.',
    description: "Traversée du lac Nokoué en pirogue jusqu'à Ganvié, village bâti sur pilotis depuis plus de trois siècles. Marché flottant, vie des pêcheurs, histoire du peuple Tofinu.\n\nDemi-journée, transfert depuis la maison et guide inclus.",
  },
  {
    slug: 'ouidah', title: 'Une journée à Ouidah', schedule: 'Sur demande', price: 20000, sortOrder: 2, photo: [32032141, 'Vue aérienne de Ouidah'] as [number, string],
    summary: 'Route des Esclaves, Porte du Non-Retour, temple des Pythons.',
    description: "À 40 km de Cotonou, Ouidah raconte une page majeure de l'histoire : la Route des Esclaves jusqu'à la Porte du Non-Retour, la forêt sacrée de Kpassè et le temple des Pythons.\n\nJournée complète avec chauffeur et guide.",
  },
  {
    slug: 'cotonou-gourmand', title: 'Cotonou gourmand', schedule: 'Sur demande', price: 10000, sortOrder: 3, photo: [2641886, 'Brochettes grillées et riz'] as [number, string],
    summary: 'Marché Dantokpa, maquis et grillades : la ville se goûte.',
    description: "Plongée dans le grand marché Dantokpa, l'un des plus grands d'Afrique de l'Ouest, puis dégustation dans les maquis du quartier.\n\nDemi-journée à pied et en taxi-moto, avec un guide de la maison.",
  },
];

const TESTIMONIALS = [
  { author: 'Aïcha K.', origin: 'Séjour en famille · Lomé', quote: 'Arrivés de nuit, la navette nous attendait. Le lendemain, poisson braisé et aloko dans la cour : on s’est sentis chez nous dès le premier jour.' },
  { author: 'Koffi & Mariam', origin: 'Séminaire · Abidjan', quote: 'On venait pour un séminaire de deux jours. On est restés le week-end pour Ganvié et la cuisine d’Adélé.' },
  { author: 'Jean-Marc D.', origin: 'Mission · Paris', quote: 'Calme, propre, un Wi-Fi qui fonctionne et une équipe aux petits soins. Mon adresse à Cotonou.' },
];

async function main() {
  console.log('→ Chambres');
  for (const r of ROOMS) {
    const { photos, ...data } = r;
    const existing = await db.room.findUnique({ where: { slug: r.slug } });
    if (existing) continue;
    const ids = [];
    for (const [id, alt] of photos) ids.push(await image(id, alt));
    const [cover, ...rest] = ids;
    await db.room.create({
      data: { ...data, coverId: cover, images: { create: rest.filter(Boolean).map((mediaId, i) => ({ mediaId: mediaId!, sortOrder: i })) } },
    });
    console.log(`  + ${r.name}`);
  }

  console.log('→ Carte');
  if ((await db.menuItem.count()) === 0) {
    await db.menuItem.createMany({ data: MENU.map((m, i) => ({ ...m, sortOrder: i })) });
    console.log(`  + ${MENU.length} plats et boissons`);
  }

  console.log('→ Excursions');
  for (const e of EXPERIENCES) {
    if (await db.experience.findUnique({ where: { slug: e.slug } })) continue;
    const { photo, ...data } = e;
    await db.experience.create({ data: { ...data, imageId: await image(photo[0], photo[1]) } });
    console.log(`  + ${e.title}`);
  }

  console.log('→ Avis (exemples)');
  if ((await db.testimonial.count()) === 0) {
    await db.testimonial.createMany({ data: TESTIMONIALS.map((t, i) => ({ ...t, isExample: true, sortOrder: i })) });
  }

  console.log('→ Administrateur');
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD;
  if (!email || !password) {
    console.log('  (ADMIN_EMAIL / ADMIN_PASSWORD absents : aucun compte créé — utilisez npm run admin:create)');
  } else if (!(await db.adminUser.findUnique({ where: { email } }))) {
    if (password.length < 12) throw new Error('ADMIN_PASSWORD doit faire au moins 12 caractères.');
    await db.adminUser.create({ data: { email, name: 'Administrateur', passwordHash: await bcrypt.hash(password, 12) } });
    console.log(`  + ${email}`);
  }
}

main()
  .then(() => console.log('✓ Données initiales en place'))
  .catch((e) => { console.error(e); process.exitCode = 1; })
  .finally(() => db.$disconnect());
