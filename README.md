# Waren

Waren est une plateforme personnelle premium de simulation d'investissement avec argent fictif.
Elle permet de créer un compte, confirmer son email, gérer plusieurs portefeuilles fictifs,
exécuter des achats/ventes simulés, suivre les positions, explorer des actifs via providers
financiers, générer des snapshots et recevoir une synthèse quotidienne par email.

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
- Alpha Vantage et CoinGecko via couche `MarketDataProvider` composite

## Architecture

La logique metier est separee des pages:

- `features/auth`: inscription, connexion, confirmation email, server actions.
- `features/portfolios`: creation, edition, suppression et controle proprietaire.
- `features/orders`: moteur d'ordre marche simule, positions, ledger cash.
- `features/analytics`: valorisation, P&L, drawdown, snapshots.
- `features/jobs`: orchestration du job quotidien.
- `features/admin`: roles, console admin, audit logs, email logs et jobs manuels.
- `server/security`: sessions, tokens, mots de passe, rate limiting, audit.
- `server/market-data`: providers réels, cache DB, quotes, historiques, profils et news.
- `server/email`: transport SMTP/dev log et templates HTML Waren.

## Structure

```txt
.
├── docs/BRAND.md
├── deploy/aws-ec2
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
DATABASE_URL="postgresql://USER:PASSWORD@HOST:5432/DB_NAME?schema=public"
APP_URL="http://localhost:3000"
APP_NAME="Waren"
NODE_ENV="development"
SESSION_COOKIE_SECURE="false"
SESSION_SECRET="un-secret-long-et-aleatoire-de-32-caracteres-minimum"
EMAIL_TOKEN_PEPPER="un-autre-secret-long-et-aleatoire"
CRON_SECRET="secret-long-pour-le-cron"
MARKET_DATA_PROVIDER="composite"
ALPHA_VANTAGE_API_KEY="votre-cle-alpha-vantage"
COINGECKO_API_KEY=""
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

## Donnees De Marche

Waren utilise une couche `MarketDataProvider` modulaire:

- `composite`: provider recommande. Actions, ETF, indices et news via Alpha Vantage; crypto via CoinGecko; fallback mock isole si une API est absente ou limitee.
- `alpha-vantage`: force Alpha Vantage uniquement.
- `coingecko`: force CoinGecko uniquement pour les cryptos.
- `mock`: mode developpement hors ligne.

Variables utiles:

```env
MARKET_DATA_PROVIDER="composite"
MARKET_DATA_CACHE_TTL_SECONDS="60"
MARKET_DATA_HISTORY_CACHE_TTL_SECONDS="900"
MARKET_NEWS_CACHE_TTL_SECONDS="900"
MARKET_DATA_HTTP_TIMEOUT_MS="9000"
ALPHA_VANTAGE_API_KEY=""
COINGECKO_API_KEY=""
COINGECKO_API_BASE_URL="https://api.coingecko.com/api/v3"
```

Pour une experience vraiment exploitable sur actions/ETF/news, ajoutez une cle
`ALPHA_VANTAGE_API_KEY`. Sans cette cle, Waren conserve CoinGecko pour les cryptos et bascule le
reste en fallback mock clairement isole.

La migration `20260423090000_market_data_live_layer` ajoute:

- metadonnees provider sur `Asset`;
- `MarketDataCache` pour limiter les appels externes;
- `MarketNews` pour persister les actualites.

Les ordres simules utilisent le dernier prix fourni par la couche market data cote serveur, jamais
un prix envoye aveuglement par le client.

## Deploiement AWS EC2

La configuration recommandee pour AWS est dans `deploy/aws-ec2`:

- `waren.service`: service systemd pour lancer Next.js en production;
- `nginx-waren.conf`: reverse proxy Nginx vers le port local `3000`;
- `README.md`: procedure complete EC2, security group, SSH, Node.js, Nginx et HTTPS.

Script utile pour exposer Next.js sur une VM:

```bash
npm run start:prod
```

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

- palette noir premium, blanc cassé, gris subtil, vert `#32d46b` et rouge maîtrisé `#ff5a61`;
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
npm run prisma:deploy
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
