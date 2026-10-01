/**
 * Contenus fixes de la page « Découvrir ».
 * Photos de la galerie : public/images/decouvrir — fournies par l'établissement,
 * droits d'utilisation à confirmer avant indexation (voir README).
 */

export const GALLERY = [
  { file: 'etoile-rouge-cotonou', w: 480, h: 351, title: "Place de l'Étoile rouge", place: 'Cotonou', alt: "Vue aérienne de la place de l'Étoile rouge à Cotonou" },
  { file: 'ganvie-maisons-sur-pilotis', w: 640, h: 800, title: 'Les maisons sur pilotis', place: 'Ganvié', alt: 'Maisons colorées sur pilotis à Ganvié, sur le lac Nokoué' },
  { file: 'cathedrale-notre-dame-cotonou', w: 354, h: 500, title: 'Cathédrale Notre-Dame', place: 'Cotonou', alt: 'Façade rayée rouge et blanc de la cathédrale Notre-Dame de Cotonou' },
  { file: 'palais-des-congres-cotonou', w: 735, h: 490, title: 'Palais des Congrès', place: 'Cotonou', alt: 'Le Palais des Congrès de Cotonou' },
  { file: 'grande-mosquee-porto-novo', w: 354, h: 500, title: 'La Grande Mosquée', place: 'Porto-Novo', alt: 'La Grande Mosquée multicolore de Porto-Novo, de style afro-brésilien' },
  { file: 'basilique-ouidah', w: 420, h: 524, title: "Basilique de l'Immaculée-Conception", place: 'Ouidah', alt: "La basilique de l'Immaculée-Conception de Ouidah" },
  { file: 'plage-littoral-benin', w: 600, h: 800, title: 'Le littoral', place: 'Côte béninoise', alt: 'Plage de sable et cocotiers sur le littoral béninois' },
  { file: 'cotonou-vu-du-ciel', w: 596, h: 335, title: 'Cotonou vu du ciel', place: 'Cotonou', alt: 'Vue aérienne de Cotonou, rond-point planté de palmiers et marché' },
] as const;

/** Temps de trajet indicatifs depuis la maison (hors embouteillages). */
export const TRAVEL_TIMES = [
  { place: "Aéroport de Cotonou", time: '≈ 5 min' },
  { place: 'Marché Dantokpa', time: '≈ 20 min' },
  { place: 'Ganvié (embarcadère d’Abomey-Calavi)', time: '≈ 40 min' },
  { place: 'Porto-Novo', time: '≈ 45 min' },
  { place: 'Ouidah', time: '≈ 1 h' },
  { place: 'Abomey', time: '≈ 2 h 30' },
  { place: 'Dassa-Zoumé', time: '≈ 3 h' },
] as const;
