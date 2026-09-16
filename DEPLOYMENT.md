# Déploiement

Procédure complète pour mettre Kasa en ligne : le backend Express sur **Railway**, avec un volume persistant, puis le frontend Next.js sur **Vercel**.

L'ordre compte : Railway d'abord. Tant que l'API n'a pas d'URL publique, la variable `KASA_API_URL` du frontend ne peut pas être renseignée, et le build Vercel en a besoin.

## Prérequis

- Le dépôt est poussé sur GitHub (ou GitLab), branche à déployer à jour.
- Un compte Railway et un compte Vercel, tous deux connectés à ce dépôt.
- Aucune installation locale n'est nécessaire : les deux plateformes buildent depuis le dépôt.

Le dépôt ne contient volontairement aucun fichier de configuration Vercel ni Railway : tous les réglages se font dans les tableaux de bord.

## 1. Backend sur Railway

1. **Créer le projet** : _New Project_ → _Deploy from GitHub repo_ → sélectionner ce dépôt. Railway crée un service à partir de la racine du dépôt.
2. **Définir le répertoire racine** : dans _Settings_ → _Source_, régler _Root Directory_ sur `backend`. Sans cela, Railway build le mauvais projet.
3. **Laisser la détection Node faire son travail** : aucune commande de build à saisir. Railway détecte Node, installe les dépendances de `backend/package.json` et lance le script `start`. Ne pas ajouter de Dockerfile ni de Procfile.
4. **Attacher un volume** : _New_ → _Volume_, rattaché à ce service, avec un point de montage, par exemple `/data`. Ce volume est ce qui fait survivre la base SQLite et les images à un redéploiement. Sans lui, chaque déploiement repart d'une base vide.
5. **Renseigner les variables** dans _Variables_ (modèle versionné : `backend/.env.example`) :

   | Variable | Valeur à saisir | Remarque |
   | --- | --- | --- |
   | `KASA_DB_PATH` | `/data/kasa.sqlite3` | Dans le volume monté à l'étape 4 |
   | `KASA_UPLOAD_DIR` | `/data/uploads` | Dans le même volume |
   | `JWT_SECRET` | une valeur aléatoire | Par exemple le résultat de `openssl rand -hex 32`. Ne jamais laisser la valeur par défaut `change-me-in-prod` en ligne |
   | `PORT` | **ne pas définir** | Railway l'injecte lui-même ; le backend le lit dans `process.env.PORT` |

   Si le point de montage choisi à l'étape 4 n'est pas `/data`, adapter les deux chemins en conséquence : ils doivent être **à l'intérieur** du volume.
6. **Déployer**, puis générer une URL publique dans _Settings_ → _Networking_ → _Generate Domain_. On obtient une adresse de la forme `https://<nom-du-service>.up.railway.app`.
7. **Vérifier** : ouvrir `https://<api>/api/properties`. La réponse est un tableau JSON de logements.

Au premier démarrage, le backend crée le répertoire parent de `KASA_DB_PATH` et le répertoire `KASA_UPLOAD_DIR` s'ils n'existent pas, puis alimente la base à partir de `backend/data/properties.json`. Aucun des deux chemins n'a besoin d'exister au préalable, et un volume vide est un état normal. Les déploiements suivants réutilisent la base et les images déjà présentes dans le volume : les comptes créés et les photos uploadées sont conservés.

Noter l'URL de l'API : elle est nécessaire à l'étape suivante.

## 2. Frontend sur Vercel

1. **Importer le projet** : _Add New…_ → _Project_ → importer le même dépôt.
2. **Définir le répertoire racine** : _Root Directory_ → `frontend`. Vercel détecte alors Next.js (_Framework Preset_ : Next.js). Laisser les commandes de build et d'installation ainsi que le répertoire de sortie par défaut.
3. **Renseigner les variables** dans _Environment Variables_, avant le premier déploiement (modèle versionné : `frontend/.env.example`) :

   | Variable | Valeur à saisir |
   | --- | --- |
   | `KASA_API_URL` | l'URL Railway de l'étape 1, sans barre oblique finale, par exemple `https://<nom-du-service>.up.railway.app` |
   | `KASA_SITE_URL` | l'URL publique de production Vercel, sans barre oblique finale, par exemple `https://<nom-du-projet>.vercel.app` |

   `KASA_SITE_URL` n'est connue qu'une fois le projet créé : la renseigner ensuite dans _Settings_ → _Environment Variables_, puis relancer un déploiement (_Redeploy_), sinon les URLs absolues (sitemap, robots, données structurées) pointeront vers `http://localhost:3000`.

   Les déploiements _Preview_ reçoivent aussi ces variables par défaut : ils appellent alors la même API Railway, donc la même base de données que la production.
4. **Déployer**, puis ouvrir l'URL du site.
5. **Version de Node** : dans _Settings_ → _Build and Deployment_ → _Node.js Version_, choisir `24.x`, la version de la CI. Tout changement s'applique au déploiement suivant.

Ces deux variables sont lues côté serveur uniquement, sans préfixe `NEXT_PUBLIC_`. Toute modification de `KASA_API_URL` impose un **nouveau build**, pas un simple redémarrage : la valeur est figée à la compilation dans la réécriture `/uploads/:path*` de `frontend/next.config.ts`, qui est ce qui rend les images uploadées accessibles en same-origin.

Côté Railway, rien ne dépend de l'URL du frontend : l'API n'enregistre pas de CORS et seul le serveur Next.js l'appelle, jamais le navigateur.

## Limites connues

**Taille des photos en ligne.** Le formulaire de création envoie les images via une Server Action, exécutée sur Vercel comme une fonction serverless. Les fonctions Vercel refusent un corps de requête de plus de 4,5 Mo, toutes photos comprises. Le réglage `serverActions.bodySizeLimit` à `80mb` dans `frontend/next.config.ts` (voir `## Request size budget` dans `specs/09-property-creation.md`) ne change rien à ce plafond : c'est une limite de la plateforme, pas un paramètre du projet.

Conséquence : un envoi qui passe en local peut échouer en ligne. Le refus se déclenche dès que le total des photos d'un envoi dépasse environ 4,5 Mo ; il n'est pas nécessaire d'envoyer sept images.

Ce que voit l'utilisateur : la requête est rejetée par la plateforme **avant** d'atteindre la Server Action, donc aucun message d'erreur ne s'affiche sous le formulaire. Le bouton reste en état d'envoi puis la soumission échoue, et la console du navigateur montre une réponse d'erreur HTTP (typiquement 413) sur la requête de l'action. Le logement n'est pas créé.

À faire après le déploiement : tester le formulaire de création en ligne avec de petites images, en augmentant progressivement leur taille, et noter la taille maximale qui passe. C'est l'information à transmettre aux utilisateurs du site.

Il s'agit d'une limitation de livraison assumée, pas d'un défaut. Les règles locales sont inchangées : 10 Mo par fichier et 6 photos en plus de la couverture, validées côté frontend et côté API. Contourner ce plafond supposerait un envoi direct vers un stockage objet depuis le navigateur, ce qui relève d'une autre spécification.

## Vérification après déploiement

À dérouler sur le site Vercel, une fois les deux services en ligne.

- [ ] `/` affiche la liste des logements, avec leurs images.
- [ ] Une page `/logements/<slug>` s'ouvre depuis la liste et affiche galerie, description et équipements.
- [ ] `/inscription` crée un compte.
- [ ] `/connexion` connecte ce compte, et le Header reflète l'état connecté.
- [ ] `/messagerie` permet d'envoyer un message, qui apparaît dans la conversation.
- [ ] `/ajouter-un-logement` crée un logement avec de petites photos ; les images s'affichent sur la page du logement.
- [ ] Après un redéploiement du service Railway, ce même logement et ses images sont toujours là : c'est la preuve que le volume est correctement monté.
- [ ] `/favoris` : un logement ajouté aux favoris y reste après un rechargement de page.
- [ ] `/sitemap.xml` et `/robots.txt` renvoient l'origine déployée, pas `http://localhost:3000`. Si ce n'est pas le cas, `KASA_SITE_URL` est absente ou le site n'a pas été rebuildé depuis son ajout.
