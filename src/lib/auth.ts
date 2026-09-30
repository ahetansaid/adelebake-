import 'server-only';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { db } from './db';
import { SESSION_COOKIE, SESSION_DAYS, signSession, verifySession, type SessionPayload } from './session';

export async function createSession(user: { id: string; email: string; name: string }) {
  const token = await signSession({ sub: user.id, email: user.email, name: user.name });
  (await cookies()).set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: SESSION_DAYS * 86_400,
  });
}

export async function destroySession() {
  (await cookies()).delete(SESSION_COOKIE);
}

export async function getSession(): Promise<SessionPayload | null> {
  return verifySession((await cookies()).get(SESSION_COOKIE)?.value);
}

/**
 * Garde-fou côté serveur pour chaque page et action du back-office
 * (en plus du middleware) : vérifie aussi que le compte existe toujours.
 */
export async function requireAdmin() {
  const session = await getSession();
  if (!session) redirect('/admin/login');
  const user = await db.adminUser.findUnique({ where: { id: session.sub }, select: { id: true, email: true, name: true } });
  if (!user) redirect('/admin/login');
  return user;
}
