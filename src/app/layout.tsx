import type { Metadata, Viewport } from 'next';
import localFont from 'next/font/local';
import type { ReactNode } from 'react';

// Polices variables stockées dans le projet (src/fonts, licence OFL) :
// aucun appel à Google, ni au build ni côté visiteur.
const serif = localFont({
  src: [
    { path: '../fonts/cormorant.woff2', weight: '500 600', style: 'normal' },
    { path: '../fonts/cormorant-italic.woff2', weight: '500 600', style: 'italic' },
  ],
  variable: '--font-serif',
  display: 'swap',
});
const sans = localFont({ src: '../fonts/jost.woff2', weight: '400 600', variable: '--font-sans', display: 'swap' });
const logo = localFont({ src: '../fonts/cinzel.woff2', weight: '500 600', variable: '--font-logo', display: 'swap' });

const siteUrl = process.env.SITE_URL ?? 'http://localhost:3000';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: { default: 'Adélé Baké — Guesthouse & salle de conférence à Cotonou', template: '%s — Adélé Baké, Cotonou' },
  description:
    "Maison d'hôtes à taille humaine au cœur de Cotonou, à 2 km de l'aéroport : chambres climatisées, cuisine béninoise, salle de conférence et navette aéroport offerte.",
  applicationName: 'Adélé Baké',
  alternates: { canonical: '/' },
  openGraph: { type: 'website', locale: 'fr_FR', siteName: 'Adélé Baké' },
  twitter: { card: 'summary_large_image' },
  formatDetection: { telephone: false },
  // Codes fournis par Google Search Console / Bing Webmaster Tools (méthode « balise HTML »)
  verification: {
    google: process.env.GOOGLE_SITE_VERIFICATION || undefined,
    other: process.env.BING_SITE_VERIFICATION ? { 'msvalidate.01': process.env.BING_SITE_VERIFICATION } : undefined,
  },
};

export const viewport: Viewport = { themeColor: '#1F2B45' };

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="fr" className={`${serif.variable} ${sans.variable} ${logo.variable}`}>
      <body>{children}</body>
    </html>
  );
}
