import Link from 'next/link';
import { whatsappLink, type SiteSettings } from '@/lib/settings';
import { Logo } from './Logo';

export function Footer({ s }: { s: SiteSettings }) {
  const year = new Date().getFullYear();
  return (
    <footer className="foot">
      <div className="bogolan bogolan--strip" aria-hidden="true" />
      <div className="wrap foot__in">
        <div>
          <Logo tone="light" stack />
        </div>
        <div>
          <h3>La maison</h3>
          <ul>
            <li><Link href="/chambres">Chambres</Link></li>
            <li><Link href="/la-table">La table</Link></li>
            <li><Link href="/salle-de-conference">Salle de conférence</Link></li>
            <li><Link href="/decouvrir">Découvrir le Bénin</Link></li>
            <li><Link href="/reservation">Réserver</Link></li>
          </ul>
        </div>
        <div>
          <h3>Nous trouver</h3>
          <p>
            {s.address}
            <br />
            {s.airportDistance}
            <br />
            Accueil : {s.receptionHours}
          </p>
          <a href={s.mapsUrl} target="_blank" rel="noopener noreferrer">Ouvrir dans Google Maps</a>
        </div>
        <div>
          <h3>Nous joindre</h3>
          <ul>
            <li><a href={whatsappLink(s.whatsapp)} target="_blank" rel="noopener noreferrer">{s.phone} (WhatsApp)</a></li>
            <li><a href={`mailto:${s.email}`}>{s.email}</a></li>
            <li><a href={s.facebook} target="_blank" rel="noopener noreferrer">Facebook</a> · <a href={s.instagram} target="_blank" rel="noopener noreferrer">Instagram</a></li>
          </ul>
        </div>
      </div>
      <div className="wrap foot__bottom">
        <p>© {year} Adélé Baké — Guesthouse &amp; Conference Venue, Cotonou</p>
        <nav aria-label="Informations légales">
          <Link href="/mentions-legales">Mentions légales</Link>
          <Link href="/confidentialite">Confidentialité</Link>
        </nav>
      </div>
    </footer>
  );
}
