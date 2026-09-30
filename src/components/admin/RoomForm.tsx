import type { Room } from '@prisma/client';
import type { ActionState } from '@/app/admin/(panel)/actions';
import { ActionForm, SaveButton } from './ui';

export function RoomForm({ room, action }: { room?: Room; action: (p: ActionState, f: FormData) => Promise<ActionState> }) {
  return (
    <ActionForm action={action} multipart>
      <label className="f"><span>Nom de la chambre</span><input name="name" required maxLength={120} defaultValue={room?.name} /></label>
      <label className="f"><span>Adresse de la page (optionnel)</span><input name="slug" maxLength={100} defaultValue={room?.slug} placeholder="générée depuis le nom" /><small>Ex. chambre-classique → /chambres/chambre-classique</small></label>
      <label className="f full"><span>Résumé (affiché sous le titre)</span><input name="summary" required maxLength={300} defaultValue={room?.summary} /></label>
      <label className="f full"><span>Description</span><textarea name="description" required maxLength={8000} rows={7} defaultValue={room?.description} /><small>Laissez une ligne vide entre deux paragraphes.</small></label>
      <label className="f"><span>Prix par nuit (FCFA)</span><input name="pricePerNight" type="number" min={1000} step={500} required defaultValue={room?.pricePerNight} /></label>
      <label className="f"><span>Capacité (personnes)</span><input name="capacity" type="number" min={1} max={12} required defaultValue={room?.capacity ?? 2} /></label>
      <label className="f"><span>Couchage</span><input name="bedType" required maxLength={80} defaultValue={room?.bedType} placeholder="Lit double, 2 lits simples…" /></label>
      <label className="f"><span>Surface en m² (optionnel)</span><input name="sizeM2" type="number" min={5} max={500} defaultValue={room?.sizeM2 ?? ''} /></label>
      <label className="f full"><span>Équipements</span><textarea name="amenities" rows={4} defaultValue={room?.amenities.join('\n')} placeholder={'Climatisation\nSalle de bain privée\nWi-Fi'} /><small>Un équipement par ligne.</small></label>
      <label className="f"><span>{room?.coverId ? 'Remplacer la photo principale' : 'Photo principale'}</span><input name="cover" type="file" accept="image/jpeg,image/png,image/webp,image/avif" /><small>JPEG, PNG ou WebP — 10 Mo maximum. Redimensionnée automatiquement.</small></label>
      <label className="f"><span>Ajouter des photos à la galerie</span><input name="gallery" type="file" multiple accept="image/jpeg,image/png,image/webp,image/avif" /><small>Plusieurs fichiers possibles.</small></label>
      <label className="f"><span>Ordre d&apos;affichage</span><input name="sortOrder" type="number" min={0} max={999} defaultValue={room?.sortOrder ?? 0} /></label>
      <div className="f" style={{ justifyContent: 'flex-end' }}><label className="f-check"><input type="checkbox" name="published" defaultChecked={room?.published ?? true} /> Visible sur le site</label></div>
      <div className="full f-actions"><SaveButton label={room ? 'Enregistrer' : 'Créer la chambre'} /></div>
    </ActionForm>
  );
}
