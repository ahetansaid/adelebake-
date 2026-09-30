import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Archive, ArrowLeft, CheckCheck, Mail } from 'lucide-react';
import { deleteRequest, setMessageStatus } from '../../actions';
import { Badge } from '@/components/admin/Badge';
import { MESSAGE_STATUS } from '@/components/admin/labels';
import { ActionButton, ConfirmButton } from '@/components/admin/ui';
import { requireAdmin } from '@/lib/auth';
import { db } from '@/lib/db';
import { formatDateTime } from '@/lib/format';

export const metadata = { title: 'Message' };

export default async function MessageDetail({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;
  let m = await db.contactMessage.findUnique({ where: { id } });
  if (!m) notFound();
  // ouvrir un message non lu le marque comme lu
  if (m.status === 'NEW') m = await db.contactMessage.update({ where: { id }, data: { status: 'READ' } });

  return (
    <>
      <p><Link href="/admin/messages" className="row-link"><ArrowLeft size={14} /> Messages</Link></p>
      <div className="adm-head">
        <div><h1>{m.subject}</h1><p>{m.name} · {formatDateTime(m.createdAt)}</p></div>
        <Badge b={MESSAGE_STATUS[m.status]} />
      </div>
      <section className="adm-card" style={{ maxWidth: 820 }}>
        <dl className="dl" style={{ marginBottom: 16 }}>
          <dt>E-mail</dt><dd><a href={`mailto:${m.email}`}>{m.email}</a></dd>
          {m.phone && <><dt>Téléphone</dt><dd><a href={`tel:${m.phone.replace(/\s/g, '')}`}>{m.phone}</a></dd></>}
        </dl>
        <p className="msg">{m.message}</p>
        <div className="quick-actions" style={{ marginTop: 18 }}>
          <a className="a-btn a-btn--copper" href={`mailto:${m.email}?subject=${encodeURIComponent(`Re : ${m.subject}`)}`}><Mail /> Répondre</a>
          <ActionButton action={setMessageStatus.bind(null, m.id, 'ANSWERED')}><CheckCheck /> Marquer comme répondu</ActionButton>
          <ActionButton action={setMessageStatus.bind(null, m.id, 'ARCHIVED')}><Archive /> Archiver</ActionButton>
          <ConfirmButton action={deleteRequest.bind(null, 'message', m.id)} question="Supprimer définitivement ce message ?" />
        </div>
      </section>
    </>
  );
}
