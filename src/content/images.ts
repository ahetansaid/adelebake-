/**
 * Photos d'ambiance (illustrations Pexels, licence libre) en attendant les vraies photos
 * de la maison. Les chambres et excursions utilisent, elles, les photos gérées dans le back-office.
 */
const px = (id: number) => `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&w=2000`;

export const IMG = {
  courNuit: px(30769678), // cour sous les palmiers, le soir
  chambreLodge: px(9130978),
  cuisineWax: px(34370433), // cuisinière en pagne wax, marmite
  cuisineWax2: px(34370431),
  reunion: px(1181406),
  reunion2: px(1181358),
  reunion3: px(1181396),
  hotesse: px(20209020),
  salonRotin: px(15156681),
  amis: px(9287491),
  brochettes: px(2641886),
  riz: px(13063294),
  petitDej: px(14690432),
  ganvie: px(6729840),
  ouidah: px(32032141),
  tableJardin: px(5638639),
} as const;

export const HERO_SLIDES = [
  { src: IMG.courNuit, alt: 'Cour arborée sous les palmiers, éclairée le soir', label: 'La cour' },
  { src: IMG.chambreLodge, alt: 'Chambre chaleureuse aux boiseries, lumière du soir', label: 'Les chambres' },
  { src: IMG.cuisineWax, alt: 'Cuisinière en pagne wax préparant un plat traditionnel', label: 'La table' },
  { src: IMG.reunion, alt: 'Réunion de travail dans une salle lumineuse', label: 'Conférences' },
] as const;
