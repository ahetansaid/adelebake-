import type { MetadataRoute } from 'next';
import { db } from '@/lib/db';

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = (process.env.SITE_URL ?? 'http://localhost:3000').replace(/\/$/, '');
  const rooms = await db.room.findMany({ where: { published: true }, select: { slug: true, updatedAt: true } });
  const pages = ['', '/chambres', '/reservation', '/salle-de-conference', '/la-table', '/decouvrir', '/contact'];
  return [
    ...pages.map((p) => ({ url: `${base}${p}`, changeFrequency: 'weekly' as const, priority: p === '' ? 1 : 0.8 })),
    ...rooms.map((r) => ({ url: `${base}/chambres/${r.slug}`, lastModified: r.updatedAt, priority: 0.7 })),
  ];
}
