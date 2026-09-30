import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { BedDouble, Check, Maximize, MessageCircle, Users } from 'lucide-react';
import { PageHero } from '@/components/site/PageHero';
import { RoomCard } from '@/components/site/RoomCard';
import { IMG } from '@/content/images';
import { publishedRooms } from '@/lib/content';
import { db } from '@/lib/db';
import { fcfa } from '@/lib/format';
import { mediaUrl } from '@/lib/media-url';
import { absolute, businessRef, ldJson } from '@/lib/seo';
import { getSettings, whatsappLink } from '@/lib/settings';

export const revalidate = 300;

type Props = { params: Promise<{ slug: string }> };

async function getRoom(slug: string) {
  return db.room.findFirst({
    where: { slug, published: true },
    include: { cover: { select: { alt: true } }, images: { orderBy: { sortOrder: 'asc' }, select: { mediaId: true, media: { select: { alt: true } } } } },
  });
}

export async function generateStaticParams() {
  const rooms = await db.room.findMany({ where: { published: true }, select: { slug: true } });
  return rooms.map((r) => ({ slug: r.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const room = await getRoom((await params).slug);
  if (!room) return {};
  return {
    title: `${room.name} — dès ${fcfa(room.pricePerNight)} la nuit`,
    description: `${room.summary} ${room.capacity} pers., ${room.bedType.toLowerCase()}, climatisation, Wi-Fi, petit-déjeuner et navette aéroport à Cotonou.`.slice(0, 160),
    alternates: { canonical: `/chambres/${room.slug}` },
    openGraph: room.coverId ? { images: [{ url: `/media/${room.coverId}`, alt: room.cover?.alt ?? room.name }] } : undefined,
  };
}

export default async function RoomPage({ params }: Props) {
  const room = await getRoom((await params).slug);
  if (!room) notFound();
  const [s, all] = await Promise.all([getSettings(), publishedRooms()]);

  const photos = [
    ...(room.coverId ? [{ id: room.coverId, alt: room.cover?.alt ?? room.name }] : []),
    ...room.images.map((i) => ({ id: i.mediaId, alt: i.media.alt ?? room.name })),
  ].slice(0, 3);
  const others = all.filter((r) => r.id !== room.id).slice(0, 3);

  // Chambre + offre (prix indicatif) : permet à Google d'afficher le tarif
  const roomLd = {
    '@context': 'https://schema.org',
    '@type': 'HotelRoom',
    name: room.name,
    description: room.summary,
    url: absolute(`/chambres/${room.slug}`),
    image: photos.map((p) => absolute(`/media/${p.id}`)),
    bed: { '@type': 'BedDetails', typeOfBed: room.bedType },
    occupancy: { '@type': 'QuantitativeValue', maxValue: room.capacity },
    ...(room.sizeM2 ? { floorSize: { '@type': 'QuantitativeValue', value: room.sizeM2, unitCode: 'MTK' } } : {}),
    amenityFeature: room.amenities.map((a) => ({ '@type': 'LocationFeatureSpecification', name: a, value: true })),
    containedInPlace: businessRef(),
    offers: {
      '@type': 'Offer',
      price: room.pricePerNight,
      priceCurrency: 'XOF',
      availability: 'https://schema.org/InStock',
      url: absolute(`/reservation?chambre=${room.id}`),
      priceSpecification: { '@type': 'UnitPriceSpecification', price: room.pricePerNight, priceCurrency: 'XOF', unitText: 'nuit' },
    },
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={ldJson(roomLd)} />
      <PageHero
        title={room.name}
        lead={room.summary}
        image={mediaUrl(room.coverId) ?? IMG.chambreLodge}
        alt={room.cover?.alt ?? ''}
        crumbs={[{ href: '/chambres', label: 'Chambres' }, { label: room.name }]}
      />

      <section className="section">
        <div className="wrap split">
          <div>
            {photos.length > 0 && (
              <div className={`gallery${photos.length === 1 ? ' gallery--one' : ''}`} style={{ marginBottom: '2.4rem' }}>
                {photos.map((p) => (
                  <div key={p.id}><Image src={`/media/${p.id}`} alt={p.alt} fill sizes="(max-width: 960px) 100vw, 40vw" /></div>
                ))}
              </div>
            )}
            <h2>La chambre</h2>
            {room.description.split(/\n{2,}/).map((para, i) => <p key={i}>{para}</p>)}
            {room.amenities.length > 0 && (
              <>
                <h3 style={{ fontSize: '1.6rem', marginTop: '2rem' }}>Équipements</h3>
                <ul className="chips">{room.amenities.map((a) => <li key={a}><Check />{a}</li>)}</ul>
              </>
            )}
          </div>

          <aside className="panel sticky" aria-label="Réserver cette chambre">
            <p className="room-price"><b>{fcfa(room.pricePerNight)}</b><span>/ nuit</span></p>
            <p className="room__meta">
              <span><Users /> {room.capacity} personne{room.capacity > 1 ? 's' : ''}</span>
              <span><BedDouble /> {room.bedType}</span>
              {room.sizeM2 ? <span><Maximize /> {room.sizeM2} m²</span> : null}
            </p>
            <p className="note">Tarif indicatif, petit-déjeuner et navette aéroport compris. Nous confirmons le prix avec la disponibilité.</p>
            <Link className="btn btn--copper" style={{ width: '100%' }} href={`/reservation?chambre=${room.id}`}>Demander cette chambre</Link>
            <div className="or">ou</div>
            <a className="btn btn--line" style={{ width: '100%' }} target="_blank" rel="noopener noreferrer"
              href={whatsappLink(s.whatsapp, `Bonjour Adélé Baké, je suis intéressé(e) par la ${room.name}. Est-elle disponible ?`)}>
              <MessageCircle /> WhatsApp
            </a>
          </aside>
        </div>
      </section>

      {others.length > 0 && (
        <section className="section section--sand">
          <div className="wrap">
            <h2>Les autres chambres</h2>
            <div className="others">{others.map((r) => <RoomCard key={r.id} room={r} />)}</div>
          </div>
        </section>
      )}
    </>
  );
}
