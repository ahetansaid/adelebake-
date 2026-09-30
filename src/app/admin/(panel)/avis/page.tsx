import Link from 'next/link';
import { Plus } from 'lucide-react';
import { OkNotice } from '@/components/admin/OkNotice';
import { requireAdmin } from '@/lib/auth';
import { db } from '@/lib/db';

export const metadata = { title: 'Avis clients' };

export default async function TestimonialsAdmin({ searchParams }: { searchParams: Promise<{ ok?: string }> }) {
  await requireAdmin();
  const { ok } = await searchParams;
  const rows = await db.testimonial.findMany({ orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }] });
  const examples = rows.filter((r) => r.isExample && r.published).length;
  return (
    <>
      <div className="adm-head">
        <div><h1>Avis clients</h1><p>Témoignages affichés sur l&apos;accueil. Publiez uniquement de vrais avis, avec l&apos;accord des clients.</p></div>
        <Link className="a-btn a-btn--copper" href="/admin/avis/nouveau"><Plus /> Ajouter un avis</Link>
      </div>
      <OkNotice ok={ok} />
      {examples > 0 && <p className="flash flash--err">{examples} avis d&apos;exemple sont encore affichés sur le site : remplacez-les par de vrais avis avant la mise en ligne.</p>}
      <section className="adm-card">
        {rows.length ? (
          <table className="adm-table">
            <thead><tr><th>Auteur</th><th>Avis</th><th>Statut</th></tr></thead>
            <tbody>
              {rows.map((t) => (
                <tr key={t.id}>
                  <td><Link className="row-link" href={`/admin/avis/${t.id}`}>{t.author}</Link><br /><small>{t.origin}</small></td>
                  <td>« {t.quote.length > 110 ? `${t.quote.slice(0, 110)}…` : t.quote} »</td>
                  <td style={{ whiteSpace: 'nowrap' }}>
                    {t.published ? <span className="badge badge--ok">Affiché</span> : <span className="badge badge--off">Masqué</span>}{' '}
                    {t.isExample && <span className="badge badge--warn">Exemple</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : <p className="adm-empty">Aucun avis.</p>}
      </section>
    </>
  );
}
