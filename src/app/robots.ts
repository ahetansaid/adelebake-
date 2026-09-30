import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const base = (process.env.SITE_URL ?? 'http://localhost:3000').replace(/\/$/, '');
  // Tant que le site n'est pas officiellement en ligne, ALLOW_INDEXING reste absent : aucun référencement.
  if (process.env.ALLOW_INDEXING !== 'true') return { rules: { userAgent: '*', disallow: '/' } };
  return {
    rules: { userAgent: '*', allow: '/', disallow: ['/admin', '/media/'] },
    sitemap: `${base}/sitemap.xml`,
  };
}
