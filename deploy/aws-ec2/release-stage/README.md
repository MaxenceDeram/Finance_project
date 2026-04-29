# Waren

Waren est un job application tracker personnel, premium et sobre.
L'application permet de creer un compte, confirmer son email, suivre ses candidatures,
centraliser les relances et piloter son pipeline d'entretiens depuis une interface moderne.

## Ce Que Fait L'application

- Authentification securisee avec confirmation email
- Dashboard personnel
- Ajout, edition et suppression de candidatures
- Filtres par statut et recherche par entreprise / poste / localisation
- Suivi des relances a venir
- Preferences email pour les rappels quotidiens
- Base admin et audit logs conservees

## Stack

- Next.js App Router
- TypeScript strict
- Tailwind CSS v4
- Prisma + PostgreSQL
- Argon2id pour les mots de passe
- Sessions serveur avec cookies `httpOnly`
- Nodemailer pour les emails transactionnels
- Zod pour les validations serveur

## Architecture

- `src/app`: pages, layouts, route handlers
- `src/components`: UI partages et shells
- `src/features/auth`: login, register, confirmation email
- `src/features/applications`: CRUD des candidatures, badges, formulaires, table
- `src/features/users`: profil, preferences, mot de passe
- `src/features/jobs`: job quotidien de rappel par email
- `src/server/security`: sessions, rate limit, audit, crypto
- `src/server/email`: transport SMTP et templates
- `prisma`: schema, migrations, seed

## Variables D'environnement

Copiez le fichier exemple:

```bash
cp .env.example .env
```

Variables essentielles:

```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST:5432/DB_NAME?schema=public"
APP_URL="http://localhost:3000"
APP_NAME="Waren"
NODE_ENV="development"
SESSION_COOKIE_SECURE="false"
SESSION_SECRET="un-secret-long-de-32-caracteres-minimum"
EMAIL_TOKEN_PEPPER="un-secret-long-distinct"
CRON_SECRET="un-secret-long-pour-les-jobs"
SMTP_HOST=""
SMTP_PORT="587"
SMTP_SECURE="false"
SMTP_USER=""
SMTP_PASSWORD=""
SMTP_FROM="Waren <no-reply@example.com>"
```

Si `SMTP_HOST` est vide, les emails sont ecrits dans `.dev-emails.log` en local.

## Installation

```bash
npm install
cp .env.example .env
docker compose up -d
npm run prisma:generate
npm run prisma:deploy
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

Puis ouvrir [http://localhost:3000](http://localhost:3000).

## Parcours A Tester

1. Creer un compte ou utiliser le compte demo
2. Confirmer l'email via le lien recu ou le fichier `.dev-emails.log`
3. Se connecter
4. Ajouter une candidature
5. Filtrer la liste par statut
6. Modifier une candidature
7. Supprimer une candidature
8. Verifier le dashboard et les relances a venir

## Emails

### Confirmation email

Lors de l'inscription:

- un utilisateur est cree en base
- un token de confirmation est genere
- seul son hash est stocke
- un email avec lien de validation est envoye
- le compte reste non confirme tant que le lien n'est pas utilise

### Rappel quotidien

Le job quotidien envoie un recap des candidatures si l'utilisateur a active l'option:

- total de candidatures
- taux de reponse
- prochaines relances
- candidatures recentes

Execution locale:

```bash
npm run job:daily-summary
```

Execution HTTP:

```bash
curl -X POST http://localhost:3000/api/jobs/daily-summary \
  -H "Authorization: Bearer $CRON_SECRET"
```

## Securite

Le socle inclut:

- Argon2id pour les mots de passe
- sessions stockees en base
- cookies `httpOnly`
- confirmation email obligatoire
- rate limiting sur auth et actions sensibles
- controle d'origine sur les server actions
- audit logs
- validations Zod cote serveur
- autorisations par `userId`

Le detail est documente dans `SECURITY.md`.

## Deploiement VM

Les fichiers de deploiement AWS deja presents dans `deploy/aws-ec2` restent utilisables.
Le flux conseille:

```bash
npm ci
npm run prisma:deploy
npm run build
sudo systemctl restart waren
```

## Scripts Utiles

```bash
npm run dev
npm run build
npm run lint
npm run typecheck
npm run prisma:generate
npm run prisma:deploy
npm run db:seed
npm run job:daily-summary
```
