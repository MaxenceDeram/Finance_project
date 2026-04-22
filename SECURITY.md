# Securite

Cette application est une plateforme de simulation d'investissement avec argent fictif. Elle ne
doit jamais etre presentee comme un courtier, un conseiller financier ou un outil d'execution
d'ordres reels.

## Mesures integrees

- Mots de passe hashes avec Argon2id.
- Politique minimale de mot de passe configurable par `PASSWORD_MIN_LENGTH`.
- Sessions stockees en base via token aleatoire, token hashe cote serveur, cookie `httpOnly`,
  `sameSite=lax`, `secure` en production.
- Confirmation email obligatoire avant acces complet.
- Tokens de confirmation aleatoires, hashes avec HMAC, limites dans le temps et marques comme
  utilises.
- Rate limiting memoire sur inscription, connexion, renvoi de confirmation et ordres.
- Validation serveur systematique avec Zod.
- Controle d'autorisation par `userId` sur portefeuilles, ordres, positions, snapshots et
  preferences.
- ORM Prisma utilise sans SQL concatene.
- Headers de securite configures dans `next.config.ts`.
- Verification d'origine sur les server actions sensibles.
- Logs d'audit pour inscription, connexion, confirmation, portefeuilles, ordres et jobs email.
- Messages d'erreur sobres cote client.
- Secrets exclusivement via variables d'environnement.

## Points a renforcer en production

- Remplacer le rate limiting memoire par Redis, Upstash ou service equivalent.
- Activer HTTPS strict et ajouter HSTS au niveau reverse proxy/CDN.
- Utiliser un fournisseur SMTP transactionnel fiable avec DKIM/SPF/DMARC.
- Surveiller les logs d'audit et les echecs de connexion.
- Mettre en place rotation des secrets et sauvegardes PostgreSQL.
- Ajouter reset password avec tokens separes et 2FA.
- Ajouter tests de securite automatises sur les autorisations.

## Variables critiques

- `SESSION_SECRET`: secret aleatoire long, minimum 32 caracteres.
- `EMAIL_TOKEN_PEPPER`: secret HMAC distinct pour les tokens email.
- `CRON_SECRET`: secret utilise par la route de job quotidien.
- `DATABASE_URL`: URL PostgreSQL.
- `APP_URL`: URL publique exacte utilisee dans les emails.
