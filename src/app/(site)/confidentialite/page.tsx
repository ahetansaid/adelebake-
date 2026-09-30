import type { Metadata } from 'next';
import { getSettings } from '@/lib/settings';

export const metadata: Metadata = { title: 'Politique de confidentialité', robots: { index: false } };

export default async function PrivacyPage() {
  const s = await getSettings();
  return (
    <>
    <div className="topband" />
    <section className="section">
      <div className="wrap prose">
        <h1>Politique de confidentialité</h1>
        <p>Adélé Baké attache une grande importance à la protection de vos données personnelles, conformément au Code du numérique de la République du Bénin (loi n° 2017-20) et aux recommandations de l&apos;Autorité de Protection des Données à caractère Personnel (APDP).</p>
        <h2>Données collectées</h2>
        <p>Via nos formulaires (réservation, devis, contact) : nom, e-mail, téléphone, dates de séjour, nombre de voyageurs, informations de vol pour la navette et votre message. Aucune donnée bancaire n&apos;est collectée sur ce site.</p>
        <h2>Finalités</h2>
        <ul>
          <li>Traiter votre demande de réservation, de devis ou d&apos;information ;</li>
          <li>Organiser votre accueil et votre transfert depuis l&apos;aéroport ;</li>
          <li>Vous recontacter au sujet de votre demande.</li>
        </ul>
        <p>Vos données ne sont ni vendues ni cédées à des tiers.</p>
        <h2>Conservation</h2>
        <p>Les demandes sont conservées au maximum 3 ans après le dernier contact, puis supprimées.</p>
        <h2>Sécurité</h2>
        <p>Les échanges sont chiffrés (HTTPS). L&apos;accès aux demandes est réservé à l&apos;équipe de l&apos;établissement, via un espace protégé par mot de passe. Les adresses IP servent uniquement à limiter les abus et ne sont conservées que sous forme chiffrée irréversible.</p>
        <h2>Vos droits</h2>
        <p>Vous pouvez demander l&apos;accès, la rectification ou la suppression de vos données en écrivant à <a href={`mailto:${s.email}`}>{s.email}</a>.</p>
        <h2>Cookies</h2>
        <p>Ce site n&apos;utilise ni cookie publicitaire ni outil de suivi. Seul un cookie technique est utilisé pour la connexion de l&apos;équipe à l&apos;espace de gestion.</p>
      </div>
    </section>
    </>
  );
}
