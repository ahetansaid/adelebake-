import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import type { MenuSection } from '@prisma/client';
import { deleteMenuItem, saveMenuItem } from '../../actions';
import { SECTION_LABEL } from '@/components/admin/labels';
import { ActionForm, ConfirmButton, SaveButton } from '@/components/admin/ui';
import { requireAdmin } from '@/lib/auth';
import { db } from '@/lib/db';

export const metadata = { title: 'Plat / boisson' };

/** Sert à la fois à la création (/admin/carte/nouveau) et à la modification. */
export default async function MenuItemPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;
  const isNew = id === 'nouveau';
  const item = isNew ? null : await db.menuItem.findUnique({ where: { id } });
  if (!isNew && !item) notFound();

  return (
    <>
      <p><Link href="/admin/carte" className="row-link"><ArrowLeft size={14} /> Carte</Link></p>
      <div className="adm-head"><h1>{item ? item.name : 'Nouveau plat ou boisson'}</h1></div>
      <section className="adm-card" style={{ maxWidth: 760 }}>
        <ActionForm action={saveMenuItem.bind(null, item?.id ?? null)}>
          <label className="f"><span>Rubrique</span>
            <select name="section" defaultValue={item?.section ?? 'BENINOIS'}>
              {(Object.keys(SECTION_LABEL) as MenuSection[]).map((s) => <option key={s} value={s}>{SECTION_LABEL[s]}</option>)}
            </select>
          </label>
          <label className="f"><span>Nom</span><input name="name" required maxLength={120} defaultValue={item?.name} /></label>
          <label className="f full"><span>Description (optionnel)</span><input name="description" maxLength={400} defaultValue={item?.description ?? ''} /></label>
          <label className="f"><span>Prix (FCFA, vide = « sur demande »)</span><input name="price" type="number" min={0} step={100} defaultValue={item?.price ?? ''} /></label>
          <label className="f"><span>Ordre d&apos;affichage</span><input name="sortOrder" type="number" min={0} max={999} defaultValue={item?.sortOrder ?? 0} /></label>
          <div className="full" style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
            <label className="f-check"><input type="checkbox" name="featured" defaultChecked={item?.featured ?? false} /> Spécialité de la maison</label>
            <label className="f-check"><input type="checkbox" name="published" defaultChecked={item?.published ?? true} /> Affiché sur le site</label>
          </div>
          <div className="full f-actions">
            <SaveButton label={item ? 'Enregistrer' : 'Ajouter à la carte'} />
          </div>
        </ActionForm>
        {item && <div style={{ marginTop: 16 }}><ConfirmButton action={deleteMenuItem.bind(null, item.id)} question={`Retirer « ${item.name} » de la carte ?`} /></div>}
      </section>
    </>
  );
}
