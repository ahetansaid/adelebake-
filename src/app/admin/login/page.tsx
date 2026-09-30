import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { LogoMark } from '@/components/site/Logo';
import { getSession } from '@/lib/auth';
import { LoginForm } from './LoginForm';
import '../admin.css';

export const metadata: Metadata = { title: 'Connexion — Espace de gestion', robots: { index: false, follow: false } };

export default async function LoginPage() {
  if (await getSession()) redirect('/admin');
  return (
    <div className="adm">
      <div className="login">
        <div className="login__card">
          <LogoMark className="logo-mark" />
          <h1>Espace de gestion</h1>
          <p className="sub">Adélé Baké — accès réservé à l&apos;équipe</p>
          <LoginForm />
        </div>
      </div>
    </div>
  );
}
