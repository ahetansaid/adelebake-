import { CalendarCheck } from 'lucide-react';

/** Barre de réservation de l'accueil : simple formulaire GET vers /reservation (fonctionne sans JavaScript). */
export function BookingBar({ today }: { today: string }) {
  return (
    <form className="book wrap" action="/reservation" method="get" aria-label="Vérifier les disponibilités">
      <label>
        <span>Arrivée</span>
        <input type="date" name="arrivee" min={today} required />
      </label>
      <label>
        <span>Départ</span>
        <input type="date" name="depart" min={today} required />
      </label>
      <label>
        <span>Adultes</span>
        <select name="adultes" defaultValue="2">
          {[1, 2, 3, 4, 5, 6].map((n) => <option key={n}>{n}</option>)}
        </select>
      </label>
      <label>
        <span>Enfants</span>
        <select name="enfants" defaultValue="0">
          {[0, 1, 2, 3, 4].map((n) => <option key={n}>{n}</option>)}
        </select>
      </label>
      <button className="book__go" type="submit">
        <CalendarCheck /> Demander une réservation
      </button>
    </form>
  );
}
