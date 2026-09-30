import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, ExternalLink, Star } from 'lucide-react';
import { deleteRoom, makeCover, removeRoomImage, saveRoom } from '../../actions';
import { OkNotice } from '@/components/admin/OkNotice';
import { RoomForm } from '@/components/admin/RoomForm';
import { ActionButton, ConfirmButton } from '@/components/admin/ui';
import { requireAdmin } from '@/lib/auth';
import { db } from '@/lib/db';

export const metadata = { title: 'Modifier une chambre' };

export default async function EditRoom({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ ok?: string }> }) {
  await requireAdmin();
  const [{ id }, { ok }] = await Promise.all([params, searchParams]);
  const room = await db.room.findUnique({ where: { id }, include: { images: { orderBy: { sortOrder: 'asc' } } } });
  if (!room) notFound();

  return (
    <>
      <p><Link href="/admin/chambres" className="row-link"><ArrowLeft size={14} /> Chambres</Link></p>
      <div className="adm-head">
        <div><h1>{room.name}</h1><p>{room.published ? 'Visible sur le site' : 'Masquée du site'}</p></div>
        {room.published && <a className="a-btn a-btn--ghost" href={`/chambres/${room.slug}`} target="_blank" rel="noopener noreferrer"><ExternalLink /> Voir la page</a>}
      </div>
      <OkNotice ok={ok} />

      <section className="adm-card">
        <h2>Photos</h2>
        <div className="photos">
          {room.coverId && (
            <figure className="photo" style={{ margin: 0 }}>
              <span className="tag">Principale</span>
              <img src={`/media/${room.coverId}`} alt="Photo principale" />
              <figcaption>Photo principale</figcaption>
            </figure>
          )}
          {room.images.map((img) => (
            <figure key={img.id} className="photo" style={{ margin: 0 }}>
              <img src={`/media/${img.mediaId}`} alt="" />
              <figcaption>
                <ActionButton className="a-btn a-btn--ghost" action={makeCover.bind(null, room.id, img.id)}><Star /> Principale</ActionButton>
                <ConfirmButton action={removeRoomImage.bind(null, room.id, img.id)} label="" question="Retirer cette photo ?" className="" />
              </figcaption>
            </figure>
          ))}
        </div>
        {!room.coverId && !room.images.length && <p className="adm-empty">Aucune photo : ajoutez-en via le formulaire ci-dessous.</p>}
      </section>

      <section className="adm-card">
        <h2>Informations</h2>
        <RoomForm room={room} action={saveRoom.bind(null, room.id)} />
      </section>

      <section className="adm-card">
        <h2>Zone sensible</h2>
        <p>Supprimer la chambre retire aussi ses photos. Les demandes de réservation existantes sont conservées (sans chambre associée). Pour la retirer temporairement, décochez plutôt « Visible sur le site ».</p>
        <ConfirmButton action={deleteRoom.bind(null, room.id)} label="Supprimer la chambre" question={`Supprimer définitivement « ${room.name} » et ses photos ?`} />
      </section>
    </>
  );
}
