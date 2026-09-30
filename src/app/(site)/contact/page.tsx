import type { Metadata } from 'next';
import { Clock, Mail, MapPin, MessageCircle, Phone } from 'lucide-react';
import { ContactForm } from '@/components/site/ContactForm';
import { PageHero } from '@/components/site/PageHero';
import { IMG } from '@/content/images';
import { getSettings, whatsappLink } from '@/lib/settings';

export const metadata: Metadata = {
  title: 'Contact et accès',
  description: "Contactez Adélé Baké à Cotonou par WhatsApp, téléphone ou e-mail. À 2 km de l'aéroport, navette offerte. Accueil tous les jours.",
  alternates: { canonical: '/contact' },
};

export default async function ContactPage() {
  const s = await getSettings();
  return (
    <>
      <PageHero title="Nous contacter" lead="Une question, une demande particulière ? Nous vous répondons rapidement." image={IMG.tableJardin} crumbs={[{ label: 'Contact' }]} />
      <section className="section">
        <div className="wrap split">
          <div className="panel">
            <h2 style={{ fontSize: '2rem' }}>Écrivez-nous</h2>
            <ContactForm />
          </div>
          <aside className="panel panel--indigo sticky">
            <ul className="contact-list">
              <li><span className="ico"><MessageCircle /></span><span><b>WhatsApp</b><a href={whatsappLink(s.whatsapp)} target="_blank" rel="noopener noreferrer">{s.phone}</a></span></li>
              <li><span className="ico"><Phone /></span><span><b>Téléphone</b><a href={`tel:+${s.whatsapp.replace(/\D/g, '')}`}>{s.phone}</a></span></li>
              <li><span className="ico"><Mail /></span><span><b>E-mail</b><a href={`mailto:${s.email}`}>{s.email}</a></span></li>
              <li><span className="ico"><MapPin /></span><span><b>Adresse</b>{s.address}<br />{s.airportDistance}<br /><a href={s.mapsUrl} target="_blank" rel="noopener noreferrer">Itinéraire Google Maps →</a></span></li>
              <li><span className="ico"><Clock /></span><span><b>Accueil</b>{s.receptionHours}</span></li>
            </ul>
          </aside>
        </div>
      </section>
    </>
  );
}
