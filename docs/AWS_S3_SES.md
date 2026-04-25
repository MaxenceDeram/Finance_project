# AWS S3 + SES

Ce guide couvre les deux briques ajoutees au projet:

- avatars utilisateur via S3 + URL pre-signee
- emails transactionnels et relances via AWS SES

## 1. S3 pour les avatars

### Bucket

Creer un bucket prive dedie, par exemple:

- `waren-avatars-prod`

L'application upload en `PUT` direct via URL pre-signee.

### Variables d'environnement

```env
AWS_REGION="eu-north-1"
AWS_S3_BUCKET="waren-avatars-prod"
AWS_S3_AVATAR_PREFIX="avatars"
AWS_S3_PUBLIC_BASE_URL="https://waren-avatars-prod.s3.eu-north-1.amazonaws.com"
```

Si vous ne voulez pas exposer une URL publique de bucket, laissez
`AWS_S3_PUBLIC_BASE_URL` vide: l'application generera alors une URL signee de lecture.

### CORS du bucket

Ajouter une configuration CORS compatible avec les uploads depuis le navigateur:

```json
[
  {
    "AllowedHeaders": ["*"],
    "AllowedMethods": ["PUT", "GET", "HEAD"],
    "AllowedOrigins": [
      "http://localhost:3000",
      "http://51.20.71.245"
    ],
    "ExposeHeaders": ["ETag"]
  }
]
```

Quand vous passerez sur un vrai domaine HTTPS, remplacez l'IP par votre domaine.

### IAM / Credentials

En local:

- configurez `aws configure`
- ou exportez `AWS_ACCESS_KEY_ID` et `AWS_SECRET_ACCESS_KEY`

Sur EC2:

- preference forte pour un IAM Role attache a l'instance

Permissions minimales:

- `s3:PutObject`
- `s3:GetObject`
- `s3:DeleteObject`
- `s3:HeadObject`

sur le bucket d'avatars.

## 2. SES pour les emails

### Variables d'environnement

```env
EMAIL_PROVIDER="ses"
SMTP_FROM="Waren <no-reply@votre-domaine.com>"
AWS_REGION="eu-north-1"
AWS_SES_REGION="eu-north-1"
AWS_SES_CONFIGURATION_SET=""
```

`AWS_SES_REGION` peut rester vide si SES utilise la meme region que `AWS_REGION`.

### Pre-requis SES

1. Verifier le domaine ou l'expediteur dans SES
2. Sortir du sandbox SES si vous voulez envoyer a de vraies adresses librement
3. Configurer SPF / DKIM / DMARC pour une delivrabilite propre

### Permissions IAM

Le role ou l'utilisateur AWS doit pouvoir appeler:

- `ses:SendEmail`
- `ses:SendRawEmail` si vous etendez plus tard le systeme

## 3. Mode local simple

Si vous voulez tester rapidement sans vrai provider:

```env
EMAIL_PROVIDER="console"
```

Les emails seront ecrits dans `.dev-emails.log`.

Pour les avatars, en revanche, S3 doit etre configure pour tester le vrai flux
pre-signe.

## 4. Checklist locale

1. `cp .env.example .env`
2. remplir `DATABASE_URL`
3. remplir les secrets de session
4. configurer soit `EMAIL_PROVIDER="console"`, soit SES/SMTP
5. configurer S3 si vous voulez tester l'avatar
6. lancer:

```bash
npm run prisma:generate
npm run dev
```

## 5. Checklist EC2

Dans `/var/www/waren/.env`:

```env
APP_URL="http://51.20.71.245"
NODE_ENV="production"
SESSION_COOKIE_NAME="waren_session"
SESSION_COOKIE_SECURE="false"
EMAIL_PROVIDER="ses"
AWS_REGION="eu-north-1"
AWS_S3_BUCKET="waren-avatars-prod"
AWS_S3_AVATAR_PREFIX="avatars"
AWS_S3_PUBLIC_BASE_URL="https://waren-avatars-prod.s3.eu-north-1.amazonaws.com"
```

Puis:

```bash
cd /var/www/waren
sudo -u waren npm ci
sudo -u waren npm run prisma:deploy
sudo -u waren npm run build
sudo systemctl restart waren
sudo systemctl status waren -l --no-pager
curl -I http://127.0.0.1:3000
sudo nginx -t
sudo systemctl reload nginx
```
