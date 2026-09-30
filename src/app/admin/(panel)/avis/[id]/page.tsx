import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { deleteTestimonial, saveTestimonial } from '../../actions';
import { ActionForm, ConfirmButton, SaveButton } from '@/components/admin/ui';
import { requireAdmin } from '@/lib/auth';
import { db } from '@/lib/db';

export const metadata = { title: 'Avis client' };

export default async function TestimonialPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;
  const isNew = id === 'nouveau';
  const t = isNew ? null : await db.testimonial.findUnique({ where: { id } });
  if (!isNew && !t) notFound();

  return (
    <>
      <p><Link href="/admin/avis" className="row-link"><ArrowLeft size={14} /> Avis clients</Link></p>
      <div className="adm-head"><h1>{t ? `Avis de ${t.author}` : 'Nouvel avis'}</h1></div>
      <section className="adm-card" style={{ maxWidth: 760 }}>
        <ActionForm action={saveTestimonial.bind(null, t?.id ?? null)}>
          <label className="f"><span>Auteur</span><input name="author" required maxLength={120} defaultValue={t?.author} placeholder="Prénom et initiale" /></label>
          <label className="f"><span>Contexte (optionnel)</span><input name="origin" maxLength={120} defaultValue={t?.origin ?? ''} placeholder="Séjour en famille · Lomé" /></label>
          <label className="f full"><span>Avis</span><textarea name="quote" required maxLength={800} defaultValue={t?.quote} /></label>
          <label className="f"><span>Note sur 5 (optionnel)</span><input name="rating" type="number" min={1} max={5} defaultValue={t?.rating ?? ''} /></label>
          <label className="f"><span>Ordre d&apos;affichage</span><input name="sortOrder" type="number" min={0} max={999} defaultValue={t?.sortOrder ?? 0} /></label>
          <div className="full" style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
            <label className="f-check"><input type="checkbox" name="published" defaultChecked={t?.published ?? true} /> Affiché sur le site</label>
            <label className="f-check"><input type="checkbox" name="isExample" defaultChecked={t?.isExample ?? false} /> Avis d&apos;exemple (fictif)</label>
          </div>
          <div className="full f-actions"><SaveButton label={t ? 'Enregistrer' : "Ajouter l'avis"} /></div>
        </ActionForm>
        {t && <div style={{ marginTop: 16 }}><ConfirmButton action={deleteTestimonial.bind(null, t.id)} question="Supprimer cet avis ?" /></div>}
      </section>
    </>
  );
}
