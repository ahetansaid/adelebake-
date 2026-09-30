import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { saveRoom } from '../../actions';
import { RoomForm } from '@/components/admin/RoomForm';
import { requireAdmin } from '@/lib/auth';

export const metadata = { title: 'Nouvelle chambre' };

export default async function NewRoom() {
  await requireAdmin();
  return (
    <>
      <p><Link href="/admin/chambres" className="row-link"><ArrowLeft size={14} /> Chambres</Link></p>
      <div className="adm-head"><h1>Nouvelle chambre</h1></div>
      <section className="adm-card" style={{ maxWidth: 900 }}>
        <RoomForm action={saveRoom.bind(null, null)} />
      </section>
    </>
  );
}
