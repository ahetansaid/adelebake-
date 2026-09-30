import type { SiteSettings } from '@/lib/settings';

/**
 * Questions fréquentes (affichées sur l'accueil + données structurées FAQPage).
 * Réponses à faire valider par l'établissement avant la mise en ligne.
 */
export function faqItems(s: SiteSettings) {
  // espace insécable avant « ? » et « : » (typographie française, pas de ponctuation orpheline)
  const nbsp = (t: string) => t.replace(/ ([?:!;])/g, ' $1');
  return rawItems(s).map((f) => ({ q: nbsp(f.q), a: nbsp(f.a) }));
}

function rawItems(s: SiteSettings) {
  return [
    {
      q: "La navette depuis l'aéroport de Cotonou est-elle offerte ?",
      a: `Oui. Nous venons vous chercher gratuitement à l'aéroport — la maison est à ${s.airportDistance.replace(/^≈\s*/, 'environ ')} — et vous y raccompagnons au départ. Indiquez simplement votre numéro de vol et votre heure d'arrivée lors de la réservation.`,
    },
    {
      q: "Quelles sont les heures d'arrivée et de départ ?",
      a: `Arrivée : ${s.checkIn.toLowerCase()}. Départ : ${s.checkOut.toLowerCase()}. Une arrivée tardive est possible : prévenez-nous par WhatsApp au ${s.phone}.`,
    },
    {
      q: 'Comment réserver une chambre ?',
      a: 'Envoyez votre demande depuis la page Réserver ou par WhatsApp. Nous confirmons la disponibilité et le tarif, généralement dans la journée. Les modalités de paiement vous sont précisées à la confirmation ; aucun paiement n’est demandé en ligne.',
    },
    {
      q: 'Le petit-déjeuner est-il inclus ?',
      a: 'Oui, le petit-déjeuner béninois ou continental est compris dans le prix de la chambre. Le restaurant sert aussi déjeuners et dîners, et un barbecue le vendredi soir.',
    },
    {
      q: 'Peut-on organiser un séminaire avec hébergement des participants ?',
      a: `Oui. Notre salle de conférence accueille jusqu'à ${s.conferenceCapacity} personnes, avec vidéoprojecteur, Wi-Fi, pauses et repas. Vos participants peuvent loger sur place et être accueillis à l'aéroport. Demandez un devis depuis la page Salle de conférence.`,
    },
    {
      q: 'Le Wi-Fi et le parking sont-ils gratuits ?',
      a: 'Oui : Wi-Fi gratuit dans toute la maison et parking sécurisé pour nos hôtes.',
    },
  ];
}
