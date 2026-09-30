import { createHash } from 'node:crypto';
import { headers } from 'next/headers';
import { db } from './db';

/** Adresse IP du visiteur, hachée : on ne stocke jamais l'IP en clair. */
export async function clientFingerprint() {
  const h = await headers();
  const ip = h.get('x-forwarded-for')?.split(',')[0]?.trim() || h.get('x-real-ip') || 'unknown';
  return createHash('sha256').update(`${ip}|${process.env.AUTH_SECRET ?? ''}`).digest('hex').slice(0, 32);
}

/**
 * Fenêtre fixe stockée en base (fonctionne aussi en serverless).
 * Retourne false si la limite est atteinte.
 */
export async function rateLimit(scope: string, limit: number, windowSeconds: number) {
  const key = `${scope}:${await clientFingerprint()}`;
  const now = new Date();
  const resetAt = new Date(now.getTime() + windowSeconds * 1000);

  const row = await db.$transaction(async (tx) => {
    const current = await tx.rateLimit.findUnique({ where: { key } });
    if (!current || current.resetAt < now) {
      return tx.rateLimit.upsert({ where: { key }, create: { key, count: 1, resetAt }, update: { count: 1, resetAt } });
    }
    return tx.rateLimit.update({ where: { key }, data: { count: { increment: 1 } } });
  });

  // ménage occasionnel des entrées expirées
  if (Math.random() < 0.02) await db.rateLimit.deleteMany({ where: { resetAt: { lt: now } } });

  return row.count <= limit;
}
