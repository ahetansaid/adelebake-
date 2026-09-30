import type { Metadata, Viewport } from 'next';
import { Cinzel, Cormorant_Garamond, Jost } from 'next/font/google';
import type { ReactNode } from 'react';

// Polices auto-hébergées par Next (aucun appel à Google côté visiteur).
const serif = Cormorant_Garamond({ subsets: ['latin'], weight: ['500', '600'], style: ['normal', 'italic'], variable: '--font-serif', display: 'swap' });
const sans = Jost({ subsets: ['latin'], weight: ['400', '500', '600'], variable: '--font-sans', display: 'swap' });
const logo = Cinzel({ subsets: ['latin'], weight: ['500', '600'], variable: '--font-logo', display: 'swap' });

const siteUrl = process.env.SITE_URL ?? 'http://localhost:3000';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: { default: 'Adélé Baké — Guesthouse & salle de conférence à Cotonou', template: '%s — Adélé Baké, Cotonou' },
  description:
    "Maison d'hôtes à taille humaine au cœur de Cotonou, à 2 km de l'aéroport : chambres climatisées, cuisine béninoise, salle de conférence et navette aéroport offerte.",
  applicationName: 'Adélé Baké',
  openGraph: { type: 'website', locale: 'fr_FR', siteName: 'Adélé Baké' },
};

export const viewport: Viewport = { themeColor: '#1F2B45' };

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="fr" className={`${serif.variable} ${sans.variable} ${logo.variable}`}>
      <body>{children}</body>
    </html>
  );
}
