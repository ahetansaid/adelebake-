import Link from 'next/link';
import { Plus } from 'lucide-react';
import { OkNotice } from '@/components/admin/OkNotice';
import { requireAdmin } from '@/lib/auth';
import { db } from '@/lib/db';
import { fcfa } from '@/lib/format';

export const metadata = { title: 'Excursions' };

export default async function ExperiencesAdmin({ searchParams }: { searchParams: Promise<{ ok?: string }> }) {
  await requireAdmin();
  const { ok } = await searchParams;
  const rows = await db.experience.findMany({ orderBy: [{ sortOrder: 'asc' }, { title: 'asc' }] });
  return (
    <>
      <div className="adm-head">
        <div><h1>Excursions</h1><p>Sorties proposées sur la page « Découvrir » et en bas de l&apos;accueil.</p></div>
        <Link className="a-btn a-btn--copper" href="/admin/excursions/nouvelle"><Plus /> Nouvelle excursion</Link>
      </div>
      <OkNotice ok={ok} />
      <section className="adm-card">
        {rows.length ? (
          <table className="adm-table">
            <thead><tr><th></th><th>Excursion</th><th>Quand</th><th>Prix</th><th>Visibilité</th></tr></thead>
            <tbody>
              {rows.map((e) => (
                <tr key={e.id}>
                  <td>{e.imageId ? <img className="thumb" src={`/media/${e.imageId}`} alt="" /> : null}</td>
                  <td><Link className="row-link" href={`/admin/excursions/${e.id}`}>{e.title}</Link><br /><small>{e.summary}</small></td>
                  <td>{e.schedule ?? '—'}</td>
                  <td className="num">{e.price ? fcfa(e.price) : 'sur demande'}</td>
                  <td>{e.published ? <span className="badge badge--ok">En ligne</span> : <span className="badge badge--off">Masquée</span>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : <p className="adm-empty">Aucune excursion.</p>}
      </section>
    </>
  );
}
