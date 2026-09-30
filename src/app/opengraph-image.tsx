import { ImageResponse } from 'next/og';

// Image d'aperçu par défaut (partages WhatsApp, Facebook, LinkedIn…), générée au build.
export const alt = 'Adélé Baké — guesthouse et salle de conférence à Cotonou, Bénin';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function OgImage() {
  return new ImageResponse(
    (
      <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', background: 'linear-gradient(135deg, #1F2B45 0%, #2C3B5E 100%)', color: '#FBEBDC', fontFamily: 'serif' }}>
        <div style={{ display: 'flex', fontSize: 120, color: '#E3B48A', letterSpacing: -6 }}>AB</div>
        <div style={{ display: 'flex', width: 220, height: 3, background: '#B8733F', margin: '8px 0 28px' }} />
        <div style={{ display: 'flex', fontSize: 76, letterSpacing: 10 }}>ADÉLÉ BAKÉ</div>
        <div style={{ display: 'flex', fontSize: 26, letterSpacing: 8, color: '#E3B48A', marginTop: 12 }}>GUESTHOUSE &amp; CONFERENCE VENUE</div>
        <div style={{ display: 'flex', fontSize: 34, marginTop: 48, color: '#F3E6DA' }}>Kwabo · Cotonou, à 2 km de l&apos;aéroport</div>
      </div>
    ),
    size,
  );
}
