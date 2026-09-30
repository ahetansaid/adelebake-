import { saveSettings } from '../actions';
import { ActionForm, SaveButton } from '@/components/admin/ui';
import { requireAdmin } from '@/lib/auth';
import { getSettings, SETTING_LABELS, type SettingKey } from '@/lib/settings';

export const metadata = { title: 'Coordonnées & infos' };

const GROUPS: { title: string; keys: SettingKey[] }[] = [
  { title: 'Contact', keys: ['phone', 'whatsapp', 'email', 'notifyEmail'] },
  { title: 'Adresse & horaires', keys: ['address', 'airportDistance', 'receptionHours', 'checkIn', 'checkOut'] },
  { title: 'Salle de conférence', keys: ['conferenceCapacity'] },
  { title: 'Liens', keys: ['facebook', 'instagram', 'mapsUrl'] },
];

export default async function SettingsPage() {
  await requireAdmin();
  const s = await getSettings();
  return (
    <>
      <div className="adm-head"><div><h1>Coordonnées &amp; infos</h1><p>Affichées partout sur le site (en-tête, pied de page, pages Contact et Réserver).</p></div></div>
      <section className="adm-card" style={{ maxWidth: 900 }}>
        <ActionForm action={saveSettings}>
          {GROUPS.map((g) => (
            <fieldset key={g.title} className="full" style={{ border: 0, padding: 0, margin: '6px 0 10px' }}>
              <legend style={{ fontFamily: 'var(--font-serif)', fontWeight: 600, fontSize: '1.2rem', marginBottom: 10 }}>{g.title}</legend>
              <div className="f-grid">
                {g.keys.map((k) => (
                  <label key={k} className="f"><span>{SETTING_LABELS[k]}</span>
                    <input name={k} defaultValue={s[k]} maxLength={500} type={k.toLowerCase().includes('email') ? 'email' : 'text'} />
                  </label>
                ))}
              </div>
            </fieldset>
          ))}
          <div className="full f-actions"><SaveButton /></div>
        </ActionForm>
      </section>
    </>
  );
}
