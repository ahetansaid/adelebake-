import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Badge } from '@/components/admin/Badge';
import { BOOKING_STATUS, QUOTE_STATUS } from '@/components/admin/labels';
import { requireAdmin } from '@/lib/auth';
import { db } from '@/lib/db';
import { formatDateTime, formatDay } from '@/lib/format';

export const metadata = { title: 'Tableau de bord' };

export default async function Dashboard() {
  const user = await requireAdmin();
  const today = new Date(new Date().toISOString().slice(0, 10) + 'T00:00:00.000Z');
  const in7 = new Date(today.getTime() + 7 * 86_400_000);

  const [newBookings, newQuotes, newMessages, arrivals, latestBookings, latestQuotes] = await Promise.all([
    db.bookingRequest.count({ where: { status: 'NEW' } }),
    db.conferenceRequest.count({ where: { status: 'NEW' } }),
    db.contactMessage.count({ where: { status: 'NEW' } }),
    db.bookingRequest.findMany({
      where: { status: 'CONFIRMED', checkIn: { gte: today, lte: in7 } }, orderBy: { checkIn: 'asc' }, take: 8,
      select: { id: true, name: true, checkIn: true, checkOut: true, airportShuttle: true, flightInfo: true, room: { select: { name: true } } },
    }),
    db.bookingRequest.findMany({ orderBy: { createdAt: 'desc' }, take: 6, select: { id: true, reference: true, name: true, checkIn: true, status: true, createdAt: true } }),
    db.conferenceRequest.findMany({ orderBy: { createdAt: 'desc' }, take: 4, select: { id: true, name: true, organization: true, eventDate: true, participants: true, status: true } }),
  ]);

  return (
    <>
      <div className="adm-head">
        <div>
          <h1>Bonjour {user.name.split(' ')[0]}</h1>
          <p>Voici ce qui attend l&apos;équipe aujourd&apos;hui.</p>
        </div>
      </div>

      <div className="adm-stats">
        <Link className={`adm-stat${newBookings ? ' is-hot' : ''}`} href="/admin/reservations?statut=NEW"><span>Réservations à traiter</span><b>{newBookings}</b></Link>
        <Link className={`adm-stat${newQuotes ? ' is-hot' : ''}`} href="/admin/devis?statut=NEW"><span>Devis à envoyer</span><b>{newQuotes}</b></Link>
        <Link className={`adm-stat${newMessages ? ' is-hot' : ''}`} href="/admin/messages?statut=NEW"><span>Messages non lus</span><b>{newMessages}</b></Link>
        <Link className="adm-stat" href="/admin/reservations?statut=CONFIRMED"><span>Arrivées sous 7 jours</span><b>{arrivals.length}</b></Link>
      </div>

      <div className="adm-grid2">
        <section className="adm-card">
          <h2>Dernières demandes de réservation</h2>
          {latestBookings.length ? (
            <div className="adm-scroll">
              <table className="adm-table">
                <thead><tr><th>Client</th><th>Arrivée</th><th>Statut</th><th>Reçue</th></tr></thead>
                <tbody>
                  {latestBookings.map((b) => (
                    <tr key={b.id}>
                      <td><Link className="row-link" href={`/admin/reservations/${b.id}`}>{b.name}</Link><br /><small>{b.reference}</small></td>
                      <td className="num">{formatDay(b.checkIn)}</td>
                      <td><Badge b={BOOKING_STATUS[b.status]} /></td>
                      <td className="num">{formatDateTime(b.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : <p className="adm-empty">Aucune demande pour l&apos;instant.</p>}
          <p style={{ margin: '14px 0 0' }}><Link href="/admin/reservations" className="row-link">Toutes les réservations <ArrowRight size={14} /></Link></p>
        </section>

        <div>
          <section className="adm-card">
            <h2>Arrivées confirmées (7 jours)</h2>
            {arrivals.length ? (
              <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'grid', gap: 10 }}>
                {arrivals.map((a) => (
                  <li key={a.id}>
                    <Link className="row-link" href={`/admin/reservations/${a.id}`}>{a.name}</Link> — {formatDay(a.checkIn)}
                    <br /><small>{a.room?.name ?? 'Chambre à attribuer'}{a.airportShuttle ? ` · navette${a.flightInfo ? ` (${a.flightInfo})` : ''}` : ''}</small>
                  </li>
                ))}
              </ul>
            ) : <p className="adm-empty" style={{ padding: 10 }}>Aucune arrivée confirmée cette semaine.</p>}
          </section>
          <section className="adm-card">
            <h2>Derniers devis salle</h2>
            {latestQuotes.length ? (
              <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'grid', gap: 10 }}>
                {latestQuotes.map((q) => (
                  <li key={q.id} style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
                    <span><Link className="row-link" href={`/admin/devis/${q.id}`}>{q.organization ?? q.name}</Link><br /><small>{formatDay(q.eventDate)} · {q.participants} pers.</small></span>
                    <Badge b={QUOTE_STATUS[q.status]} />
                  </li>
                ))}
              </ul>
            ) : <p className="adm-empty" style={{ padding: 10 }}>Aucune demande de devis.</p>}
          </section>
        </div>
      </div>
    </>
  );
}
