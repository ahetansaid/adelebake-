import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, Mail, MessageCircle } from 'lucide-react';
import type { BookingStatus } from '@prisma/client';
import { deleteRequest, updateBooking } from '../../actions';
import { Badge } from '@/components/admin/Badge';
import { BOOKING_STATUS } from '@/components/admin/labels';
import { ActionForm, ConfirmButton, SaveButton } from '@/components/admin/ui';
import { requireAdmin } from '@/lib/auth';
import { db } from '@/lib/db';
import { fcfa, formatDateTime, formatDay, nightsBetween } from '@/lib/format';
import { whatsappLink } from '@/lib/settings';

export const metadata = { title: 'Demande de réservation' };

export default async function BookingDetail({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;
  const b = await db.bookingRequest.findUnique({ where: { id }, include: { room: { select: { name: true, pricePerNight: true } } } });
  if (!b) notFound();
  const nights = nightsBetween(b.checkIn, b.checkOut);
  const estimate = b.room ? b.room.pricePerNight * nights : null;
  const wa = whatsappLink(b.phone, `Bonjour ${b.name}, c'est l'équipe Adélé Baké au sujet de votre demande ${b.reference} (du ${formatDay(b.checkIn)} au ${formatDay(b.checkOut)}).`);

  return (
    <>
      <p><Link href="/admin/reservations" className="row-link"><ArrowLeft size={14} /> Réservations</Link></p>
      <div className="adm-head">
        <div><h1>{b.name}</h1><p>{b.reference} · reçue le {formatDateTime(b.createdAt)}</p></div>
        <Badge b={BOOKING_STATUS[b.status]} />
      </div>

      <div className="adm-grid2">
        <section className="adm-card">
          <h2>Séjour demandé</h2>
          <dl className="dl">
            <dt>Dates</dt><dd>du {formatDay(b.checkIn)} au {formatDay(b.checkOut)} — {nights} nuit{nights > 1 ? 's' : ''}</dd>
            <dt>Chambre</dt><dd>{b.room?.name ?? 'Sans préférence'}</dd>
            <dt>Voyageurs</dt><dd>{b.adults} adulte(s), {b.children} enfant(s)</dd>
            <dt>Navette aéroport</dt><dd>{b.airportShuttle ? `Oui${b.flightInfo ? ` — ${b.flightInfo}` : ''}` : 'Non'}</dd>
            {estimate ? <><dt>Estimation</dt><dd>{fcfa(estimate)} <small>(tarif affiché × nuits)</small></dd></> : null}
            <dt>E-mail</dt><dd><a href={`mailto:${b.email}`}>{b.email}</a></dd>
            <dt>Téléphone</dt><dd><a href={`tel:${b.phone.replace(/\s/g, '')}`}>{b.phone}</a></dd>
          </dl>
          {b.message && <><h3 style={{ margin: '18px 0 8px', fontSize: '1.1rem' }}>Message du client</h3><p className="msg">{b.message}</p></>}
          <div className="quick-actions" style={{ marginTop: 18 }}>
            <a className="a-btn a-btn--copper" href={wa} target="_blank" rel="noopener noreferrer"><MessageCircle /> Répondre sur WhatsApp</a>
            <a className="a-btn a-btn--ghost" href={`mailto:${b.email}?subject=${encodeURIComponent(`Votre séjour chez Adélé Baké — ${b.reference}`)}`}><Mail /> Répondre par e-mail</a>
          </div>
        </section>

        <section className="adm-card">
          <h2>Suivi</h2>
          <ActionForm action={updateBooking.bind(null, b.id)}>
            <label className="f full"><span>Statut</span>
              <select name="status" defaultValue={b.status}>
                {(Object.keys(BOOKING_STATUS) as BookingStatus[]).map((s) => <option key={s} value={s}>{BOOKING_STATUS[s].label}</option>)}
              </select>
            </label>
            <label className="f full"><span>Notes internes</span>
              <textarea name="adminNotes" defaultValue={b.adminNotes ?? ''} placeholder="Chambre attribuée, acompte reçu, heure de navette…" />
              <small>Visibles uniquement par l&apos;équipe.</small>
            </label>
            <div className="full f-actions"><SaveButton /></div>
          </ActionForm>
          <hr style={{ border: 0, borderTop: '1px solid var(--line)', margin: '20px 0' }} />
          <ConfirmButton action={deleteRequest.bind(null, 'booking', b.id)} question="Supprimer définitivement cette demande ?" />
        </section>
      </div>
    </>
  );
}
