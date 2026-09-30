'use server';

import bcrypt from 'bcryptjs';
import { redirect } from 'next/navigation';
import { z } from 'zod';
import { createSession, destroySession } from '@/lib/auth';
import { db } from '@/lib/db';
import { rateLimit } from '@/lib/rate-limit';

/** L'e-mail saisi est renvoyé en cas d'échec : React 19 réinitialise le formulaire après l'action. */
export type LoginState = { error?: string; email?: string };

// Empreinte factice : la vérification prend le même temps, que le compte existe ou non.
const DUMMY_HASH = '$2b$12$fW5cocPZggyZXlA1RNVcbe40tO12kl1pjwIUEHLUaA5KlkH2D36f2';

const schema = z.object({ email: z.string().trim().toLowerCase().email(), password: z.string().min(1).max(200) });

export async function login(_prev: LoginState, form: FormData): Promise<LoginState> {
  const email = String(form.get('email') ?? '').slice(0, 255);
  if (!(await rateLimit('login', 5, 900))) {
    return { error: 'Trop de tentatives. Réessayez dans 15 minutes.', email };
  }
  const parsed = schema.safeParse({ email, password: form.get('password') });
  if (!parsed.success) return { error: 'E-mail ou mot de passe incorrect.', email };

  const user = await db.adminUser.findUnique({ where: { email: parsed.data.email } });
  const ok = await bcrypt.compare(parsed.data.password, user?.passwordHash ?? DUMMY_HASH);
  if (!user || !ok) return { error: 'E-mail ou mot de passe incorrect.', email };

  await db.adminUser.update({ where: { id: user.id }, data: { lastLoginAt: new Date() } });
  await createSession(user);
  redirect('/admin');
}

export async function logout() {
  await destroySession();
  redirect('/admin/login');
}
