# Kasa

Plateforme de location de logements. Ce dépôt contient deux projets :

- `frontend/` — application Next.js (App Router, TypeScript, Tailwind CSS) ;
- `backend/` — API Express 5 + SQLite fournie, consommée telle quelle.

## Prérequis

- Node.js LTS (18+, testé avec 24)
- npm

## Installation

```bash
cd backend && npm install
cd ../frontend && npm install
```

Copier ensuite le fichier d'exemple d'environnement du frontend :

```bash
cd frontend && cp .env.example .env.local
```

## Démarrage

Les deux services tournent en parallèle, dans deux terminaux.

Backend, sur http://localhost:4000 :

```bash
cd backend && npm start
```

Frontend, sur http://localhost:3000 :

```bash
cd frontend && npm run dev
```

Vérification rapide de l'API : http://localhost:4000/api/properties renvoie la liste des logements en JSON.

## Variables d'environnement

Frontend, dans `frontend/.env.local` (modèle versionné : `frontend/.env.example`) :

| Variable | Valeur locale | Rôle |
| --- | --- | --- |
| `KASA_API_URL` | `http://localhost:4000` | Origine de l'API Express, utilisée côté serveur uniquement |
| `KASA_SITE_URL` | `http://localhost:3000` | Origine du site, utilisée pour les URLs absolues (sitemap, SEO, structured data) |

Backend, optionnelles (modèle versionné : `backend/.env.example`) :

| Variable | Défaut | Rôle |
| --- | --- | --- |
| `PORT` | `4000` | Port d'écoute HTTP |
| `JWT_SECRET` | `change-me-in-prod` | Secret de signature des tokens JWT |
| `KASA_DB_PATH` | `backend/data/kasa.sqlite3` | Chemin du fichier SQLite |
| `KASA_UPLOAD_DIR` | `backend/public/uploads` | Répertoire des images uploadées |

L'API n'expose pas de middleware CORS : les appels doivent être faits côté serveur Next.js, jamais depuis le navigateur.

## Scripts frontend

```bash
npm run dev     # serveur de développement
npm run build   # build de production
npm run start   # serveur de production
npm run lint    # ESLint
npm run test    # tests unitaires (Vitest)
```

## Architecture

Le projet est découpé en deux services indépendants : le frontend Next.js consomme l'API Express via HTTP, sans partager de code ni de base de données.

- Le App Router regroupe les pages en deux groupes de routes : `(site)` pour les pages avec Header/Footer partagés (accueil, logement, favoris, connexion, inscription, ajout de logement, à propos), et `(messagerie)` pour `/messagerie`, qui s'affiche sans le chrome partagé sur desktop.
- `frontend/lib/` est l'unique frontière d'accès à l'API : chaque appel HTTP passe par `apiFetch` (dans `api-client.ts`), qui centralise la construction de l'URL et la normalisation des erreurs. Aucun composant n'appelle `fetch` directement vers l'API Express.
- Les écritures (connexion, inscription, envoi de message, création de logement) passent par des Server Actions, qui appellent l'API côté serveur puis invalident le cache Next.js concerné (`revalidatePath`/`updateTag`).
- Les favoris sont gérés uniquement côté client, via `favorites-storage.ts` et `localStorage` : ils ne transitent jamais par l'API.
- Aucune requête du navigateur n'atteint directement l'API Express : toute lecture ou écriture passe par le serveur Next.js, qui est aussi ce qui rend le CORS inutile côté backend.

## Déploiement

Le frontend est hébergé sur Netlify et le backend sur Railway avec un volume persistant pour la base SQLite et les images uploadées. La procédure complète (réglages du tableau de bord Railway, variables Netlify, ordre des étapes, limites connues) est décrite dans [DEPLOYMENT.md](./DEPLOYMENT.md).
