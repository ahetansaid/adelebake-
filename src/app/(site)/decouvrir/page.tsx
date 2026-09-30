import type { Metadata } from 'next';
import Image from 'next/image';
import { CalendarDays, MessageCircle, Wallet } from 'lucide-react';
import { PageHero } from '@/components/site/PageHero';
import { IMG } from '@/content/images';
import { publishedExperiences } from '@/lib/content';
import { fcfa } from '@/lib/format';
import { mediaUrl } from '@/lib/media-url';
import { getSettings, whatsappLink } from '@/lib/settings';

export const revalidate = 300;
export const metadata: Metadata = {
  title: 'Découvrir le Bénin',
  description: 'Ganvié, Ouidah, marché Dantokpa : excursions organisées depuis Adélé Baké, avec des guides de confiance.',
};

export default async function DiscoverPage() {
  const [items, s] = await Promise.all([publishedExperiences(), getSettings()]);
  return (
    <>
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
