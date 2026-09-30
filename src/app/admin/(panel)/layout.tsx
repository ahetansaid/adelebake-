import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { Shell } from '@/components/admin/Shell';
import { requireAdmin } from '@/lib/auth';
import { db } from '@/lib/db';
import '../admin.css';

export const metadata: Metadata = { title: { default: 'Espace de gestion', template: '%s — Gestion Adélé Baké' }, robots: { index: false, follow: false } };
export const dynamic = 'force-dynamic';

export default async function PanelLayout({ children }: { children: ReactNode }) {
  const user = await requireAdmin();
  const [bookings, quotes, messages] = await Promise.all([
    db.bookingRequest.count({ where: { status: 'NEW' } }),
    db.conferenceRequest.count({ where: { status: 'NEW' } }),
    db.contactMessage.count({ where: { status: 'NEW' } }),
  ]);
  return (
    <div className="adm">
      <Shell user={user} counts={{ bookings, quotes, messages }}>{children}</Shell>
    </div>
  );
}
