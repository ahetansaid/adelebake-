import type { Metadata } from 'next';
import Link from 'next/link';
import { Check } from 'lucide-react';
import { PageHero } from '@/components/site/PageHero';
import { RoomCard } from '@/components/site/RoomCard';
import { IMG } from '@/content/images';
import { publishedRooms } from '@/lib/content';
import { getSettings } from '@/lib/settings';

export const revalidate = 300;
export const metadata: Metadata = {
  title: 'Chambres',
  description: "Chambres climatisées avec salle de bain privée, Wi-Fi et petit-déjeuner béninois, à 2 km de l'aéroport de Cotonou.",
};

export default async function RoomsPage() {
  const [rooms, s] = await Promise.all([publishedRooms(), getSettings()]);
  return (
    <>
      <PageHero
        title="Les chambres"
        lead="Peu de chambres, beaucoup d'attention : chacune est climatisée, avec salle de bain privée, Wi-Fi et TV écran plat."
        image={IMG.chambreLodge}
        crumbs={[{ label: 'Chambres' }]}
      />
      <section className="section">
        <div className="wrap">
          {rooms.length ? (
            <div className="rooms__grid">{rooms.map((r) => <RoomCard key={r.id} room={r} />)}</div>
          ) : (
            <p className="lead">Les chambres seront bientôt présentées ici. En attendant, <Link href="/contact">écrivez-nous</Link>.</p>
          )}
        </div>
      </section>
      <section className="section section--sand">
        <div className="wrap split">
          <div>
            <h2>Inclus dans chaque séjour</h2>
            <ul className="ticks">
              {[
                "Navette aéroport offerte à l'arrivée et au départ",
                'Wi-Fi gratuit dans toute la maison',
                'Parking sécurisé',
                'Ménage quotidien et linge de maison',
                'Accès à la cour, au salon et au billard',
              ].map((t) => <li key={t}><Check />{t}</li>)}
            </ul>
          </div>
          <div className="panel">
            <h3>Bon à savoir</h3>
            <p><b>Arrivée :</b> {s.checkIn}<br /><b>Départ :</b> {s.checkOut}<br /><b>Accueil :</b> {s.receptionHours}</p>
            <p className="note">Tarifs par nuit, indicatifs : nous confirmons le prix exact avec la disponibilité.</p>
            <Link href="/reservation" className="btn btn--copper">Demander une réservation</Link>
          </div>
        </div>
      </section>
    </>
  );
}
