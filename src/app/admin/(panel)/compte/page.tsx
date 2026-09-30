import { addAdmin, changePassword, deleteAdmin } from '../actions';
import { ActionForm, ConfirmButton, SaveButton } from '@/components/admin/ui';
import { requireAdmin } from '@/lib/auth';
import { db } from '@/lib/db';
import { formatDateTime } from '@/lib/format';

export const metadata = { title: 'Comptes' };

export default async function AccountPage() {
  const me = await requireAdmin();
  const users = await db.adminUser.findMany({ orderBy: { createdAt: 'asc' }, select: { id: true, name: true, email: true, lastLoginAt: true } });

  return (
    <>
      <div className="adm-head"><div><h1>Comptes</h1><p>Personnes ayant accès à l&apos;espace de gestion.</p></div></div>
      <div className="adm-grid2">
        <section className="adm-card">
          <h2>Équipe</h2>
          <table className="adm-table">
            <thead><tr><th>Nom</th><th>Dernière connexion</th><th></th></tr></thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id}>
                  <td>{u.name}{u.id === me.id && <small> (vous)</small>}<br /><small>{u.email}</small></td>
                  <td className="num">{u.lastLoginAt ? formatDateTime(u.lastLoginAt) : '—'}</td>
                  <td>{u.id !== me.id && users.length > 1 && <ConfirmButton action={deleteAdmin.bind(null, u.id)} label="Retirer" question={`Retirer l'accès de ${u.email} ?`} />}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <h2 style={{ marginTop: 24 }}>Ajouter une personne</h2>
          <ActionForm action={addAdmin}>
            <label className="f"><span>Nom</span><input name="name" required maxLength={120} /></label>
            <label className="f"><span>E-mail</span><input name="email" type="email" required autoComplete="off" /></label>
            <label className="f full"><span>Mot de passe provisoire (12 caractères min.)</span><input name="password" type="password" minLength={12} required autoComplete="new-password" /><small>À transmettre de vive voix ; la personne le change ensuite ici.</small></label>
            <div className="full f-actions"><SaveButton label="Créer le compte" /></div>
          </ActionForm>
        </section>
        <section className="adm-card">
          <h2>Mon mot de passe</h2>
          <ActionForm action={changePassword}>
            <label className="f full"><span>Mot de passe actuel</span><input name="current" type="password" required autoComplete="current-password" /></label>
            <label className="f full"><span>Nouveau mot de passe (12 caractères min.)</span><input name="next" type="password" minLength={12} required autoComplete="new-password" /></label>
            <label className="f full"><span>Confirmer</span><input name="confirm" type="password" minLength={12} required autoComplete="new-password" /></label>
            <div className="full f-actions"><SaveButton label="Changer le mot de passe" /></div>
          </ActionForm>
        </section>
      </div>
    </>
  );
}
