# RéclaPro — première intégration Supabase

Cette version connecte le tableau de bord au projet Supabase `lfcdibgulsjrrctvtqbp`.

## Déploiement sur GitHub Pages
1. Extrayez ce ZIP.
2. Téléversez les fichiers et dossiers à l'intérieur de `reprosaas-de-main/` à la racine du dépôt GitHub, en remplaçant les fichiers existants. Ne téléversez pas seulement le ZIP.
3. Attendez le déploiement GitHub Pages.
4. Ouvrez `https://bbrahimbenali197-stack.github.io/reprosaas-de/auth.html`.
5. Créez un compte de test. Si Supabase demande une confirmation par e-mail, confirmez puis reconnectez-vous. Si l'espace entreprise n'a pas été créé pendant l'inscription, le formulaire vous proposera de terminer cette étape.

## Ce qui est relié
- Authentification e-mail / mot de passe avec Supabase Auth.
- Création d'un espace entreprise via la fonction SQL `create_company_for_current_user`.
- Lecture des réclamations de l'entreprise connectée.
- Création de réclamations internes et mise à jour des statuts.
- Déconnexion.

## Important
- `config.js` contient uniquement l'URL du projet et sa clé publique publishable. N'ajoutez jamais une clé `service_role` dans le site.
- Le formulaire de dépôt public anonyme n'est pas activé. Il nécessite une fonction serveur, validation et protection anti-abus.
- Les statuts disponibles sont ceux du schéma Supabase actuel : Nouvelle, En cours, Résolue, Clôturée.
- Cette première intégration a passé les vérifications de syntaxe JavaScript, mais doit encore être testée dans le navigateur après publication. N'utilisez pas de données personnelles réelles avant ces tests.
