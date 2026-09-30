import type { Metadata } from 'next';
import { Clock, MessageCircle, Phone, PlaneLanding } from 'lucide-react';
import { BookingForm } from '@/components/site/BookingForm';
import { PageHero } from '@/components/site/PageHero';
import { IMG } from '@/content/images';
import { publishedRooms, todayIso } from '@/lib/content';
import { getSettings, whatsappLink } from '@/lib/settings';

export const metadata: Metadata = {
  title: 'Réserver',
  description: 'Demandez vos dates : nous confirmons la disponibilité et le tarif, et venons vous chercher à l’aéroport de Cotonou.',
};

type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> };

const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);
const isoDate = (v?: string) => (v && /^\d{4}-\d{2}-\d{2}$/.test(v) ? v : undefined);
const small = (v?: string) => (v && /^\d{1,2}$/.test(v) ? v : undefined);

export default async function ReservationPage({ searchParams }: Props) {
  const q = await searchParams;
  const [rooms, s] = await Promise.all([publishedRooms(), getSettings()]);
  const roomParam = one(q.chambre);

  const initial = {
    roomId: rooms.some((r) => r.id === roomParam) ? roomParam : undefined,
    checkIn: isoDate(one(q.arrivee)),
    checkOut: isoDate(one(q.depart)),
    adults: small(one(q.adultes)),
    children: small(one(q.enfants)),
  };
  const wa = whatsappLink(s.whatsapp, 'Bonjour Adélé Baké, je souhaite réserver un séjour.');

  return (
    <>
      <PageHero
        title="Demander une réservation"
        lead="Indiquez vos dates : nous vérifions la disponibilité et revenons vers vous rapidement, sans engagement."
        image={IMG.courNuit}
        crumbs={[{ label: 'Réserver' }]}
      />
      <section className="section">
        <div className="wrap split">
          <div className="panel">
            <BookingForm
              rooms={rooms.map((r) => ({ id: r.id, name: r.name, pricePerNight: r.pricePerNight }))}
              initial={initial}
              today={todayIso()}
              whatsappHref={wa}
            />
          </div>
          <aside className="panel panel--indigo sticky">
            <h2 style={{ fontSize: '1.9rem' }}>Plus rapide&nbsp;?</h2>
            <p>Écrivez-nous directement, nous répondons en général dans l&apos;heure pendant l&apos;accueil.</p>
            <ul className="contact-list" style={{ margin: '1.4rem 0' }}>
              <li><span className="ico"><MessageCircle /></span><span><b>WhatsApp</b><a href={wa} target="_blank" rel="noopener noreferrer">{s.phone}</a></span></li>
              <li><span className="ico"><Phone /></span><span><b>Téléphone</b><a href={`tel:+${s.whatsapp.replace(/\D/g, '')}`}>{s.phone}</a></span></li>
              <li><span className="ico"><Clock /></span><span><b>Accueil</b>{s.receptionHours}</span></li>
              <li><span className="ico"><PlaneLanding /></span><span><b>Navette</b>Offerte depuis l&apos;aéroport de Cotonou</span></li>
            </ul>
            <p className="note note--light">Arrivée {s.checkIn.toLowerCase()} · départ {s.checkOut.toLowerCase()}.</p>
          </aside>
        </div>
      </section>
    </>
  );
}
