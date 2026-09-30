import type { Metadata } from 'next';
import Image from 'next/image';
import { CalendarDays, MessageCircle, Wallet } from 'lucide-react';
import { PageHero } from '@/components/site/PageHero';
import { IMG } from '@/content/images';
import { publishedExperiences } from '@/lib/content';
import { fcfa } from '@/lib/format';
import { mediaUrl } from '@/lib/media-url';
import { absolute, businessRef, ldJson } from '@/lib/seo';
import { getSettings, whatsappLink } from '@/lib/settings';

export const revalidate = 300;
export const metadata: Metadata = {
  title: 'Excursions à Ganvié, Ouidah et Cotonou',
  description: "Visitez Ganvié, la cité lacustre, la Route des Esclaves à Ouidah et le marché Dantokpa avec des guides de confiance, au départ d'Adélé Baké à Cotonou.",
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
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={ldJson(tripsLd)} />
      <PageHero
        title="Découvrir le Bénin"
        lead="Cité lacustre, route des Esclaves, grands marchés : nous organisons vos sorties avec des guides de confiance."
        image={IMG.ganvie}
        crumbs={[{ label: 'Découvrir' }]}
      />
      <section className="section section--tight">
        <div className="wrap">
          {items.map((e) => {
            const src = mediaUrl(e.imageId);
            return (
              <article key={e.id} id={e.slug} className="exp">
                <div className="exp__img">{src && <Image src={src} alt={e.title} fill sizes="(max-width: 960px) 100vw, 45vw" />}</div>
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
    </>
  );
}
