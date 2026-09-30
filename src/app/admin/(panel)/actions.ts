'use server';

import bcrypt from 'bcryptjs';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { z } from 'zod';
import type { BookingStatus, MessageStatus, QuoteStatus } from '@prisma/client';
import { requireAdmin } from '@/lib/auth';
import { db } from '@/lib/db';
import { slugify } from '@/lib/format';
import { storeImage } from '@/lib/media';
import { SETTING_DEFAULTS, type SettingKey } from '@/lib/settings';

export type ActionState = { error?: string; ok?: string };

// ---------- utilitaires ----------

const text = (f: FormData, k: string) => String(f.get(k) ?? '').trim();
const optText = (f: FormData, k: string) => text(f, k) || null;
const optInt = (f: FormData, k: string) => {
  const v = text(f, k).replace(/\s/g, '');
  return v === '' ? null : Number.parseInt(v, 10);
};
const bool = (f: FormData, k: string) => f.get(k) === 'on';
const lines = (f: FormData, k: string) => text(f, k).split(/\r?\n|,/).map((s) => s.trim()).filter(Boolean).slice(0, 30);
const files = (f: FormData, k: string) => f.getAll(k).filter((v): v is File => v instanceof File && v.size > 0);

/** Les contenus publics sont mis en cache : on les rafraîchit après chaque modification. */
function refreshSite() {
  revalidatePath('/', 'layout');
}

function fail(err: unknown): ActionState {
  if (err instanceof z.ZodError) return { error: err.issues.map((i) => i.message).join(' ') };
  if (err instanceof Error && !('digest' in err)) return { error: err.message };
  throw err; // redirect() et notFound() doivent remonter
}

async function uniqueSlug(model: 'room' | 'experience', base: string, excludeId?: string) {
  const root = slugify(base) || 'element';
  for (let i = 0; i < 50; i++) {
    const slug = i === 0 ? root : `${root}-${i + 1}`;
    const found = model === 'room'
      ? await db.room.findUnique({ where: { slug }, select: { id: true } })
      : await db.experience.findUnique({ where: { slug }, select: { id: true } });
    if (!found || found.id === excludeId) return slug;
  }
  return `${root}-${Date.now()}`;
}

// ---------- demandes ----------

const BOOKING: BookingStatus[] = ['NEW', 'CONFIRMED', 'DECLINED', 'CANCELLED'];
const QUOTE: QuoteStatus[] = ['NEW', 'QUOTED', 'WON', 'LOST'];
const MESSAGE: MessageStatus[] = ['NEW', 'READ', 'ANSWERED', 'ARCHIVED'];

export async function updateBooking(id: string, _p: ActionState, f: FormData): Promise<ActionState> {
  await requireAdmin();
  const status = text(f, 'status') as BookingStatus;
  if (!BOOKING.includes(status)) return { error: 'Statut inconnu.' };
  await db.bookingRequest.update({ where: { id }, data: { status, adminNotes: optText(f, 'adminNotes')?.slice(0, 5000) ?? null } });
  revalidatePath('/admin', 'layout');
  return { ok: 'Demande mise à jour.' };
}

export async function updateQuote(id: string, _p: ActionState, f: FormData): Promise<ActionState> {
  await requireAdmin();
  const status = text(f, 'status') as QuoteStatus;
  if (!QUOTE.includes(status)) return { error: 'Statut inconnu.' };
  await db.conferenceRequest.update({ where: { id }, data: { status, adminNotes: optText(f, 'adminNotes')?.slice(0, 5000) ?? null } });
  revalidatePath('/admin', 'layout');
  return { ok: 'Demande mise à jour.' };
}

export async function setMessageStatus(id: string, status: MessageStatus) {
  await requireAdmin();
  if (!MESSAGE.includes(status)) return;
  await db.contactMessage.update({ where: { id }, data: { status } });
  revalidatePath('/admin', 'layout');
}

export async function deleteRequest(kind: 'booking' | 'quote' | 'message', id: string) {
  await requireAdmin();
  if (kind === 'booking') await db.bookingRequest.delete({ where: { id } });
  if (kind === 'quote') await db.conferenceRequest.delete({ where: { id } });
  if (kind === 'message') await db.contactMessage.delete({ where: { id } });
  revalidatePath('/admin', 'layout');
  redirect({ booking: '/admin/reservations', quote: '/admin/devis', message: '/admin/messages' }[kind] + '?ok=supprime');
}

// ---------- chambres ----------

const roomSchema = z.object({
  name: z.string().min(2, 'Le nom est obligatoire.').max(120),
  summary: z.string().min(10, 'Le résumé doit faire au moins 10 caractères.').max(300),
  description: z.string().min(20, 'La description doit faire au moins 20 caractères.').max(8000),
  pricePerNight: z.number({ message: 'Prix invalide.' }).int().min(1000, 'Prix trop bas (FCFA).').max(10_000_000),
  capacity: z.number().int().min(1).max(12),
  bedType: z.string().min(2, 'Précisez le couchage.').max(80),
  sizeM2: z.number().int().min(5).max(500).nullable(),
  sortOrder: z.number().int().min(0).max(999),
});

export async function saveRoom(id: string | null, _p: ActionState, f: FormData): Promise<ActionState> {
  await requireAdmin();
  try {
    const data = roomSchema.parse({
      name: text(f, 'name'), summary: text(f, 'summary'), description: text(f, 'description'),
      pricePerNight: optInt(f, 'pricePerNight'), capacity: optInt(f, 'capacity') ?? 2, bedType: text(f, 'bedType'),
      sizeM2: optInt(f, 'sizeM2'), sortOrder: optInt(f, 'sortOrder') ?? 0,
    });
    const slug = await uniqueSlug('room', text(f, 'slug') || data.name, id ?? undefined);
    const common = { ...data, slug, amenities: lines(f, 'amenities'), published: bool(f, 'published') };

    const cover = files(f, 'cover')[0];
    const coverId = cover ? (await storeImage(cover, data.name)).id : undefined;
    const gallery = [];
    for (const file of files(f, 'gallery').slice(0, 12)) gallery.push((await storeImage(file, data.name)).id);

    let roomId = id;
    if (id) {
      const count = await db.roomImage.count({ where: { roomId: id } });
      await db.room.update({
        where: { id },
        data: { ...common, ...(coverId ? { coverId } : {}), images: { create: gallery.map((mediaId, i) => ({ mediaId, sortOrder: count + i })) } },
      });
    } else {
      const room = await db.room.create({
        data: { ...common, coverId: coverId ?? null, images: { create: gallery.map((mediaId, i) => ({ mediaId, sortOrder: i })) } },
      });
      roomId = room.id;
    }
    refreshSite();
    if (!id) redirect(`/admin/chambres/${roomId}?ok=cree`);
    return { ok: 'Chambre enregistrée.' };
  } catch (err) {
    return fail(err);
  }
}

export async function removeRoomImage(roomId: string, imageId: string) {
  await requireAdmin();
  const img = await db.roomImage.findFirst({ where: { id: imageId, roomId } });
  if (img) {
    await db.roomImage.delete({ where: { id: img.id } });
    await db.media.delete({ where: { id: img.mediaId } }).catch(() => undefined);
  }
  refreshSite();
  revalidatePath(`/admin/chambres/${roomId}`);
}

/** Échange la photo principale avec une photo de la galerie. */
export async function makeCover(roomId: string, imageId: string) {
  await requireAdmin();
  const [room, img] = await Promise.all([
    db.room.findUnique({ where: { id: roomId }, select: { coverId: true } }),
    db.roomImage.findFirst({ where: { id: imageId, roomId } }),
  ]);
  if (!room || !img) return;
  await db.$transaction([
    db.room.update({ where: { id: roomId }, data: { coverId: img.mediaId } }),
    room.coverId ? db.roomImage.update({ where: { id: img.id }, data: { mediaId: room.coverId } }) : db.roomImage.delete({ where: { id: img.id } }),
  ]);
  refreshSite();
  revalidatePath(`/admin/chambres/${roomId}`);
}

export async function deleteRoom(id: string) {
  await requireAdmin();
  const room = await db.room.findUnique({ where: { id }, include: { images: true } });
  if (room) {
    await db.room.delete({ where: { id } });
    const mediaIds = [room.coverId, ...room.images.map((i) => i.mediaId)].filter((v): v is string => !!v);
    await db.media.deleteMany({ where: { id: { in: mediaIds } } });
  }
  refreshSite();
  redirect('/admin/chambres?ok=supprime');
}

// ---------- carte ----------

const menuSchema = z.object({
  section: z.enum(['PETIT_DEJEUNER', 'BENINOIS', 'GRILLADES', 'BOISSONS'], { message: 'Rubrique invalide.' }),
  name: z.string().min(2, 'Le nom est obligatoire.').max(120),
  description: z.string().max(400).nullable(),
  price: z.number().int().min(0).max(1_000_000).nullable(),
  sortOrder: z.number().int().min(0).max(999),
});

export async function saveMenuItem(id: string | null, _p: ActionState, f: FormData): Promise<ActionState> {
  await requireAdmin();
  try {
    const data = {
      ...menuSchema.parse({
        section: text(f, 'section'), name: text(f, 'name'), description: optText(f, 'description'),
        price: optInt(f, 'price'), sortOrder: optInt(f, 'sortOrder') ?? 0,
      }),
      featured: bool(f, 'featured'), published: bool(f, 'published'),
    };
    if (id) await db.menuItem.update({ where: { id }, data });
    else await db.menuItem.create({ data });
    refreshSite();
    redirect('/admin/carte?ok=enregistre');
  } catch (err) {
    return fail(err);
  }
}

export async function deleteMenuItem(id: string) {
  await requireAdmin();
  await db.menuItem.delete({ where: { id } });
  refreshSite();
  redirect('/admin/carte?ok=supprime');
}

// ---------- excursions ----------

const expSchema = z.object({
  title: z.string().min(2, 'Le titre est obligatoire.').max(120),
  summary: z.string().min(10, 'Le résumé doit faire au moins 10 caractères.').max(300),
  description: z.string().min(20, 'La description doit faire au moins 20 caractères.').max(8000),
  schedule: z.string().max(120).nullable(),
  price: z.number().int().min(0).max(10_000_000).nullable(),
  sortOrder: z.number().int().min(0).max(999),
});

export async function saveExperience(id: string | null, _p: ActionState, f: FormData): Promise<ActionState> {
  await requireAdmin();
  try {
    const data = expSchema.parse({
      title: text(f, 'title'), summary: text(f, 'summary'), description: text(f, 'description'),
      schedule: optText(f, 'schedule'), price: optInt(f, 'price'), sortOrder: optInt(f, 'sortOrder') ?? 0,
    });
    const slug = await uniqueSlug('experience', data.title, id ?? undefined);
    const image = files(f, 'image')[0];
    const imageId = image ? (await storeImage(image, data.title)).id : undefined;
    const payload = { ...data, slug, published: bool(f, 'published'), ...(imageId ? { imageId } : {}) };
    if (id) {
      const old = await db.experience.findUnique({ where: { id }, select: { imageId: true } });
      await db.experience.update({ where: { id }, data: payload });
      if (imageId && old?.imageId) await db.media.delete({ where: { id: old.imageId } }).catch(() => undefined);
    } else {
      await db.experience.create({ data: payload });
    }
    refreshSite();
    redirect('/admin/excursions?ok=enregistre');
  } catch (err) {
    return fail(err);
  }
}

export async function deleteExperience(id: string) {
  await requireAdmin();
  const e = await db.experience.delete({ where: { id } });
  if (e.imageId) await db.media.delete({ where: { id: e.imageId } }).catch(() => undefined);
  refreshSite();
  redirect('/admin/excursions?ok=supprime');
}

// ---------- avis ----------

const testiSchema = z.object({
  author: z.string().min(2, 'Le nom est obligatoire.').max(120),
  origin: z.string().max(120).nullable(),
  quote: z.string().min(10, "L'avis doit faire au moins 10 caractères.").max(800),
  rating: z.number().int().min(1).max(5).nullable(),
  sortOrder: z.number().int().min(0).max(999),
});

export async function saveTestimonial(id: string | null, _p: ActionState, f: FormData): Promise<ActionState> {
  await requireAdmin();
  try {
    const data = {
      ...testiSchema.parse({
        author: text(f, 'author'), origin: optText(f, 'origin'), quote: text(f, 'quote'),
        rating: optInt(f, 'rating'), sortOrder: optInt(f, 'sortOrder') ?? 0,
      }),
      published: bool(f, 'published'),
      isExample: bool(f, 'isExample'),
    };
    if (id) await db.testimonial.update({ where: { id }, data });
    else await db.testimonial.create({ data });
    refreshSite();
    redirect('/admin/avis?ok=enregistre');
  } catch (err) {
    return fail(err);
  }
}

export async function deleteTestimonial(id: string) {
  await requireAdmin();
  await db.testimonial.delete({ where: { id } });
  refreshSite();
  redirect('/admin/avis?ok=supprime');
}

// ---------- paramètres ----------

export async function saveSettings(_p: ActionState, f: FormData): Promise<ActionState> {
  await requireAdmin();
  const keys = Object.keys(SETTING_DEFAULTS) as SettingKey[];
  const email = z.string().email();
  for (const k of ['email', 'notifyEmail'] as const) {
    if (!email.safeParse(text(f, k)).success) return { error: `Adresse e-mail invalide : ${text(f, k) || '(vide)'}.` };
  }
  if (!/^\d{8,15}$/.test(text(f, 'whatsapp').replace(/\D/g, ''))) return { error: 'Numéro WhatsApp invalide (chiffres avec indicatif, ex. 2290162252194).' };
  for (const k of ['facebook', 'instagram', 'mapsUrl'] as const) {
    const v = text(f, k);
    if (v && !/^https:\/\//.test(v)) return { error: 'Les liens doivent commencer par https://' };
  }
  await db.$transaction(
    keys.map((key) => {
      const value = text(f, key).slice(0, 500);
      return db.setting.upsert({ where: { key }, create: { key, value }, update: { value } });
    }),
  );
  refreshSite();
  return { ok: 'Paramètres enregistrés.' };
}

// ---------- comptes ----------

export async function changePassword(_p: ActionState, f: FormData): Promise<ActionState> {
  const me = await requireAdmin();
  const current = String(f.get('current') ?? '');
  const next = String(f.get('next') ?? '');
  if (next.length < 12) return { error: 'Le nouveau mot de passe doit faire au moins 12 caractères.' };
  if (next !== String(f.get('confirm') ?? '')) return { error: 'La confirmation ne correspond pas.' };
  const user = await db.adminUser.findUniqueOrThrow({ where: { id: me.id } });
  if (!(await bcrypt.compare(current, user.passwordHash))) return { error: 'Mot de passe actuel incorrect.' };
  await db.adminUser.update({ where: { id: me.id }, data: { passwordHash: await bcrypt.hash(next, 12) } });
  return { ok: 'Mot de passe modifié.' };
}

export async function addAdmin(_p: ActionState, f: FormData): Promise<ActionState> {
  await requireAdmin();
  const email = text(f, 'email').toLowerCase();
  const name = text(f, 'name');
  const password = String(f.get('password') ?? '');
  if (!z.string().email().safeParse(email).success) return { error: 'E-mail invalide.' };
  if (name.length < 2) return { error: 'Le nom est obligatoire.' };
  if (password.length < 12) return { error: 'Mot de passe : 12 caractères minimum.' };
  if (await db.adminUser.findUnique({ where: { email } })) return { error: 'Ce compte existe déjà.' };
  await db.adminUser.create({ data: { email, name, passwordHash: await bcrypt.hash(password, 12) } });
  revalidatePath('/admin/compte');
  return { ok: `Compte créé pour ${email}.` };
}

export async function deleteAdmin(id: string) {
  const me = await requireAdmin();
  if (id === me.id) return; // on ne se supprime pas soi-même
  if ((await db.adminUser.count()) <= 1) return;
  await db.adminUser.delete({ where: { id } });
  revalidatePath('/admin/compte');
}
