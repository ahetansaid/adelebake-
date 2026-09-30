/**
 * Crée un compte administrateur ou réinitialise son mot de passe.
 *   npm run admin:create -- email@exemple.com "Nom Prénom"
 * Le mot de passe est demandé au clavier (jamais passé en argument, pour ne pas finir dans l'historique du shell).
 */
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { createInterface } from 'node:readline/promises';

const [, , emailArg, ...nameParts] = process.argv;
const email = emailArg?.trim().toLowerCase();
if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
  console.error('Usage : npm run admin:create -- email@exemple.com "Nom Prénom"');
  process.exit(1);
}

const rl = createInterface({ input: process.stdin, output: process.stdout });
const password = (await rl.question('Mot de passe (12 caractères minimum) : ')).trim();
rl.close();
if (password.length < 12) {
  console.error('Mot de passe trop court.');
  process.exit(1);
}

const db = new PrismaClient();
const passwordHash = await bcrypt.hash(password, 12);
const user = await db.adminUser.upsert({
  where: { email },
  create: { email, name: nameParts.join(' ') || 'Administrateur', passwordHash },
  update: { passwordHash, ...(nameParts.length ? { name: nameParts.join(' ') } : {}) },
});
console.log(`✓ Compte prêt : ${user.email}`);
await db.$disconnect();
