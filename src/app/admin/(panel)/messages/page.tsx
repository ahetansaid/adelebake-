import Link from 'next/link';
import type { MessageStatus } from '@prisma/client';
import { Badge } from '@/components/admin/Badge';
import { MESSAGE_STATUS } from '@/components/admin/labels';
import { OkNotice } from '@/components/admin/OkNotice';
import { requireAdmin } from '@/lib/auth';
import { db } from '@/lib/db';
import { formatDateTime } from '@/lib/format';

export const metadata = { title: 'Messages' };

export default async function MessagesPage({ searchParams }: { searchParams: Promise<{ statut?: string; ok?: string }> }) {
  await requireAdmin();
  const { statut, ok } = await searchParams;
  const status = statut && statut in MESSAGE_STATUS ? (statut as MessageStatus) : undefined;
  const rows = await db.contactMessage.findMany({
    where: status ? { status } : { status: { not: 'ARCHIVED' } }, orderBy: { createdAt: 'desc' }, take: 200,
  });

  return (
    <>
      <div className="adm-head"><div><h1>Messages</h1><p>Messages envoyés depuis la page Contact.</p></div></div>
      <OkNotice ok={ok} />
      <div className="adm-tabs">
        <Link href="?" aria-current={!status ? 'page' : undefined}>En cours</Link>
        {(Object.keys(MESSAGE_STATUS) as MessageStatus[]).map((s) => (
          <Link key={s} href={`?statut=${s}`} aria-current={status === s ? 'page' : undefined}>{MESSAGE_STATUS[s].label}</Link>
        ))}
      </div>
      <section className="adm-card">
        {rows.length ? (
          <div className="adm-scroll">
            <table className="adm-table">
              <thead><tr><th>De</th><th>Objet</th><th>Statut</th><th>Reçu</th></tr></thead>
              <tbody>
                {rows.map((m) => (
                  <tr key={m.id} style={m.status === 'NEW' ? { fontWeight: 600 } : undefined}>
                    <td>{m.name}<br /><small>{m.email}</small></td>
                    <td><Link className="row-link" prefetch={false} href={`/admin/messages/${m.id}`}>{m.subject}</Link></td>
                    <td><Badge b={MESSAGE_STATUS[m.status]} /></td>
                    <td className="num">{formatDateTime(m.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : <p className="adm-empty">Aucun message.</p>}
      </section>
    </>
  );
}
