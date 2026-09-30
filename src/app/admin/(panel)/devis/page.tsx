import Link from 'next/link';
import type { QuoteStatus } from '@prisma/client';
import { Badge } from '@/components/admin/Badge';
import { FORMAT_LABEL, QUOTE_STATUS } from '@/components/admin/labels';
import { OkNotice } from '@/components/admin/OkNotice';
import { requireAdmin } from '@/lib/auth';
import { db } from '@/lib/db';
import { formatDateTime, formatDay } from '@/lib/format';

export const metadata = { title: 'Devis salle' };

export default async function QuotesPage({ searchParams }: { searchParams: Promise<{ statut?: string; ok?: string }> }) {
  await requireAdmin();
  const { statut, ok } = await searchParams;
  const status = statut && statut in QUOTE_STATUS ? (statut as QuoteStatus) : undefined;
  const rows = await db.conferenceRequest.findMany({ where: status ? { status } : {}, orderBy: { createdAt: 'desc' }, take: 200 });

  return (
    <>
      <div className="adm-head"><div><h1>Devis salle de conférence</h1><p>Demandes de devis pour réunions, formations et séminaires.</p></div></div>
      <OkNotice ok={ok} />
      <div className="adm-tabs">
        <Link href="?" aria-current={!status ? 'page' : undefined}>Toutes</Link>
        {(Object.keys(QUOTE_STATUS) as QuoteStatus[]).map((s) => (
          <Link key={s} href={`?statut=${s}`} aria-current={status === s ? 'page' : undefined}>{QUOTE_STATUS[s].label}</Link>
        ))}
      </div>
      <section className="adm-card">
        {rows.length ? (
          <div className="adm-scroll">
            <table className="adm-table">
              <thead><tr><th>Organisation / contact</th><th>Date</th><th>Formule</th><th>Participants</th><th>Statut</th><th>Reçue</th></tr></thead>
              <tbody>
                {rows.map((q) => (
                  <tr key={q.id}>
                    <td><Link className="row-link" href={`/admin/devis/${q.id}`}>{q.organization ?? q.name}</Link><br /><small>{q.reference}{q.organization ? ` · ${q.name}` : ''}</small></td>
                    <td className="num">{formatDay(q.eventDate)}</td>
                    <td>{FORMAT_LABEL[q.format]}</td>
                    <td className="num">{q.participants}</td>
                    <td><Badge b={QUOTE_STATUS[q.status]} /></td>
                    <td className="num">{formatDateTime(q.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : <p className="adm-empty">Aucune demande de devis{status ? ' avec ce statut' : ''}.</p>}
      </section>
    </>
  );
}
