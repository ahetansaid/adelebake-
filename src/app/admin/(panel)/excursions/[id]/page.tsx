import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { deleteExperience, saveExperience } from '../../actions';
import { ActionForm, ConfirmButton, SaveButton } from '@/components/admin/ui';
import { requireAdmin } from '@/lib/auth';
import { db } from '@/lib/db';

export const metadata = { title: 'Excursion' };

/** Création (/admin/excursions/nouvelle) et modification. */
export default async function ExperiencePage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;
  const isNew = id === 'nouvelle';
  const e = isNew ? null : await db.experience.findUnique({ where: { id } });
  if (!isNew && !e) notFound();

  return (
    <>
      <p><Link href="/admin/excursions" className="row-link"><ArrowLeft size={14} /> Excursions</Link></p>
      <div className="adm-head"><h1>{e ? e.title : 'Nouvelle excursion'}</h1></div>
      <section className="adm-card" style={{ maxWidth: 900 }}>
        {e?.imageId && <img src={`/media/${e.imageId}`} alt="" style={{ width: 260, borderRadius: 8, marginBottom: 12 }} />}
        <ActionForm action={saveExperience.bind(null, e?.id ?? null)} multipart>
          <label className="f full"><span>Titre</span><input name="title" required maxLength={120} defaultValue={e?.title} /></label>
          <label className="f full"><span>Résumé (une phrase)</span><input name="summary" required maxLength={300} defaultValue={e?.summary} /></label>
          <label className="f full"><span>Description</span><textarea name="description" required rows={6} maxLength={8000} defaultValue={e?.description} /><small>Laissez une ligne vide entre deux paragraphes.</small></label>
          <label className="f"><span>Quand</span><input name="schedule" maxLength={120} defaultValue={e?.schedule ?? ''} placeholder="Chaque samedi, départ 8 h" /></label>
          <label className="f"><span>Prix par personne (FCFA, optionnel)</span><input name="price" type="number" min={0} step={500} defaultValue={e?.price ?? ''} /></label>
          <label className="f"><span>{e?.imageId ? 'Remplacer la photo' : 'Photo'}</span><input name="image" type="file" accept="image/jpeg,image/png,image/webp,image/avif" /></label>
          <label className="f"><span>Ordre d&apos;affichage</span><input name="sortOrder" type="number" min={0} max={999} defaultValue={e?.sortOrder ?? 0} /></label>
          <div className="full"><label className="f-check"><input type="checkbox" name="published" defaultChecked={e?.published ?? true} /> Visible sur le site</label></div>
          <div className="full f-actions"><SaveButton label={e ? 'Enregistrer' : "Créer l'excursion"} /></div>
        </ActionForm>
        {e && <div style={{ marginTop: 16 }}><ConfirmButton action={deleteExperience.bind(null, e.id)} question={`Supprimer « ${e.title} » ?`} /></div>}
      </section>
    </>
  );
}
