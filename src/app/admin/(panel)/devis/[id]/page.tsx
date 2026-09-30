import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, Mail, MessageCircle } from 'lucide-react';
import type { QuoteStatus } from '@prisma/client';
import { deleteRequest, updateQuote } from '../../actions';
import { Badge } from '@/components/admin/Badge';
import { FORMAT_LABEL, QUOTE_STATUS } from '@/components/admin/labels';
import { ActionForm, ConfirmButton, SaveButton } from '@/components/admin/ui';
import { requireAdmin } from '@/lib/auth';
import { db } from '@/lib/db';
import { formatDateTime, formatDay } from '@/lib/format';
import { whatsappLink } from '@/lib/settings';

export const metadata = { title: 'Demande de devis' };

export default async function QuoteDetail({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;
  const q = await db.conferenceRequest.findUnique({ where: { id } });
  if (!q) notFound();

  return (
    <>
      <p><Link href="/admin/devis" className="row-link"><ArrowLeft size={14} /> Devis salle</Link></p>
      <div className="adm-head">
        <div><h1>{q.organization ?? q.name}</h1><p>{q.reference} · reçue le {formatDateTime(q.createdAt)}</p></div>
        <Badge b={QUOTE_STATUS[q.status]} />
      </div>
      <div className="adm-grid2">
        <section className="adm-card">
          <h2>Événement</h2>
          <dl className="dl">
            <dt>Date</dt><dd>{formatDay(q.eventDate)} — {FORMAT_LABEL[q.format]}</dd>
            <dt>Participants</dt><dd>{q.participants}</dd>
            <dt>Besoins</dt><dd>{q.needs.length ? q.needs.join(', ') : '—'}</dd>
            <dt>Hébergement</dt><dd>{q.lodging ? 'Oui, des participants logeront sur place' : 'Non'}</dd>
            <dt>Contact</dt><dd>{q.name}{q.organization ? ` (${q.organization})` : ''}</dd>
            <dt>E-mail</dt><dd><a href={`mailto:${q.email}`}>{q.email}</a></dd>
            <dt>Téléphone</dt><dd><a href={`tel:${q.phone.replace(/\s/g, '')}`}>{q.phone}</a></dd>
          </dl>
          {q.message && <><h3 style={{ margin: '18px 0 8px', fontSize: '1.1rem' }}>Précisions</h3><p className="msg">{q.message}</p></>}
          <div className="quick-actions" style={{ marginTop: 18 }}>
            <a className="a-btn a-btn--copper" target="_blank" rel="noopener noreferrer" href={whatsappLink(q.phone, `Bonjour ${q.name}, c'est l'équipe Adélé Baké au sujet de votre demande de devis ${q.reference}.`)}><MessageCircle /> WhatsApp</a>
            <a className="a-btn a-btn--ghost" href={`mailto:${q.email}?subject=${encodeURIComponent(`Votre devis salle de conférence — ${q.reference}`)}`}><Mail /> E-mail</a>
          </div>
        </section>
        <section className="adm-card">
          <h2>Suivi</h2>
          <ActionForm action={updateQuote.bind(null, q.id)}>
            <label className="f full"><span>Statut</span>
              <select name="status" defaultValue={q.status}>
                {(Object.keys(QUOTE_STATUS) as QuoteStatus[]).map((s) => <option key={s} value={s}>{QUOTE_STATUS[s].label}</option>)}
              </select>
            </label>
            <label className="f full"><span>Notes internes</span><textarea name="adminNotes" defaultValue={q.adminNotes ?? ''} placeholder="Montant du devis, relances…" /></label>
            <div className="full f-actions"><SaveButton /></div>
          </ActionForm>
          <hr style={{ border: 0, borderTop: '1px solid var(--line)', margin: '20px 0' }} />
          <ConfirmButton action={deleteRequest.bind(null, 'quote', q.id)} question="Supprimer définitivement cette demande de devis ?" />
        </section>
      </div>
    </>
  );
}
