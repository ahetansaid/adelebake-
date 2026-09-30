import Image from 'next/image';
import Link from 'next/link';

type Crumb = { href?: string; label: string };

export function PageHero({ title, lead, image, alt = '', crumbs = [] }: {
  title: string; lead?: string; image: string; alt?: string; crumbs?: Crumb[];
}) {
  return (
    <section className="phero">
      <Image src={image} alt={alt} fill priority sizes="100vw" />
      <div className="wrap phero__in">
        <nav className="crumbs" aria-label="Fil d'Ariane">
          <Link href="/">Accueil</Link>
          {crumbs.map((c) => (
            <span key={c.label}>
              <span aria-hidden="true">/ </span>
              {c.href ? <Link href={c.href}>{c.label}</Link> : <span aria-current="page">{c.label}</span>}
            </span>
          ))}
        </nav>
        <h1>{title}</h1>
        {lead && <p>{lead}</p>}
      </div>
    </section>
  );
}
