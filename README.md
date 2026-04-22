# Waren

Waren est une plateforme personnelle premium de simulation d'investissement avec argent fictif.
Elle permet de creer un compte, confirmer son email, gerer plusieurs portefeuilles fictifs,
executer des achats/ventes simules, suivre les positions, generer des snapshots et recevoir une
synthese quotidienne par email.

Waren n'execute aucun ordre reel, ne conserve aucun fonds et ne fournit aucun conseil financier.

## Stack

- Next.js App Router, React, TypeScript strict
- Tailwind CSS v4 avec composants UI style shadcn
- PostgreSQL
- Prisma ORM
- Argon2id pour les mots de passe
- Sessions serveur avec cookies `httpOnly`
- Nodemailer pour les emails transactionnels
- Recharts pour les tableaux de bord financiers
- Zod pour les validations serveur

## Architecture

La logique metier est separee des pages:

- `features/auth`: inscription, connexion, confirmation email, server actions.
- `features/portfolios`: creation, edition, suppression et controle proprietaire.
- `features/orders`: moteur d'ordre marche simule, positions, ledger cash.
- `features/analytics`: valorisation, P&L, drawdown, snapshots.
- `features/jobs`: orchestration du job quotidien.
- `features/admin`: roles, console admin, audit logs, email logs et jobs manuels.
- `server/security`: sessions, tokens, mots de passe, rate limiting, audit.
- `server/market-data`: interface provider, mock provider et price service.
- `server/email`: transport SMTP/dev log et templates HTML Waren.

## Structure

```txt
.
├── docs/BRAND.md
├── prisma
│   ├── schema.prisma
│   └── seed.ts
├── scripts
│   └── run-daily-summary.ts
├── src
│   ├── app
│   │   ├── (app)
│   │   ├── (auth)
│   │   └── api/jobs/daily-summary
│   ├── components
│   │   ├── charts
│   │   ├── dashboard
│   │   ├── forms
│   │   ├── layout
│   │   └── ui
│   ├── config
│   ├── features
│   ├── lib
│   ├── server
│   └── validation
├── SECURITY.md
├── .env.example
└── package.json
```

## Installation

```bash
npm install
cp .env.example .env
```

Renseigner au minimum:

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/waren?schema=public"
APP_URL="http://localhost:3000"
APP_NAME="Waren"
SESSION_SECRET="un-secret-long-et-aleatoire-de-32-caracteres-minimum"
EMAIL_TOKEN_PEPPER="un-autre-secret-long-et-aleatoire"
CRON_SECRET="secret-long-pour-le-cron"
```

PostgreSQL local optionnel avec Docker:

```bash
docker compose up -d
```

## Base De Donnees

```bash
npm run prisma:generate
npm run prisma:migrate
npm run db:seed
```

Compte seed:

```txt
demo@example.com
DemoPassword123!
```

Le compte seed est confirme et vide, comme un nouveau compte.

## Lancement Local

```bash
npm run dev
```

Puis ouvrir `http://localhost:3000`.

## Emails

Si `SMTP_HOST` est vide, les emails sont journalises en developpement dans `.dev-emails.log`.
Pour un vrai envoi:

```env
SMTP_HOST="smtp.example.com"
SMTP_PORT="587"
SMTP_SECURE="false"
SMTP_USER="user"
SMTP_PASSWORD="password"
SMTP_FROM="Waren <no-reply@example.com>"
```

L'inscription cree un utilisateur non confirme, genere un token aleatoire, stocke uniquement son
hash HMAC, puis envoie un lien `/auth/confirm-email?token=...`. Le token expire apres 24h et est
marque comme utilise lors de la confirmation.

## Jobs Quotidiens

Execution locale:

```bash
npm run job:daily-summary
```

Execution via HTTP cron:

```bash
curl -X POST http://localhost:3000/api/jobs/daily-summary \
  -H "Authorization: Bearer $CRON_SECRET"
```

Le job:

- recalcule les valorisations,
- cree ou met a jour le snapshot journalier,
- genere le recapitulatif Waren,
- envoie l'email aux utilisateurs ayant active l'option,
- logue le resultat dans `DailyEmailLog`.

## Design Waren

La direction artistique Waren est documentee dans `docs/BRAND.md`.

Resume:

- palette noir, blanc, gris clair, vert premium `#0f7a55` et rouge discret `#b42318`;
- radius court de `6px`, bordures fines, ombres tres legeres;
- typographie Inter, hierarchie forte, aucun effet decoratif lourd;
- cartes KPI sobres, tables financieres lisibles, graphiques minimalistes;
- ton clair, credible, personnel et premium.

## Securite

Voir `SECURITY.md` pour le detail. Le socle inclut Argon2id, tokens hashes, cookies stricts,
validation Zod, rate limiting, headers de securite, controle d'origine, audit logs et autorisations
deny-by-default par utilisateur.

Les donnees admin sont reservees aux roles `ADMIN` et `OWNER`. Le role `OWNER` est le seul a pouvoir
promouvoir des administrateurs.

## Scripts Utiles

```bash
npm run dev
npm run build
npm run lint
npm run typecheck
npm run format
npm run prisma:studio
```

## Evolutions Preparees

- Reset password securise
- 2FA
- Social login
- Ordres limite, stop, take profit, trailing stop
- DCA automatique et rebalancing
- Dividendes
- Multi-devises avance
- Benchmark avance
- Backtesting
- Journal d'investissement
- Alertes et notifications in-app
- Exports CSV/PDF
- API personnelle privee
- Application mobile
