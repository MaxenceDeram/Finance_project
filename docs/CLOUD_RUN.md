# Lancer les checks et le rappel depuis le cloud

## CI

Le workflow `.github/workflows/ci.yml` lance dans GitHub Actions:

- `npm ci`
- `npm run typecheck`
- `npm run lint`
- `npm test`
- `npm run build`

Il suffit de pousser la branche sur GitHub: le Mac peut ensuite etre eteint, les checks
continuent cote GitHub.

## Rappel quotidien

Le workflow `.github/workflows/daily-summary.yml` appelle l'application deployee toutes
les heures. Le job applicatif envoie seulement aux utilisateurs dont l'heure locale
correspond a leur preference `dailyEmailHour`.

Secrets GitHub a creer:

```txt
DAILY_SUMMARY_URL=https://votre-domaine-ou-ip
CRON_SECRET=le-meme-secret-que-dans-la-variable-CRON_SECRET-du-serveur
```

Le workflow peut aussi etre lance manuellement depuis l'onglet Actions de GitHub.

## EC2

Si vous utilisez le timer systemd fourni, `waren-daily-summary.timer` tourne maintenant
toutes les heures. C'est volontaire: le filtrage par fuseau horaire est fait dans
l'application.
