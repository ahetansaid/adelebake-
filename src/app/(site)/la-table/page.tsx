import type { Metadata } from 'next';
import Image from 'next/image';
import { Coffee, CupSoda, Flame, Soup } from 'lucide-react';
import type { MenuSection } from '@prisma/client';
import { PageHero } from '@/components/site/PageHero';
import { IMG } from '@/content/images';
import { menuBySection } from '@/lib/content';
import { fcfa } from '@/lib/format';
import { absolute, businessRef, geo, ldJson, postalAddress } from '@/lib/seo';
import { getSettings } from '@/lib/settings';

export const revalidate = 300;
export const metadata: Metadata = {
  title: "Restaurant béninois : la table d'Adélé",
  description: 'Cuisine béninoise maison à Cotonou : amiwo, poisson braisé, aloko, grillades du vendredi, petit-déjeuner et jus de bissap. Ouvert aux visiteurs sur réservation.',
  alternates: { canonical: '/la-table' },
};

const ICONS: Record<MenuSection, typeof Soup> = { BENINOIS: Soup, GRILLADES: Flame, PETIT_DEJEUNER: Coffee, BOISSONS: CupSoda };

export default async function MenuPage() {
  const [sections, s] = await Promise.all([menuBySection().then((all) => all.filter((x) => x.items.length)), getSettings()]);

  const restaurantLd = {
    '@context': 'https://schema.org',
    '@type': 'Restaurant',
    '@id': absolute('/la-table#restaurant'),
    name: "La table d'Adélé — restaurant d'Adélé Baké",
    url: absolute('/la-table'),
    servesCuisine: ['Béninoise', 'Africaine', 'Grillades'],
    telephone: s.phone,
    address: postalAddress(s),
    ...(geo(s) ? { geo: geo(s) } : {}),
    containedInPlace: businessRef(),
    acceptsReservations: true,
    hasMenu: {
      '@type': 'Menu',
      inLanguage: 'fr',
      hasMenuSection: sections.map((sec) => ({
        '@type': 'MenuSection',
        name: sec.label,
        hasMenuItem: sec.items.map((it) => ({
          '@type': 'MenuItem',
          name: it.name,
          ...(it.description ? { description: it.description } : {}),
          ...(it.price ? { offers: { '@type': 'Offer', price: it.price, priceCurrency: 'XOF' } } : {}),
        })),
      })),
    },
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={ldJson(restaurantLd)} />
      <PageHero
        title="La table d'Adélé"
        lead="Une cuisine de maison, béninoise d'abord, servie en salle ou sous les palmiers — ouverte aussi aux visiteurs sur réservation."
        image={IMG.cuisineWax}
        crumbs={[{ label: 'La table' }]}
      />

      <section className="section">
        <div className="wrap table" style={{ padding: 0 }}>
          <div className="table__img"><Image src={IMG.brochettes} alt="Brochettes grillées et riz" fill sizes="(max-width: 960px) 100vw, 45vw" /></div>
          <div>
            <h2>Du marché à l&apos;assiette</h2>
            <p className="lead">Amiwo, poisson braisé, aloko, sauce gboma… Nos plats sont cuisinés chaque jour avec les produits du marché. Dites-nous vos envies ou vos régimes : on s&apos;adapte.</p>
            <p>Le vendredi soir, la cour s&apos;anime autour du barbecue. Petit-déjeuner servi dès 6&nbsp;h&nbsp;30.</p>
          </div>
        </div>
      </section>

      <section className="section section--sand">
        <div className="wrap">
          <div className="menu">
            {sections.map((s) => {
              const Icon = ICONS[s.key];
              return (
                <section key={s.key} aria-labelledby={`m-${s.key}`}>
                  <h2 id={`m-${s.key}`}><Icon />{s.label}</h2>
                  <p className="note">{s.intro}</p>
                  {s.items.map((it) => (
                    <div className="dish" key={it.id}>
                      <b>{it.name}{it.featured && <em>Spécialité</em>}</b>
                      <span>{it.price ? fcfa(it.price) : 'sur demande'}</span>
                      {it.description && <p>{it.description}</p>}
                    </div>
                  ))}
                </section>
              );
            })}
          </div>
          <p className="note" style={{ marginTop: '2rem' }}>Carte indicative, susceptible de varier selon le marché. Prix en FCFA.</p>
        </div>
      </section>
    </>
  );
}
