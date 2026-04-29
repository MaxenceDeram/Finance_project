# Securite Waren

Waren est un espace personnel de suivi de candidatures. Le socle de securite reste pense
comme une vraie application privee, pas comme une simple demo.

## Mesures Integrees

- Mots de passe hashes avec Argon2id
- Politique minimale de mot de passe configurable via `PASSWORD_MIN_LENGTH`
- Sessions stockees en base avec token aleatoire et hash cote serveur
- Cookie de session `httpOnly`, `sameSite=lax`, `secure` en production
- Confirmation email obligatoire avant acces complet
- Tokens de confirmation limites dans le temps et invalides apres usage
- Rate limiting sur inscription, connexion, renvoi de confirmation et actions sensibles
- Verification d'origine sur les server actions
- Validation serveur systematique avec Zod
- Controle d'autorisation par `userId` sur candidatures et preferences
- Audit logs sur auth, actions critiques et envois email
- Messages d'erreur sobres cote client
- Secrets uniquement via variables d'environnement

## Points A Renforcer En Production

- Remplacer le rate limiting memoire par Redis ou equivalent
- Activer HTTPS strict et HSTS via reverse proxy / CDN
- Utiliser un SMTP transactionnel fiable avec SPF / DKIM / DMARC
- Monitorer les logs d'audit et les echecs de connexion
- Mettre en place rotation des secrets et sauvegardes PostgreSQL
- Ajouter reset password dedie et 2FA si necessaire

## Variables Critiques

- `SESSION_SECRET`
- `EMAIL_TOKEN_PEPPER`
- `CRON_SECRET`
- `DATABASE_URL`
- `APP_URL`
