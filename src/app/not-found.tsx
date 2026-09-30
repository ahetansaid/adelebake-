import Link from 'next/link';
import { Footer } from '@/components/site/Footer';
import { Header } from '@/components/site/Header';
import { getSettings } from '@/lib/settings';
import './(site)/site.css';

// Page 404 globale (adresses inexistantes) : reprend l'en-tête et le pied de page du site.
export default async function NotFound() {
  const s = await getSettings();
  return (
    <>
      <Header />
      <main id="contenu">
        <div className="topband" />
        <section className="notfound">
          <div>
            <b>404</b>
            <h1>Cette page s&apos;est égarée</h1>
            <p style={{ margin: '0 auto 1.6rem' }}>La page demandée n&apos;existe pas ou a été déplacée.</p>
            <Link className="btn btn--copper" href="/">Retour à l&apos;accueil</Link>
          </div>
        </section>
      </main>
      <Footer s={s} />
    </>
  );
}
