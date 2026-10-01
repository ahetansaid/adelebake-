# Adélé Baké — site et espace de gestion

Site de la guesthouse **Adélé Baké** (Cotonou, Bénin) : présentation des chambres, restaurant, salle de conférence,
excursions, demandes de réservation et de devis — avec un **espace de gestion** (`/admin`) pour l'équipe.

Design : proposition 1 « Signature » (cuivre + indigo), les trois maquettes d'origine sont archivées sur la branche **`maquettes`** (non déployable).

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

## Référencement (SEO)

Dans le code : titres/descriptions ciblés par page, URL canonique partout, image d'aperçu (`/opengraph-image`),
sitemap, fil d'Ariane, FAQ, et données structurées JSON-LD (Hotel, HotelRoom + prix, Restaurant + menu,
salle de réunion, excursions, FAQPage). Vérification : [Rich Results Test](https://search.google.com/test/rich-results).

Au lancement : `ALLOW_INDEXING=true`, `SITE_URL` = domaine définitif, codes `GOOGLE_SITE_VERIFICATION` /
`BING_SITE_VERIFICATION`, puis soumettre `https://<domaine>/sitemap.xml` dans Search Console et Bing Webmaster Tools.
Renseigner la position GPS exacte dans *Coordonnées & infos* (espace de gestion).

Hors site (le plus décisif en local) : fiche **Google Business Profile** (catégorie « Maison d'hôtes »,
mêmes nom/adresse/téléphone que le site, photos, lien vers le site, avis clients), fiches Tripadvisor
(fusionner les deux fiches existantes), Booking.com, Facebook/Instagram pointant vers le site.

## Production (Vercel + Neon)

- Projet Vercel **`adelebake`**, fonctions en `fra1` ; base **Neon** `adelebake-db` (Francfort, `eu-central-1`),
  connectée via la marketplace Vercel (`DATABASE_URL` poolée + `DATABASE_URL_UNPOOLED` pour les migrations).
- En ligne sur https://adelebake.vercel.app (non indexé tant que `ALLOW_INDEXING` n'est pas activé).
- Déployer : `vercel deploy --prod` · migrations : `DATABASE_URL_UNPOOLED=… npx prisma migrate deploy`.
- `www.adelebake.com` redirige (308) vers `adelebake.com` (`vercel.json`).
- Photos : limite Vercel de 4,5 Mo par requête → envoyer des photos de moins de 4 Mo depuis le back-office.

### Bascule du domaine (DNS chez Wix — ne pas changer les serveurs de noms)

| Nom | Type | Valeur actuelle (Wix) | Nouvelle valeur (Vercel) |
|---|---|---|---|
| `@` | A | 185.230.63.107 / .171 / .186 | **216.198.79.1** et **64.29.17.1** |
| `www` | CNAME | cdn1.wixdns.net | **46066f163fdc86fa.vercel-dns-017.com** |

1. La veille : TTL de ces enregistrements au minimum proposé par Wix.
2. Jour J : remplacer les valeurs ci-dessus, puis `vercel domains verify adelebake.com` (certificat émis automatiquement).
3. Passer `SITE_URL=https://adelebake.com`, `ALLOW_INDEXING=true`, redéployer ; soumettre le sitemap à Search Console.
4. Contrôle : `curl -I https://adelebake.com` et `https://www.adelebake.com` (redirection 308).

**Messagerie** : le domaine n'a aucun MX — `contact@adelebake.com` ne reçoit rien tant qu'une messagerie n'est pas créée
(Google Workspace, Zoho…) avec MX/SPF/DKIM/DMARC ; renseigner ensuite `SMTP_*` et `MAIL_FROM` sur Vercel.

## Contenus à valider avec l'établissement

Tarifs et noms des chambres, carte et prix du restaurant, prix des excursions, capacité de la salle (40 pers. par défaut),
horaires d'accueil, numéro WhatsApp `+229 01 62 25 21 94`, adresse exacte, logo vectoriel HD.
Tout se modifie depuis l'espace de gestion, sans intervention technique.
