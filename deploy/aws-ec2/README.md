# Deploiement Waren Sur AWS EC2

Chemin recommande pour demarrer vite: une instance **EC2 Ubuntu**, Nginx public sur le port `80`, et
Waren en local sur le port `3000` via systemd.

Sources AWS utiles:

- Security groups EC2: https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/ec2-security-groups.html
- Connexion SSH / EC2 Instance Connect: https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/connect-to-linux-instance.html

## 1. Creer L'instance

Dans AWS Console:

- service: `EC2`;
- AMI: `Ubuntu Server 24.04 LTS` ou Ubuntu LTS recente;
- type: `t3.small` conseille pour builder Next.js avec plus de marge. `t3.micro` peut fonctionner,
  mais ajoute du swap;
- stockage: 16 a 30 Go;
- key pair: creer ou selectionner une cle SSH;
- security group inbound:
  - `SSH` port `22` depuis ton IP uniquement;
  - `HTTP` port `80` depuis `0.0.0.0/0`;
  - `HTTPS` port `443` depuis `0.0.0.0/0` quand tu ajouteras un domaine/SSL;
  - ne pas exposer `3000` publiquement.

Garde l'IP publique de l'instance. Si tu veux une IP stable, associe une Elastic IP.

## 2. Connexion SSH

Depuis ton Mac:

```bash
chmod 400 ~/Downloads/ta-cle.pem
ssh -i ~/Downloads/ta-cle.pem ubuntu@51.20.71.245
```

Tu peux aussi utiliser EC2 Instance Connect depuis la console AWS.

## 3. Installer Le Socle Serveur

Sur l'EC2:

```bash
sudo apt update
sudo apt install -y ca-certificates curl gnupg git nginx
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt install -y nodejs
node -v
npm -v
```

Si l'instance n'a que 1 Go de RAM, ajoute du swap avant le build:

```bash
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
```

Puis cree l'utilisateur applicatif:

```bash
sudo useradd --system --create-home --shell /usr/sbin/nologin waren
sudo mkdir -p /var/www/waren
sudo chown -R waren:waren /var/www/waren
```

## 4. Copier Le Projet

Depuis ton Mac, a la racine du projet:

```bash
rsync -az --delete \
  --exclude node_modules \
  --exclude .next \
  -e "ssh -i ~/Downloads/ta-cle.pem" \
  ./ ubuntu@51.20.71.245:/tmp/waren/
```

Puis sur l'EC2:

```bash
sudo rsync -a --delete /tmp/waren/ /var/www/waren/
sudo chown -R waren:waren /var/www/waren
```

## 5. Variables D'environnement

Creer `/var/www/waren/.env`:

```bash
sudo nano /var/www/waren/.env
sudo chown waren:waren /var/www/waren/.env
sudo chmod 600 /var/www/waren/.env
```

Exemple:

```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST:5432/DB_NAME?schema=public"
APP_URL="http://51.20.71.245"
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

Quand tu branches un domaine, remplace `APP_URL` par `https://ton-domaine.fr`.

## 6. Installer, Migrer, Builder

Sur l'EC2:

```bash
cd /var/www/waren
sudo -u waren npm ci
sudo -u waren npm run prisma:deploy
sudo -u waren npm run build
```

## 7. Service Systemd

```bash
sudo cp /var/www/waren/deploy/aws-ec2/waren.service /etc/systemd/system/waren.service
sudo systemctl daemon-reload
sudo systemctl enable --now waren
sudo systemctl status waren
```

Logs:

```bash
journalctl -u waren -f
```

## 8. Nginx

```bash
sudo cp /var/www/waren/deploy/aws-ec2/nginx-waren.conf /etc/nginx/sites-available/waren
sudo ln -sf /etc/nginx/sites-available/waren /etc/nginx/sites-enabled/waren
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl reload nginx
```

Ouvre ensuite:

```txt
http://51.20.71.245
```

## 9. HTTPS Plus Tard

Avec un nom de domaine pointe vers l'IP publique ou Elastic IP:

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d ton-domaine.fr
```

Puis mettre:

```env
APP_URL="https://ton-domaine.fr"
```

Et redemarrer:

```bash
sudo systemctl restart waren
```

## 10. Mise A Jour Apres Modification

Depuis ton Mac, relancer le `rsync`, puis sur l'EC2:

```bash
cd /var/www/waren
sudo -u waren npm ci
sudo -u waren npm run build
sudo systemctl restart waren
```
