import 'server-only';
import type { OutputInfo } from 'sharp';
import { db } from './db';

/**
 * sharp est chargé à la demande : si son binaire manquait sur l'hébergement,
 * seul l'envoi de photos échouerait, jamais l'affichage des pages du back-office.
 */
async function loadSharp() {
  try {
    return (await import('sharp')).default;
  } catch (err) {
    console.error('[media] module sharp indisponible', (err as Error).message);
    throw new Error("Le traitement des photos est momentanément indisponible. Réessayez plus tard ou contactez le support.");
  }
}

export const MAX_UPLOAD_BYTES = 10 * 1024 * 1024;
const ALLOWED = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/avif']);

/**
 * Valide, redimensionne (2000 px max) et convertit en WebP avant stockage en base.
 * Le contenu réel est vérifié par sharp : un faux « .jpg » est rejeté.
 */
export async function storeImage(file: File, alt?: string) {
  if (!ALLOWED.has(file.type)) throw new Error('Format non accepté : JPEG, PNG, WebP ou AVIF uniquement.');
  if (file.size > MAX_UPLOAD_BYTES) throw new Error('Image trop lourde : 10 Mo maximum.');

  const input = Buffer.from(await file.arrayBuffer());
  return storeImageBuffer(input, file.name, alt);
}

export async function storeImageBuffer(input: Buffer, filename: string, alt?: string) {
  const sharp = await loadSharp();
  let out: { data: Buffer; info: OutputInfo };
  try {
    out = await sharp(input)
      .rotate()
      .resize({ width: 2000, height: 2000, fit: 'inside', withoutEnlargement: true })
      .webp({ quality: 82 })
      .toBuffer({ resolveWithObject: true });
  } catch {
    throw new Error("Fichier illisible : ce n'est pas une image valide.");
  }

  return db.media.create({
    data: {
      filename: filename.replace(/\.[^.]+$/, '') + '.webp',
      mimeType: 'image/webp',
      width: out.info.width,
      height: out.info.height,
      size: out.info.size,
      data: new Uint8Array(out.data),
      alt: alt?.slice(0, 255) || null,
    },
    select: { id: true },
  });
}
