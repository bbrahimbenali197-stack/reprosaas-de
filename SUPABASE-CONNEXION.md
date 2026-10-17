# Connexion ReclaPro à Supabase

Cette version relie le tableau de bord à `lfcdibgulsjrrctvtqbp` avec la clé publique `publishable`. Aucune clé `service_role` n'est incluse.

## Fichiers
- `auth.html` : connexion et création d'un espace entreprise.
- `config.js` : URL et clé publique du projet.
- `app.js` : lecture, création et mise à jour des réclamations Supabase.
- `index.html` : interface existante conservée.

## Avant le test
1. Téléversez les fichiers du ZIP à la racine du dépôt GitHub (remplacez les fichiers existants).
2. Dans Supabase > Authentication > URL Configuration, ajoutez `https://bbrahimbenali197-stack.github.io/reprosaas-de/auth.html` à Site URL / Redirect URLs selon les champs disponibles.
3. Créez un compte de test via `auth.html`. Si la confirmation e-mail est activée, confirmez l'adresse avant de vous connecter.
4. Testez création et mise à jour d'une réclamation avec des données fictives.

## Limites de cette première intégration
- Le formulaire du tableau de bord crée des réclamations internes pour l'entreprise connectée. Le dépôt public anonyme de réclamations n'est volontairement pas activé : il nécessite une fonction serveur avec protection anti-abus et validation.
- Les statuts sont ramenés aux quatre statuts autorisés par le schéma actuel.
- Le code doit être testé sur le site publié avant de l'utiliser avec des données réelles.
