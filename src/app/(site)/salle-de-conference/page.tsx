import type { Metadata } from 'next';
import Image from 'next/image';
import { BedDouble, Check, Coffee, PlaneLanding, Projector, Snowflake, Users, Wifi } from 'lucide-react';
import { ConferenceForm } from '@/components/site/ConferenceForm';
import { PageHero } from '@/components/site/PageHero';
import { IMG } from '@/content/images';
import { todayIso } from '@/lib/content';
import { getSettings } from '@/lib/settings';

export const metadata: Metadata = {
  title: 'Salle de conférence',
  description: 'Salle de réunion climatisée et équipée à Cotonou, près de l’aéroport : séminaires, formations, ateliers. Pauses, repas et hébergement sur place.',
};

export default async function ConferencePage() {
  const s = await getSettings();
  return (
    <>
      <PageHero
        title="Salle de conférence"
        lead="Réunions, formations, séminaires : un cadre calme et équipé, avec restauration et hébergement sur place."
        image={IMG.reunion}
        crumbs={[{ label: 'Salle de conférence' }]}
      />

      <section className="section">
        <div className="wrap split" style={{ alignItems: 'center' }}>
          <div>
            <h2>Travailler au calme, loin du tumulte</h2>
            <p className="lead">
              À deux kilomètres de l&apos;aéroport, notre salle accueille vos équipes dans une maison paisible. Vos participants venus d&apos;ailleurs logent sur place, sont récupérés à l&apos;aéroport et déjeunent sans quitter les lieux.
            </p>
            <dl className="specs specs--dark">
              <div><dt><Users />Capacité</dt><dd>jusqu&apos;à {s.conferenceCapacity} personnes</dd></div>
              <div><dt><Projector />Équipement</dt><dd>Vidéoprojecteur, écran, sono</dd></div>
              <div><dt><Wifi />Connexion</dt><dd>Wi-Fi haut débit</dd></div>
              <div><dt><Snowflake />Confort</dt><dd>Salle climatisée</dd></div>
            </dl>
          </div>
          <div className="conf__pics">
            <div><Image src={IMG.reunion2} alt="Réunion autour d'une table" fill sizes="(max-width: 960px) 50vw, 22vw" /></div>
            <div><Image src={IMG.reunion3} alt="Séance de travail en équipe" fill sizes="(max-width: 960px) 50vw, 22vw" /></div>
          </div>
        </div>
      </section>

      <section className="section section--sand">
        <div className="wrap">
          <h2>Formules</h2>
          <div className="rooms__grid">
            {[
              { t: 'Demi-journée', d: 'Matin ou après-midi, une pause-café incluse.', items: ['Salle équipée 4 h', '1 pause-café', 'Eau minérale'] },
              { t: 'Journée complète', d: 'La formule la plus demandée pour les séminaires.', items: ['Salle équipée 8 h', '2 pauses-café', 'Déjeuner béninois'] },
              { t: 'Séminaire résidentiel', d: 'Plusieurs jours, hébergement compris.', items: ['Salle et chambres', 'Pension complète', 'Navette aéroport'] },
            ].map((f) => (
              <article key={f.t} className="panel">
                <h3 style={{ fontSize: '1.6rem' }}>{f.t}</h3>
                <p>{f.d}</p>
                <ul className="ticks">{f.items.map((i) => <li key={i}><Check />{i}</li>)}</ul>
              </article>
            ))}
          </div>
          <p className="note" style={{ marginTop: '1rem' }}>Tarifs sur devis, selon le nombre de participants et les prestations.</p>
        </div>
      </section>

      <section className="section" id="devis">
        <div className="wrap split">
          <div className="panel">
            <h2 style={{ fontSize: '2rem' }}>Demander un devis</h2>
            <ConferenceForm today={todayIso()} />
          </div>
          <aside className="panel panel--indigo sticky">
            <h3 style={{ fontSize: '1.7rem' }}>Tout sur place</h3>
            <ul className="contact-list">
              <li><span className="ico"><Coffee /></span><span><b>Restauration</b>Pauses-café, déjeuners et dîners béninois</span></li>
              <li><span className="ico"><BedDouble /></span><span><b>Hébergement</b>Chambres pour vos participants</span></li>
              <li><span className="ico"><PlaneLanding /></span><span><b>Transferts</b>Navette depuis l&apos;aéroport</span></li>
            </ul>
          </aside>
        </div>
      </section>
    </>
  );
}
