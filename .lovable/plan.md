# Corriger la signature email personnalisée

## Objectif
Faire de la signature enregistrée dans **Préférences → Email** l’unique signature utilisée dans les emails, avec la photo du profil lorsqu’elle est disponible.

## Modifications
- Charger la signature enregistrée et la photo du profil dans l’éditeur de signature.
- Ajouter automatiquement la photo à la signature personnalisée sans écraser le texte saisi.
- Remplacer les anciennes signatures codées en dur dans les composeurs par la signature enregistrée.
- Éviter les signatures absentes ou ajoutées deux fois selon le mode d’envoi (email individuel, modèle, Nylas/Resend).
- Vérifier l’aperçu et la chaîne d’envoi sur ordinateur et mobile.

## Détails techniques
- `user_profiles.email_signature` reste la source de vérité.
- `user_profiles.avatar_url` fournit la photo.
- Une fonction partagée chargera et formatera la signature pour les différents composeurs.
- Les campagnes continueront d’utiliser leur option explicite « Inclure ma signature ».
