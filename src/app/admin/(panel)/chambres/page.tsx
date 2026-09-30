import Link from 'next/link';
import { Plus } from 'lucide-react';
import { OkNotice } from '@/components/admin/OkNotice';
import { requireAdmin } from '@/lib/auth';
import { db } from '@/lib/db';
import { fcfa } from '@/lib/format';

export const metadata = { title: 'Chambres' };

export default async function RoomsAdmin({ searchParams }: { searchParams: Promise<{ ok?: string }> }) {
  await requireAdmin();
  const { ok } = await searchParams;
  const rooms = await db.room.findMany({ orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }], include: { _count: { select: { images: true, bookings: true } } } });

  return (
    <>
      <div className="adm-head">
        <div><h1>Chambres</h1><p>Ce qui est affiché sur les pages Chambres et Réserver.</p></div>
        <Link className="a-btn a-btn--copper" href="/admin/chambres/nouvelle"><Plus /> Nouvelle chambre</Link>
      </div>
      <OkNotice ok={ok} />
      <section className="adm-card">
        {rooms.length ? (
          <div className="adm-scroll">
            <table className="adm-table">
              <thead><tr><th></th><th>Chambre</th><th>Prix / nuit</th><th>Capacité</th><th>Photos</th><th>Demandes</th><th>Visibilité</th></tr></thead>
              <tbody>
                {rooms.map((r) => (
                  <tr key={r.id}>
                    <td>{r.coverId ? <img className="thumb" src={`/media/${r.coverId}`} alt="" /> : <span className="thumb" style={{ display: 'inline-block' }} />}</td>
                    <td><Link className="row-link" href={`/admin/chambres/${r.id}`}>{r.name}</Link><br /><small>/chambres/{r.slug}</small></td>
                    <td className="num">{fcfa(r.pricePerNight)}</td>
                    <td className="num">{r.capacity} pers.</td>
                    <td className="num">{(r.coverId ? 1 : 0) + r._count.images}</td>
                    <td className="num">{r._count.bookings}</td>
                    <td>{r.published ? <span className="badge badge--ok">En ligne</span> : <span className="badge badge--off">Masquée</span>}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : <p className="adm-empty">Aucune chambre. <Link href="/admin/chambres/nouvelle">Créer la première</Link>.</p>}
      </section>
    </>
  );
}
