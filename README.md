# Adélé Baké — site et espace de gestion

Site de la guesthouse **Adélé Baké** (Cotonou, Bénin) : présentation des chambres, restaurant, salle de conférence,
excursions, demandes de réservation et de devis — avec un **espace de gestion** (`/admin`) pour l'équipe.

Design : proposition 1 « Signature » (cuivre + indigo), maquette d'origine dans [`docs/maquette-v1/`](docs/maquette-v1/).

## Stack

| Élément | Choix |
|---|---|
| Framework | Next.js 15 (App Router, Server Actions), React 19, TypeScript strict |
| Base de données | PostgreSQL 17 + Prisma 6 |
| Authentification admin | Session JWT signée (`jose`, cookie httpOnly) + mots de passe `bcryptjs` |
| E-mails | `nodemailer` (SMTP du domaine) |
| Photos | Stockées en base après redimensionnement WebP (`sharp`), servies par `/media/[id]` |
| Validation | `zod` |

## Démarrer en local

Prérequis : Node 22, Docker Desktop.

```bash
cp .env.example .env            # puis renseigner AUTH_SECRET, ADMIN_EMAIL, ADMIN_PASSWORD
npm install
npm run db:up                   # PostgreSQL local sur 127.0.0.1:5433
npx prisma migrate dev          # crée les tables
npm run db:seed                 # chambres, carte, excursions, avis d'exemple, compte admin
npm run dev                     # http://localhost:3000 — espace de gestion : /admin
```

Autres commandes : `npm run typecheck`, `npm run lint`, `npm run build`, `npm run db:studio`,
`npm run admin:create -- email@domaine.com "Nom"` (crée un compte ou réinitialise son mot de passe ; saisie masquée au clavier).

## Pages

**Public** : `/` · `/chambres` · `/chambres/[slug]` · `/reservation` · `/salle-de-conference` · `/la-table` ·
`/decouvrir` · `/contact` · `/mentions-legales` · `/confidentialite` · `/sitemap.xml` · `/robots.txt`

**Espace de gestion** (`/admin`) : tableau de bord, réservations, devis salle, messages, chambres (photos incluses),
carte du restaurant, excursions, avis clients, coordonnées & infos du site, comptes.

## Sécurité

- `/admin` protégé deux fois : middleware (JWT) **et** vérification en base à chaque page/action (`requireAdmin`).
- Connexion : 5 tentatives / 15 min par IP, temps de réponse identique que le compte existe ou non.
- Formulaires publics : validation `zod`, champ piège anti-robots, 5 envois / 10 min par IP (compteur en base, IP hachée).
- Photos : type réel vérifié par `sharp` (un faux `.jpg` est rejeté), 10 Mo max, ré-encodées ; jamais servies depuis le disque.
- En-têtes : `nosniff`, `X-Frame-Options: DENY`, HSTS, `Referrer-Policy` ; `/admin` en `noindex` + `no-store`.
- `robots.txt` bloque toute indexation tant que `ALLOW_INDEXING=true` n'est pas défini (à activer au lancement officiel).
- Aucun secret dans le code : tout passe par `.env` (non versionné).

## Mise en production — à faire

1. **Base** : PostgreSQL managé (Neon, comme le portfolio) ou sur le VPS ; `npm run db:deploy` puis `npm run db:seed`.
2. **Variables** : `DATABASE_URL`, `SITE_URL` (URL définitive), `AUTH_SECRET` (nouveau, 48 caractères aléatoires),
   `SMTP_*` + `MAIL_FROM` sur le domaine `adelebake.com` avec SPF/DKIM/DMARC, puis `ALLOW_INDEXING=true` le jour J.
3. **Hébergement** : Vercel ou VPS1 (Node 22 + reverse proxy nginx). Sur Vercel, une requête est limitée à 4,5 Mo :
   envoyer des photos de moins de 4 Mo depuis le back-office.
4. **Avant le lancement**, remplacer les contenus indicatifs : photos réelles, tarifs, capacité de la salle, horaires,
   numéro WhatsApp, mentions légales (RCCM, IFU, hébergeur) et **supprimer les 3 avis d'exemple**.

## Contenus à valider avec l'établissement

Tarifs et noms des chambres, carte et prix du restaurant, prix des excursions, capacité de la salle (40 pers. par défaut),
horaires d'accueil, numéro WhatsApp `+229 01 62 25 21 94`, adresse exacte, logo vectoriel HD.
Tout se modifie depuis l'espace de gestion, sans intervention technique.
