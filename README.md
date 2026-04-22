# Paper Invest Premium

Plateforme personnelle de paper trading et simulation d'investissement avec argent fictif.
L'application permet de creer un compte, confirmer son email, gerer plusieurs portefeuilles,
executer des achats/ventes simules, suivre les positions, generer des snapshots et envoyer une
synthese quotidienne par email.

Ce projet n'execute aucun ordre reel et ne fournit aucun conseil financier.

## Stack

- Next.js App Router, React, TypeScript strict
- Tailwind CSS v4 avec composants UI style shadcn
- PostgreSQL
- Prisma ORM
- Argon2id pour les mots de passe
- Sessions serveur avec cookies `httpOnly`
- Nodemailer pour les emails transactionnels
- Recharts pour les dashboards
- Zod pour les validations serveur

## Arborescence

```txt
.
├── prisma
│   ├── schema.prisma
│   └── seed.ts
├── scripts
│   └── run-daily-summary.ts
├── src
│   ├── app
│   │   ├── (app)
│   │   │   ├── assets
│   │   │   ├── dashboard
│   │   │   ├── orders
│   │   │   ├── portfolios
│   │   │   ├── profile
│   │   │   └── settings
│   │   ├── (auth)
│   │   │   ├── auth
│   │   │   ├── login
│   │   │   └── register
│   │   └── api/jobs/daily-summary
│   ├── components
│   │   ├── charts
│   │   ├── dashboard
│   │   ├── forms
│   │   ├── layout
│   │   └── ui
│   ├── config
│   ├── features
│   │   ├── analytics
│   │   ├── assets
│   │   ├── auth
│   │   ├── jobs
│   │   ├── orders
│   │   ├── portfolios
│   │   └── users
│   ├── lib
│   ├── server
│   │   ├── db
│   │   ├── email
│   │   ├── market-data
│   │   └── security
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
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/paper_invest?schema=public"
APP_URL="http://localhost:3000"
SESSION_SECRET="un-secret-long-et-aleatoire-de-32-caracteres-minimum"
EMAIL_TOKEN_PEPPER="un-autre-secret-long-et-aleatoire"
CRON_SECRET="secret-long-pour-le-cron"
```

PostgreSQL local optionnel avec Docker:

```bash
docker compose up -d
```

## Base de donnees

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

## Lancement local

```bash
npm run dev
```

Puis ouvrir `http://localhost:3000`.

## Emails

Si `SMTP_HOST` est vide, les emails sont logues dans la console serveur. Pour un vrai envoi:

```env
SMTP_HOST="smtp.example.com"
SMTP_PORT="587"
SMTP_SECURE="false"
SMTP_USER="user"
SMTP_PASSWORD="password"
SMTP_FROM="Paper Invest Premium <no-reply@example.com>"
```

L'inscription cree un utilisateur non confirme, genere un token aleatoire, stocke uniquement son
hash HMAC, puis envoie un lien `/auth/confirm-email?token=...`. Le token expire apres 24h et est
marque comme utilise lors de la confirmation.

## Jobs quotidiens

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
- genere le recapitulatif,
- envoie l'email aux utilisateurs ayant active l'option,
- logue le resultat dans `DailyEmailLog`.

## Architecture

La logique metier est separee des pages:

- `features/auth`: inscription, connexion, confirmation email, server actions.
- `features/portfolios`: creation et controle proprietaire.
- `features/orders`: moteur d'ordre marche simule, positions, ledger cash.
- `features/analytics`: valorisation, P&L, drawdown, snapshots.
- `features/jobs`: orchestration du job quotidien.
- `server/security`: sessions, tokens, mots de passe, rate limiting, audit.
- `server/market-data`: interface provider, mock provider et price service.
- `server/email`: transport SMTP/console et templates HTML.

## Securite

Voir `SECURITY.md` pour le detail. Le socle inclut Argon2id, tokens hashes, cookies stricts,
validation Zod, rate limiting, headers de securite, controle d'origine, audit logs et autorisations
deny-by-default par utilisateur.

## Scripts utiles

```bash
npm run dev
npm run build
npm run lint
npm run typecheck
npm run format
npm run prisma:studio
```

## Evolutions preparees

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
