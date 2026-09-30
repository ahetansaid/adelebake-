import type { SiteSettings } from './settings';

export const SITE_NAME = 'Adélé Baké';
export const SITE_FULL_NAME = 'Adélé Baké — Guesthouse & Conference Venue';

export function siteUrl() {
  return (process.env.SITE_URL ?? 'http://localhost:3000').replace(/\/$/, '');
}

export function absolute(path: string) {
  return path.startsWith('http') ? path : `${siteUrl()}${path.startsWith('/') ? '' : '/'}${path}`;
}

/** Sérialisation sûre pour <script type="application/ld+json"> (pas d'injection de </script>). */
export function ldJson(data: unknown) {
  return { __html: JSON.stringify(data).replace(/</g, '\\u003c') };
}

/** Identité de l'établissement, réutilisée par toutes les données structurées (@id commun). */
export function businessRef() {
  return { '@id': `${siteUrl()}/#hotel` };
}

export function postalAddress(s: SiteSettings) {
  return { '@type': 'PostalAddress', streetAddress: s.address, addressLocality: 'Cotonou', addressRegion: 'Littoral', addressCountry: 'BJ' };
}

export function geo(s: SiteSettings) {
  const lat = Number.parseFloat(s.latitude.replace(',', '.'));
  const lng = Number.parseFloat(s.longitude.replace(',', '.'));
  return Number.isFinite(lat) && Number.isFinite(lng) ? { '@type': 'GeoCoordinates', latitude: lat, longitude: lng } : undefined;
}

export function breadcrumbList(items: { name: string; path?: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [{ name: 'Accueil', path: '/' }, ...items].map((it, i) => ({
      '@type': 'ListItem', position: i + 1, name: it.name, ...(it.path ? { item: absolute(it.path) } : {}),
    })),
  };
}
