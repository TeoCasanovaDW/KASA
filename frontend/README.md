# Kasa — frontend

Application Next.js (App Router, TypeScript, Tailwind CSS) consommant l'API Express du dossier `../backend`.

Installation, variables d'environnement, scripts, architecture et déploiement sont documentés dans le [README.md](../README.md) à la racine du dépôt.

## Scripts

```bash
npm run dev     # serveur de développement
npm run build   # build de production
npm run start   # serveur de production
npm run lint    # ESLint
npm run test    # tests unitaires (Vitest)
npm run storybook        # Storybook sur http://localhost:6006
npm run build-storybook  # build statique de Storybook (storybook-static/)
```

## Storybook

Storybook documente les états visuels des composants réutilisables, isolés du reste de l'application. Les API de code restent documentées en JSDoc/TSDoc, et le comportement reste couvert par les tests Vitest.
