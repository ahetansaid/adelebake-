import type { Metadata } from 'next';
import Image from 'next/image';
import { CalendarDays, Car, MapPin, MessageCircle, Wallet } from 'lucide-react';
import { PageHero } from '@/components/site/PageHero';
import { GALLERY, TRAVEL_TIMES } from '@/content/decouvrir';
import { IMG } from '@/content/images';
import { publishedExperiences } from '@/lib/content';
import { fcfa } from '@/lib/format';
import { mediaUrl } from '@/lib/media-url';
import { absolute, businessRef, ldJson } from '@/lib/seo';
import { getSettings, whatsappLink } from '@/lib/settings';

export const revalidate = 300;
export const metadata: Metadata = {
  title: 'Que faire à Cotonou ? Ganvié, Ouidah, Abomey',
  description: "Excursions au départ de Cotonou : Ganvié la cité lacustre, Ouidah et la Porte du Non-Retour, les palais royaux d'Abomey, les plages et Dassa-Zoumé. Guides de confiance, transport organisé.",
  alternates: { canonical: '/decouvrir' },
};

export default async function DiscoverPage() {
  const [items, s] = await Promise.all([publishedExperiences(), getSettings()]);
  const tripsLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'Excursions au départ d’Adélé Baké, Cotonou',
    itemListElement: items.map((e, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      item: {
        '@type': 'TouristTrip',
        name: e.title,
        description: e.summary,
        url: absolute(`/decouvrir#${e.slug}`),
        ...(e.imageId ? { image: absolute(`/media/${e.imageId}`) } : {}),
        touristType: ['Voyageurs', 'Familles', 'Groupes'],
        provider: businessRef(),
        ...(e.price ? { offers: { '@type': 'Offer', price: e.price, priceCurrency: 'XOF' } } : {}),
      },
    })),
  };
  const placesLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'Lieux à voir autour de Cotonou',
    itemListElement: GALLERY.map((g, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      item: { '@type': 'TouristAttraction', name: `${g.title} (${g.place})`, image: absolute(`/images/decouvrir/${g.file}.webp`) },
    })),
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={ldJson(tripsLd)} />
      <script type="application/ld+json" dangerouslySetInnerHTML={ldJson(placesLd)} />
      <PageHero
        title="Découvrir le Bénin"
        lead="Cité lacustre, route des Esclaves, palais royaux, grands marchés : nous organisons vos sorties avec des guides de confiance."
        image={IMG.ganvie}
        crumbs={[{ label: 'Découvrir' }]}
      />

      {/* Introduction + temps de trajet */}
      <section className="section section--tight">
        <div className="wrap split">
          <div>
            <h2>Que faire à Cotonou et autour&nbsp;?</h2>
            <p className="lead">
              Adélé Baké est un point de départ idéal pour découvrir le sud du Bénin&nbsp;: Ganvié et le lac Nokoué à moins d&apos;une heure, Ouidah et sa mémoire de la traite, Porto-Novo la capitale, et plus loin les palais royaux d&apos;Abomey.
            </p>
            <p>Dites-nous ce qui vous intéresse : nous réservons le chauffeur et le guide, et adaptons les horaires à vos vols ou à votre séminaire.</p>
          </div>
          <aside className="panel" aria-labelledby="trajets-t">
            <h3 id="trajets-t" style={{ fontSize: '1.5rem', display: 'flex', alignItems: 'center', gap: 8 }}><Car size={22} color="var(--copper)" /> Depuis la maison</h3>
            <ul className="trips">
              {TRAVEL_TIMES.map((t) => <li key={t.place}><span><MapPin size={15} />{t.place}</span><b>{t.time}</b></li>)}
            </ul>
            <p className="note">Temps indicatifs, hors embouteillages.</p>
          </aside>
        </div>
      </section>

      {/* Excursions */}
      <section className="section section--tight" aria-label="Nos excursions">
        <div className="wrap">
          {items.map((e) => {
            const src = mediaUrl(e.imageId);
            return (
              <article key={e.id} id={e.slug} className="exp">
                <div className="exp__img">{src && <Image src={src} alt={e.image?.alt ?? e.title} fill sizes="(max-width: 960px) 100vw, 45vw" />}</div>
                <div>
                  <h2>{e.title}</h2>
                  <p className="exp__meta">
                    {e.schedule && <span><CalendarDays />{e.schedule}</span>}
                    <span><Wallet />{e.price ? `${fcfa(e.price)} / pers.` : 'Tarif sur demande'}</span>
                  </p>
                  {e.description.split(/\n{2,}/).map((p, i) => <p key={i}>{p}</p>)}
                  <a className="btn btn--line" target="_blank" rel="noopener noreferrer"
                    href={whatsappLink(s.whatsapp, `Bonjour Adélé Baké, je souhaite organiser l'excursion « ${e.title} ».`)}>
                    <MessageCircle /> Organiser cette sortie
                  </a>
                </div>
              </article>
            );
          })}
          {items.length === 0 && <p className="lead">Nos excursions seront bientôt présentées ici.</p>}
        </div>
      </section>

      {/* Galerie */}
      <section className="section section--sand" aria-labelledby="galerie-t">
        <div className="wrap">
          <h2 id="galerie-t">Le Bénin autour de vous</h2>
          <p className="lead" style={{ marginBottom: '2rem' }}>Quelques lieux à voir pendant votre séjour, entre Cotonou, Porto-Novo et Ouidah.</p>
          <div className="mosaic">
            {GALLERY.map((g) => (
              <figure key={g.file} className={g.h > g.w ? 'is-tall' : undefined}>
                <Image src={`/images/decouvrir/${g.file}.webp`} alt={g.alt} width={g.w} height={g.h} sizes="(max-width: 700px) 50vw, 25vw" />
                <figcaption><b>{g.title}</b>{g.place}</figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
