import Image from 'next/image';
import Link from 'next/link';
import {
  ArrowRight, Bike, CalendarCheck, Car, CircleDot, Coffee, Flame, Plus, PlaneLanding, Presentation,
  Projector, Shirt, Snowflake, Users, Utensils, Wifi,
} from 'lucide-react';
import { BookingBar } from '@/components/site/BookingBar';
import { HeroSlider } from '@/components/site/HeroSlider';
import { RoomCard } from '@/components/site/RoomCard';
import { Testimonials } from '@/components/site/Testimonials';
import { faqItems } from '@/content/faq';
import { HERO_SLIDES, IMG } from '@/content/images';
import { menuBySection, publishedExperiences, publishedRooms, publishedTestimonials, todayIso } from '@/lib/content';
import { mediaUrl } from '@/lib/media-url';
import { absolute, businessRef, geo, ldJson, postalAddress, SITE_FULL_NAME } from '@/lib/seo';
import { getSettings } from '@/lib/settings';

export const revalidate = 300;
export const metadata = { alternates: { canonical: '/' } };

const AMENITIES = [
  { icon: PlaneLanding, label: 'Navette aéroport offerte' },
  { icon: Wifi, label: 'Wi-Fi gratuit' },
  { icon: Car, label: 'Parking sécurisé' },
  { icon: Utensils, label: 'Restaurant & bar' },
  { icon: Flame, label: 'Barbecue dans la cour' },
  { icon: Presentation, label: 'Salle de conférence' },
  { icon: CircleDot, label: 'Billard & ping-pong' },
  { icon: Bike, label: 'Location vélo & voiture' },
  { icon: Shirt, label: 'Blanchisserie' },
  { icon: Snowflake, label: 'Chambres climatisées' },
];

export default async function HomePage() {
  const [s, rooms, testimonials, menu, experiences] = await Promise.all([
    getSettings(), publishedRooms(3), publishedTestimonials(), menuBySection(), publishedExperiences(3),
  ]);

  const faq = faqItems(s);
  const hour = (t: string) => { const m = t.match(/(\d{1,2})\s*h\s*(\d{2})?/); return m ? `${m[1].padStart(2, '0')}:${m[2] ?? '00'}` : undefined; };
  const minPrice = rooms.length ? Math.min(...rooms.map((r) => r.pricePerNight)) : null;

  // Fiche établissement : référence commune (@id) pour la chambre, le restaurant et la salle
  const hotelLd = {
    '@context': 'https://schema.org',
    '@type': ['Hotel', 'LodgingBusiness'],
    '@id': businessRef()['@id'],
    name: SITE_FULL_NAME,
    alternateName: ['Adélé Baké', 'Adélé Baké Guesthouse', 'Résidence Adélé Baké'],
    description: "Maison d'hôtes à taille humaine à Cotonou, à 2 km de l'aéroport : chambres climatisées, cuisine béninoise, salle de conférence et navette aéroport offerte.",
    url: absolute('/'),
    logo: absolute('/icon.svg'),
    image: HERO_SLIDES.map((sl) => sl.src),
    telephone: s.phone,
    email: s.email,
    address: postalAddress(s),
    ...(geo(s) ? { geo: geo(s) } : {}),
    hasMap: s.mapsUrl,
    sameAs: [s.facebook, s.instagram].filter(Boolean),
    ...(hour(s.checkIn) ? { checkinTime: hour(s.checkIn) } : {}),
    ...(hour(s.checkOut) ? { checkoutTime: hour(s.checkOut) } : {}),
    ...(minPrice ? { priceRange: `À partir de ${minPrice} XOF / nuit`, currenciesAccepted: 'XOF' } : {}),
    availableLanguage: ['fr', 'en'],
    amenityFeature: AMENITIES.map((a) => ({ '@type': 'LocationFeatureSpecification', name: a.label, value: true })),
    containsPlace: [{ '@id': absolute('/la-table#restaurant') }, { '@id': absolute('/salle-de-conference#salle') }],
    potentialAction: { '@type': 'ReserveAction', target: absolute('/reservation') },
  };
  const faqLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faq.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })),
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={ldJson(hotelLd)} />
      <script type="application/ld+json" dangerouslySetInnerHTML={ldJson(faqLd)} />

      <section className="hero" aria-label="Présentation">
        <HeroSlider slides={HERO_SLIDES} />
        <div className="hero__copy wrap">
          <h1 className="hero__title">
            <span>Kwabo.</span><span>Bienvenue.</span><span>Welcome.</span>
            <small className="hero__kicker">Maison d&apos;hôtes &amp; salle de conférence à Cotonou</small>
          </h1>
          <p className="hero__lead">
            Une maison d&apos;hôtes à taille humaine au cœur de Cotonou&nbsp;: des chambres calmes, une table béninoise généreuse et une salle pour vos réunions — à deux pas de l&apos;aéroport.
          </p>
          <Link href="#maison" className="btn btn--ghost">Découvrir la maison</Link>
        </div>
      </section>

      <BookingBar today={todayIso()} />

      {/* La maison */}
      <section className="welcome wrap" id="maison">
        <div className="welcome__pics">
          <div className="bogolan" aria-hidden="true" />
          <div className="welcome__a"><Image src={IMG.hotesse} alt="Hôtesse souriante à la réception" fill sizes="(max-width: 960px) 66vw, 30vw" /></div>
          <div className="welcome__b"><Image src={IMG.salonRotin} alt="Coin salon en rotin et plantes vertes" fill sizes="(max-width: 960px) 56vw, 25vw" /></div>
        </div>
        <div>
          <h2>Une maison, pas un hôtel</h2>
          <p>
            Adélé Baké, c&apos;est quelques chambres seulement, un accueil qui vous appelle par votre prénom et une cour où l&apos;on s&apos;attarde le soir. On vient pour une nuit d&apos;escale, pour un séminaire ou pour découvrir le Bénin — on repart avec l&apos;impression d&apos;avoir été reçu en famille.
          </p>
          <ul className="facts">
            <li><strong>≈ 2 km</strong><span>de l&apos;aéroport de Cotonou</span></li>
            <li><strong>Navette</strong><span>aéroport offerte</span></li>
            <li><strong>Salle</strong><span>de conférence équipée</span></li>
          </ul>
          <Link href="/chambres" className="btn btn--copper">Voir les chambres</Link>
        </div>
      </section>

      {/* Services */}
      <section className="amen" aria-labelledby="amen-t">
        <div className="amen__bg"><Image src={IMG.courNuit} alt="" fill sizes="72vw" /></div>
        <div className="amen__panel">
          <div className="bogolan bogolan--light" aria-hidden="true" />
          <h2 id="amen-t">Tout est compris, ou presque</h2>
          <p>Ce qui fait la différence pendant un séjour à Cotonou, on l&apos;a prévu pour vous.</p>
          <ul>
            {AMENITIES.map(({ icon: Icon, label }) => <li key={label}><Icon />{label}</li>)}
          </ul>
        </div>
      </section>

      {/* Chambres */}
      {rooms.length > 0 && (
        <section className="rooms wrap" aria-labelledby="rooms-t">
          <div className="rooms__head">
            <h2 id="rooms-t">Les chambres</h2>
            <p>Climatisées, avec salle de bain privée, TV écran plat et Wi-Fi. Peu de chambres, donc du calme.</p>
          </div>
          <div className="rooms__grid">{rooms.map((r) => <RoomCard key={r.id} room={r} />)}</div>
        </section>
      )}

      {/* Avis */}
      {testimonials.length > 0 && (
        <section className="say" aria-labelledby="say-t">
          <div className="say__panel">
            <h2 id="say-t">Ils sont revenus</h2>
            <Testimonials items={testimonials} />
          </div>
          <div className="say__bg"><Image src={IMG.amis} alt="Groupe d'amis qui rient ensemble" fill sizes="70vw" /></div>
        </section>
      )}

      {/* La table */}
      <section className="table wrap" aria-labelledby="table-t">
        <div className="table__img"><Image src={IMG.cuisineWax2} alt="Cuisinière en robe wax devant une marmite en fonte" fill sizes="(max-width: 960px) 100vw, 45vw" /></div>
        <div>
          <h2 id="table-t">La table d&apos;Adélé</h2>
          <p>Une cuisine de maison, béninoise d&apos;abord, servie en salle ou sous les palmiers. Petit-déjeuner, déjeuner, dîner — et le barbecue du week-end.</p>
          <div className="acc">
            {menu.filter((m) => m.items.length).map((m, i) => (
              <details key={m.key} open={i === 0}>
                <summary>{m.label}<Plus /></summary>
                <div><p>{m.items.slice(0, 6).map((it) => it.name).join(', ')}.</p></div>
              </details>
            ))}
          </div>
          <Link href="/la-table" className="btn btn--line">Voir la carte</Link>
        </div>
      </section>

      {/* Conférence */}
      <section className="conf" aria-labelledby="conf-t">
        <div className="wrap conf__in">
          <div>
            <h2 id="conf-t">Réunions, formations, séminaires</h2>
            <p>Une salle au calme, climatisée et équipée, avec pause-café et déjeuner servis sur place. Vos participants peuvent loger sur place et être récupérés à l&apos;aéroport.</p>
            <dl className="specs">
              <div><dt><Users />Capacité</dt><dd>jusqu&apos;à {s.conferenceCapacity} pers.</dd></div>
              <div><dt><Projector />Équipement</dt><dd>Vidéoprojecteur, sono, Wi-Fi</dd></div>
              <div><dt><Coffee />Restauration</dt><dd>Pauses &amp; déjeuners</dd></div>
              <div><dt><CalendarCheck />Formules</dt><dd>Demi-journée, journée</dd></div>
            </dl>
            <Link className="btn btn--copper" href="/salle-de-conference">Demander un devis</Link>
          </div>
          <div className="conf__pics">
            <div><Image src={IMG.reunion2} alt="Trois femmes en réunion autour d'une table" fill sizes="(max-width: 960px) 50vw, 27vw" /></div>
            <div><Image src={IMG.reunion3} alt="Équipe en séance de travail" fill sizes="(max-width: 960px) 50vw, 27vw" /></div>
          </div>
        </div>
      </section>

      {/* Découvrir */}
      {experiences.length > 0 && (
        <section className="disc wrap" aria-labelledby="disc-t">
          <div className="disc__head">
            <h2 id="disc-t">Autour de la maison</h2>
            <Link href="/decouvrir" className="room__more">Toutes les excursions <ArrowRight /></Link>
          </div>
          <div className="disc__row">
            {experiences.map((e) => {
              const src = mediaUrl(e.imageId);
              return (
                <Link key={e.id} className="spot" href={`/decouvrir#${e.slug}`}>
                  {src && <Image src={src} alt={e.image?.alt ?? e.title} fill sizes="(max-width: 960px) 100vw, 33vw" />}
                  <span><b>{e.title}</b>{e.summary}</span>
                </Link>
              );
            })}
          </div>
        </section>
      )}

      {/* Questions fréquentes */}
      <section className="section section--sand" aria-labelledby="faq-t">
        <div className="wrap split">
          <div>
            <h2 id="faq-t">Questions fréquentes</h2>
            <p className="lead">Tout ce qu&apos;il faut savoir avant votre séjour à Cotonou. Une autre question ? Écrivez-nous sur WhatsApp.</p>
          </div>
          <div className="acc" style={{ marginTop: 0 }}>
            {faq.map((f, i) => (
              <details key={f.q} open={i === 0}>
                <summary>{f.q}<Plus /></summary>
                <div><p>{f.a}</p></div>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section className="wrap section--tight" style={{ paddingBottom: 'clamp(64px,8vw,110px)', textAlign: 'center' }}>
        <h2>Prêt pour votre séjour à Cotonou&nbsp;?</h2>
        <p style={{ margin: '0 auto 1.6rem' }}>Dites-nous vos dates : nous confirmons la disponibilité et venons vous chercher à l&apos;aéroport.</p>
        <Link className="btn btn--copper" href="/reservation"><CalendarCheck /> Demander une réservation</Link>
      </section>
    </>
  );
}
