import type { Metadata } from 'next';
import { getSettings } from '@/lib/settings';

export const metadata: Metadata = { title: 'Mentions légales', robots: { index: false } };

export default async function LegalPage() {
  const s = await getSettings();
  return (
    <>
    <div className="topband" />
    <section className="section">
      <div className="wrap prose">
        <h1>Mentions légales</h1>
        <h2>Éditeur du site</h2>
        <p>
          Adélé Baké — Guesthouse &amp; Conference Venue<br />
          {s.address}<br />
          Téléphone : {s.phone} — E-mail : {s.email}<br />
          RCCM : <em>à compléter</em> — IFU : <em>à compléter</em><br />
          Directeur de la publication : <em>à compléter</em>
        </p>
        <h2>Conception et hébergement</h2>
        <p>Site conçu et développé par Drwintech SaaS Solutions, Porto-Novo (Bénin). Hébergeur : <em>à compléter lors de la mise en ligne</em>.</p>
        <h2>Propriété intellectuelle</h2>
        <p>Les textes, le logo et les photographies de l&apos;établissement sont la propriété d&apos;Adélé Baké. Certaines photographies d&apos;illustration proviennent de Pexels (licence libre).</p>
        <h2>Responsabilité</h2>
        <p>Les tarifs et informations affichés sont indicatifs ; seule la confirmation écrite de l&apos;établissement fait foi pour une réservation.</p>
      </div>
    </section>
    </>
  );
}
