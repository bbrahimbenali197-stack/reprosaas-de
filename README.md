# RéclaPro — prototype sans base de données

Prototype front-end en français pour une plateforme SaaS de gestion des réclamations multi-entreprises.

## Ouvrir le prototype

- Téléchargez ou extrayez le ZIP.
- Ouvrez `index.html` dans un navigateur récent.
- Aucune installation, compilation ou commande n'est nécessaire.

## Fonctionnalités présentes

- Tableau de bord avec statistiques calculées depuis les données de démonstration.
- Liste de réclamations avec recherche et filtres.
- Création d'une réclamation fictive.
- Détail d'une réclamation et modification de son statut.
- Annuaire de trois entreprises fictives.
- Aperçu du portail public.
- Mise en page adaptée aux téléphones et ordinateurs.
- Sauvegarde locale dans `localStorage` du navigateur, si autorisée.

## Limites importantes

Ce dépôt contient uniquement un prototype front-end. Il ne possède pas :
- de base de données distante ;
- de véritable connexion ou gestion de comptes ;
- de séparation de sécurité entre entreprises ;
- de backend, notifications par e-mail ou pièces jointes sécurisées ;
- de paiements ou d'abonnements ;
- de système d'audit fiable.

**N'utilisez pas ce prototype pour des réclamations réelles, des données personnelles ou des informations confidentielles.** Le stockage local du navigateur n'est pas une base de données sécurisée. Les exemples de clients et entreprises sont fictifs.

## Publier gratuitement avec GitHub Pages

1. Créez un dépôt GitHub privé ou public selon votre préférence. Pour GitHub Pages, vérifiez les limites et conditions applicables aux dépôts privés de votre compte ; le plus simple pour un prototype public est généralement un dépôt public.
2. Dans le dépôt, cliquez sur **Add file → Upload files**.
3. Extrayez le ZIP sur votre ordinateur avant l'envoi : téléversez les fichiers `index.html`, `styles.css`, `app.js` et `README.md` à la racine du dépôt, pas le ZIP lui-même.
4. Cliquez sur **Commit changes**.
5. Ouvrez **Settings → Pages**.
6. Sous **Build and deployment**, choisissez **Deploy from a branch**, puis la branche `main` et le dossier `/ (root)`, et cliquez sur **Save**.
7. Attendez la publication et utilisez l'adresse affichée dans **Settings → Pages**.

GitHub Pages héberge un site statique. Cela ne crée pas de backend ni de base de données.

## Prochaine phase du projet

Quand le prototype sera validé, ajouter une base de données et un backend adaptés, l'authentification, des politiques d'accès multi-tenant vérifiées, la gestion des rôles, des journaux d'audit, la validation des données, des sauvegardes et les obligations légales applicables avant toute mise en production.
