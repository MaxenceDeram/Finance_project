# Deploiement Waren Sur Azure VM

Ta capture montre une VM Linux `VMtest` avec l'IP publique `20.74.82.173`. La configuration ci-dessous
sert a exposer Waren sur `http://20.74.82.173` via Nginx, avec Next.js qui tourne localement sur le
port `3000`.

## 1. Azure

Dans Azure Portal:

- demarrer la VM si elle est arretee;
- ouvrir les ports entrants `22`, `80` et plus tard `443` dans le Network Security Group;
- eviter d'ouvrir `3000` publiquement si Nginx proxy sur `80`.

## 2. Installer Le Socle VM

Sur la VM:

```bash
sudo apt update
sudo apt install -y nodejs npm nginx git
sudo npm install -g npm@latest
sudo useradd --system --create-home --shell /usr/sbin/nologin waren
sudo mkdir -p /var/www/waren
sudo chown -R waren:waren /var/www/waren
```

Installer Node.js LTS via NodeSource est recommande si la version Ubuntu est trop ancienne.

## 3. Copier Le Projet

Depuis ta machine:

```bash
scp -r . azureuser@20.74.82.173:/tmp/waren
ssh azureuser@20.74.82.173
sudo rsync -a --delete /tmp/waren/ /var/www/waren/
sudo chown -R waren:waren /var/www/waren
```

Adapte `azureuser` avec ton utilisateur SSH reel.

## 4. Variables D'environnement

Creer `/var/www/waren/.env.production`:

```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST:5432/DB_NAME?schema=public"
APP_URL="http://20.74.82.173"
APP_NAME="Waren"
NODE_ENV="production"
SESSION_COOKIE_NAME="sim_session"
SESSION_SECRET="change-me-with-at-least-32-random-characters"
EMAIL_TOKEN_PEPPER="change-me-with-at-least-32-random-characters"
CRON_SECRET="change-me-with-at-least-32-random-characters"
PASSWORD_MIN_LENGTH="12"
SIMULATED_FEE_BPS="5"
MARKET_DATA_PROVIDER="mock"
SMTP_HOST=""
SMTP_PORT="587"
SMTP_SECURE="false"
SMTP_USER=""
SMTP_PASSWORD=""
SMTP_FROM="Waren <no-reply@example.com>"
DAILY_SUMMARY_DEFAULT_TIMEZONE="Europe/Paris"
```

Quand tu ajoutes un domaine, remplace `APP_URL` par `https://ton-domaine.fr`.

## 5. Build Et Migrations

```bash
cd /var/www/waren
sudo -u waren npm ci
sudo -u waren npm run prisma:migrate
sudo -u waren npm run build
```

## 6. Service Systemd

```bash
sudo cp /var/www/waren/deploy/azure-vm/waren.service /etc/systemd/system/waren.service
sudo systemctl daemon-reload
sudo systemctl enable --now waren
sudo systemctl status waren
```

Logs:

```bash
journalctl -u waren -f
```

## 7. Nginx

```bash
sudo cp /var/www/waren/deploy/azure-vm/nginx-waren.conf /etc/nginx/sites-available/waren
sudo ln -s /etc/nginx/sites-available/waren /etc/nginx/sites-enabled/waren
sudo nginx -t
sudo systemctl reload nginx
```

Waren doit ensuite repondre sur:

```txt
http://20.74.82.173
```

## 8. HTTPS Plus Tard

Avec un nom de domaine pointe vers l'IP de la VM:

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d ton-domaine.fr
```

Puis mettre `APP_URL="https://ton-domaine.fr"` et redemarrer:

```bash
sudo systemctl restart waren
```
