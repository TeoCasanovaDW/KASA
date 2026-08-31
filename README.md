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

Backend, optionnelles :

| Variable | Défaut | Rôle |
| --- | --- | --- |
| `PORT` | `4000` | Port d'écoute HTTP |
| `JWT_SECRET` | `change-me-in-prod` | Secret de signature des tokens JWT |

L'API n'expose pas de middleware CORS : les appels doivent être faits côté serveur Next.js, jamais depuis le navigateur.

## Scripts frontend

```bash
npm run dev     # serveur de développement
npm run build   # build de production
npm run start   # serveur de production
npm run lint    # ESLint
```
