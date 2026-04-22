# Waren Brand System

Waren doit donner l'impression d'un produit fintech premium, calme, lisible et personnel. La marque
est inspiree des codes des apps d'investissement modernes sans copier une interface existante.

## Palette

- Texte principal: `#f5f5f0`
- Fond global: `#090a09`
- Surface carte: `#101210`
- Surface secondaire: `#171917`
- Bordure: `#252822`
- Texte secondaire: `#9b9d96`
- Accent positif: `#32d46b`
- Accent positif doux: `#122418`
- Negatif: `#ff5a61`
- Negatif doux: `#2a1417`
- Warning: `#d6a732`

Regle: ne pas ajouter de palette decorative large. Les graphiques utilisent prioritairement noir,
gris et vert Waren.

## Typographie

- Police: Inter.
- Titres de page: `text-4xl font-semibold tracking-normal`.
- Titres de cartes: `text-base font-semibold`.
- Labels UI: `text-sm font-semibold`.
- Donnees financieres: utiliser `tabular-nums` quand les chiffres doivent se comparer.
- Letter spacing: rester en `tracking-normal`, y compris pour les labels en majuscules.

## Spacing

- Page app: `px-4 sm:px-6 lg:px-10`, `py-7 lg:py-10`.
- Sections dashboard: `space-y-6`.
- Grilles: `gap-4` pour KPI, `gap-6` pour blocs analytiques.
- Formulaires: `gap-5` ou `gap-6`.
- Les interfaces doivent respirer, mais rester denses pour un usage financier repete.

## Cards

- Radius: `rounded-md` soit environ 6px.
- Bordure fine `border-border/80`.
- Ombre tres legere via `--shadow-soft`.
- Pas de cartes imbriquees decoratives. Une carte sert a encadrer un vrai bloc fonctionnel.

## Boutons

- Bouton principal: blanc cassé ou vert Waren selon contexte, texte noir, hauteur 44px.
- Bouton secondaire: surface sombre neutre.
- Outline: fond transparent, bordure fine, hover blanc tres subtil.
- Destructive: rouge discret uniquement pour actions sensibles.

## Inputs

- Fond sombre, bordure grise, hauteur 44px.
- Focus vert Waren avec anneau doux.
- Placeholders calmes, jamais trop contrastes.

## Etats Financiers

- Positif: `text-[color:var(--positive)]`, badge vert doux.
- Negatif: `text-[color:var(--negative)]`, badge rouge doux.
- Neutre: gris et noir, pas de bleu dominant.

## Tables

- Headers en majuscules mais sans letter spacing.
- Lignes hautes, bordures fines, hover tres subtil.
- Chiffres alignes visuellement avec `tabular-nums`.
- Badges discrets pour statuts, roles et sens d'ordre.

## Ton De Marque

Waren parle comme un outil financier personnel serieux: sobre, precis, rassurant. Eviter le ton
crypto agressif, scolaire ou trop marketing. Toujours rappeler que les ordres sont simules et que
la plateforme ne fournit pas de conseil financier.
