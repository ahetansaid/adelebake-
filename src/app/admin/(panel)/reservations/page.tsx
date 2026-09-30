import Link from 'next/link';
import type { BookingStatus, Prisma } from '@prisma/client';
import { Badge } from '@/components/admin/Badge';
import { BOOKING_STATUS } from '@/components/admin/labels';
import { OkNotice } from '@/components/admin/OkNotice';
import { requireAdmin } from '@/lib/auth';
import { db } from '@/lib/db';
import { formatDateTime, formatDay, nightsBetween } from '@/lib/format';

export const metadata = { title: 'Réservations' };

type Props = { searchParams: Promise<{ statut?: string; q?: string; ok?: string }> };

export default async function BookingsPage({ searchParams }: Props) {
  await requireAdmin();
  const { statut, q, ok } = await searchParams;
  const status = statut && statut in BOOKING_STATUS ? (statut as BookingStatus) : undefined;
  const search = q?.trim().slice(0, 100);

  const where: Prisma.BookingRequestWhereInput = {
    ...(status ? { status } : {}),
    ...(search ? { OR: [{ name: { contains: search, mode: 'insensitive' } }, { email: { contains: search, mode: 'insensitive' } }, { reference: { contains: search.toUpperCase() } }, { phone: { contains: search } }] } : {}),
  };
  const rows = await db.bookingRequest.findMany({ where, orderBy: { createdAt: 'desc' }, take: 200, include: { room: { select: { name: true } } } });

  const tab = (s: string | undefined, label: string) => (
    <Link href={s ? `?statut=${s}` : '?'} aria-current={status === s || (!status && !s) ? 'page' : undefined}>{label}</Link>
  );

  return (
    <>
      <div className="adm-head"><div><h1>Réservations</h1><p>Demandes envoyées depuis le site. Confirmez la disponibilité au client, puis mettez à jour le statut.</p></div></div>
      <OkNotice ok={ok} />
      <div className="adm-tabs">
        {tab(undefined, 'Toutes')}
        {(Object.keys(BOOKING_STATUS) as BookingStatus[]).map((s) => <span key={s}>{tab(s, BOOKING_STATUS[s].label)}</span>)}
      </div>
      <form className="f" style={{ maxWidth: 360, marginBottom: 14 }}>
        {status && <input type="hidden" name="statut" value={status} />}
        <input name="q" defaultValue={search} placeholder="Rechercher : nom, e-mail, téléphone, référence" aria-label="Rechercher" />
      </form>
      <section className="adm-card">
        {rows.length ? (
          <div className="adm-scroll">
            <table className="adm-table">
              <thead><tr><th>Client</th><th>Séjour</th><th>Chambre</th><th>Voyageurs</th><th>Statut</th><th>Reçue</th></tr></thead>
              <tbody>
                {rows.map((b) => (
                  <tr key={b.id}>
                    <td><Link className="row-link" href={`/admin/reservations/${b.id}`}>{b.name}</Link><br /><small>{b.reference} · {b.phone}</small></td>
                    <td className="num">{formatDay(b.checkIn)}<br /><small>{nightsBetween(b.checkIn, b.checkOut)} nuit(s)</small></td>
                    <td>{b.room?.name ?? <small>Sans préférence</small>}</td>
                    <td className="num">{b.adults} ad.{b.children ? ` + ${b.children} enf.` : ''}</td>
                    <td><Badge b={BOOKING_STATUS[b.status]} /></td>
                    <td className="num">{formatDateTime(b.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : <p className="adm-empty">Aucune demande{status || search ? ' ne correspond à ce filtre' : ''}.</p>}
      </section>
    </>
  );
}
