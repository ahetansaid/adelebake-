import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, BedDouble, Maximize, Users } from 'lucide-react';
import { fcfa } from '@/lib/format';
import { mediaUrl } from '@/lib/media-url';

export type RoomCardData = {
  slug: string; name: string; capacity: number; bedType: string; sizeM2: number | null; pricePerNight: number;
  coverId: string | null; cover?: { alt: string | null } | null;
};

export function RoomCard({ room }: { room: RoomCardData }) {
  const src = mediaUrl(room.coverId);
  return (
    <article className="room">
      <div className="room__img">
        {src && <Image src={src} alt={room.cover?.alt ?? room.name} fill sizes="(max-width: 960px) 100vw, 33vw" />}
      </div>
      <div className="room__body">
        <h3><Link href={`/chambres/${room.slug}`}>{room.name}</Link></h3>
        <p className="room__meta">
          <span><Users /> {room.capacity} pers.</span>
          <span><BedDouble /> {room.bedType}</span>
          {room.sizeM2 ? <span><Maximize /> {room.sizeM2} m²</span> : null}
        </p>
        <div className="room__foot">
          <span className="price">dès <b>{fcfa(room.pricePerNight).replace(' FCFA', '')}</b> FCFA / nuit</span>
          <span className="room__more">Voir <ArrowRight /></span>
        </div>
      </div>
    </article>
  );
}
