BOUTIQUE DZ - VERSION SIMPLE

1. Décompressez le dossier.
2. Ouvrez index.html avec Chrome/Edge.
3. Modifiez les produits dans script.js :
   - name = nom
   - price = prix en DA
   - image = URL de l'image
   - desc = description

IMPORTANT :
Cette première version fonctionne sans serveur et sans base de données.
Les commandes sont préparées côté navigateur et affichées comme confirmation.
Pour recevoir automatiquement les commandes, il faudra ensuite connecter un formulaire à WhatsApp, Google Sheets, email ou une base de données.

Pour mettre le site en ligne :
- Netlify / GitHub Pages / hébergement web classique.


VERSION 2 - WHATSAPP
Dans script.js, trouve :
const WHATSAPP_NUMBER="213XXXXXXXXX";

Remplace-le par ton numéro WhatsApp au format international, sans +, espaces ou tirets.
Exemple pour 0555 12 34 56 :
const WHATSAPP_NUMBER="213555123456";

Quand le client confirme, WhatsApp s'ouvre avec les produits, quantités, total et coordonnées de livraison.
