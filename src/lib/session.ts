import { SignJWT, jwtVerify } from 'jose';

// Module sans dépendance Node : utilisable dans le middleware (runtime edge).

export const SESSION_COOKIE = 'ab_admin';
export const SESSION_DAYS = 7;

export type SessionPayload = { sub: string; email: string; name: string };

function secretKey() {
  const secret = process.env.AUTH_SECRET;
  if (!secret || secret.length < 32) throw new Error('AUTH_SECRET manquant ou trop court (32 caractères minimum).');
  return new TextEncoder().encode(secret);
}

export async function signSession(payload: SessionPayload) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_DAYS}d`)
    .sign(secretKey());
}

export async function verifySession(token: string | undefined): Promise<SessionPayload | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secretKey(), { algorithms: ['HS256'] });
    if (typeof payload.sub !== 'string' || typeof payload.email !== 'string') return null;
    return { sub: payload.sub, email: payload.email, name: String(payload.name ?? '') };
  } catch {
    return null;
  }
}
