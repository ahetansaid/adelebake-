const nf = new Intl.NumberFormat('fr-FR');

/** 35000 → « 35 000 FCFA » */
export function fcfa(amount: number) {
  return `${nf.format(amount)} FCFA`;
}

const dateFmt = new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' });
const dateTimeFmt = new Intl.DateTimeFormat('fr-FR', {
  day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', timeZone: 'Africa/Porto-Novo',
});

/** Dates « calendrier » (colonnes @db.Date, stockées à minuit UTC). */
export function formatDay(d: Date) {
  return dateFmt.format(d);
}

/** Horodatages (création d'une demande…), à l'heure du Bénin. */
export function formatDateTime(d: Date) {
  return dateTimeFmt.format(d);
}

export function nightsBetween(checkIn: Date, checkOut: Date) {
  return Math.max(0, Math.round((checkOut.getTime() - checkIn.getTime()) / 86_400_000));
}

export function slugify(input: string) {
  return input
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 100);
}

/** Référence lisible pour les demandes : « AB-7K3Q9D ». */
export function makeReference(prefix: string) {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const bytes = crypto.getRandomValues(new Uint8Array(6));
  return `${prefix}-${Array.from(bytes, (b) => alphabet[b % alphabet.length]).join('')}`;
}
