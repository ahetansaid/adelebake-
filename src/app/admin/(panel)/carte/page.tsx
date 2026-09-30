import Link from 'next/link';
import { Plus, Star } from 'lucide-react';
import type { MenuSection } from '@prisma/client';
import { SECTION_LABEL } from '@/components/admin/labels';
import { OkNotice } from '@/components/admin/OkNotice';
import { requireAdmin } from '@/lib/auth';
import { db } from '@/lib/db';
import { fcfa } from '@/lib/format';

export const metadata = { title: 'Carte du restaurant' };

export default async function MenuAdmin({ searchParams }: { searchParams: Promise<{ ok?: string }> }) {
  await requireAdmin();
  const { ok } = await searchParams;
  const items = await db.menuItem.findMany({ orderBy: [{ section: 'asc' }, { sortOrder: 'asc' }, { name: 'asc' }] });
  const sections = Object.keys(SECTION_LABEL) as MenuSection[];

  return (
    <>
      <div className="adm-head">
        <div><h1>Carte du restaurant</h1><p>Plats et boissons de la page « La table ». Les spécialités sont mises en avant.</p></div>
        <Link className="a-btn a-btn--copper" href="/admin/carte/nouveau"><Plus /> Ajouter</Link>
      </div>
      <OkNotice ok={ok} />
      {sections.map((s) => {
        const list = items.filter((i) => i.section === s);
        return (
          <section key={s} className="adm-card">
            <h2>{SECTION_LABEL[s]} <small style={{ fontFamily: 'var(--font-sans)', fontSize: '.85rem', color: 'var(--mute)' }}>({list.length})</small></h2>
            {list.length ? (
              <table className="adm-table">
                <tbody>
                  {list.map((i) => (
                    <tr key={i.id}>
                      <td><Link className="row-link" href={`/admin/carte/${i.id}`}>{i.name}</Link> {i.featured && <Star size={14} color="#B8733F" aria-label="Spécialité" />}<br /><small>{i.description}</small></td>
                      <td className="num" style={{ width: 130 }}>{i.price ? fcfa(i.price) : 'sur demande'}</td>
                      <td style={{ width: 100 }}>{i.published ? <span className="badge badge--ok">Affiché</span> : <span className="badge badge--off">Masqué</span>}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : <p className="adm-empty" style={{ padding: 10 }}>Rien dans cette rubrique.</p>}
          </section>
        );
      })}
    </>
  );
}
