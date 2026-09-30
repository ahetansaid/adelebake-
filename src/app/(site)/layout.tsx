import type { ReactNode } from 'react';
import { MessageCircle } from 'lucide-react';
import { Footer } from '@/components/site/Footer';
import { Header } from '@/components/site/Header';
import { getSettings, whatsappLink } from '@/lib/settings';
import './site.css';

export default async function SiteLayout({ children }: { children: ReactNode }) {
  const s = await getSettings();
  return (
    <>
      <a className="skip" href="#contenu">Aller au contenu</a>
      <Header />
      <main id="contenu">{children}</main>
      <Footer s={s} />
      <a
        className="wa"
        href={whatsappLink(s.whatsapp, 'Bonjour Adélé Baké, je souhaite des informations pour un séjour.')}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Nous écrire sur WhatsApp"
      >
        <MessageCircle />
      </a>
    </>
  );
}
