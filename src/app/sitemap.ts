import type { MetadataRoute } from 'next';
import { GALLERY } from '@/content/decouvrir';
import { db } from '@/lib/db';

export const revalidate = 3600;

// Sitemap avec images (Google Images : photos des chambres, des excursions et de la galerie)
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = (process.env.SITE_URL ?? 'http://localhost:3000').replace(/\/$/, '');
  const [rooms, experiences] = await Promise.all([
    db.room.findMany({ where: { published: true }, select: { slug: true, updatedAt: true, coverId: true, images: { select: { mediaId: true } } } }),
    db.experience.findMany({ where: { published: true }, select: { imageId: true, updatedAt: true } }),
  ]);
  const media = (id: string) => `${base}/media/${id}`;
  const lastExp = experiences.reduce<Date | undefined>((d, e) => (!d || e.updatedAt > d ? e.updatedAt : d), undefined);

  const pages: MetadataRoute.Sitemap = [
    { url: base, changeFrequency: 'weekly', priority: 1 },
    { url: `${base}/chambres`, changeFrequency: 'weekly', priority: 0.9, images: rooms.flatMap((r) => (r.coverId ? [media(r.coverId)] : [])) },
    { url: `${base}/reservation`, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${base}/salle-de-conference`, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${base}/la-table`, changeFrequency: 'monthly', priority: 0.7 },
    {
      url: `${base}/decouvrir`, changeFrequency: 'monthly', priority: 0.7, lastModified: lastExp,
      images: [
        ...experiences.flatMap((e) => (e.imageId ? [media(e.imageId)] : [])),
        ...GALLERY.map((g) => `${base}/images/decouvrir/${g.file}.webp`),
      ],
    },
    { url: `${base}/contact`, changeFrequency: 'yearly', priority: 0.6 },
  ];
  return [
    ...pages,
    ...rooms.map((r) => ({
      url: `${base}/chambres/${r.slug}`,
      lastModified: r.updatedAt,
      priority: 0.8,
      images: [r.coverId, ...r.images.map((i) => i.mediaId)].filter((v): v is string => !!v).map(media),
    })),
  ];
}
