/**
 * Configuration des emails avec Resend
 * Guide pour l'utilisateur
 */

## Configuration requise pour l'envoi d'emails

### 1. Créer un compte Resend
- Rendez-vous sur [https://resend.com](https://resend.com)
- Créez un compte gratuit ou payant selon vos besoins

### 2. Valider votre domaine
- Allez sur [https://resend.com/domains](https://resend.com/domains)
- Ajoutez votre domaine et suivez les instructions de validation DNS
- **Important**: Sans domaine validé, vous ne pourrez envoyer que vers des emails vérifiés

### 3. Créer une clé API
- Rendez-vous sur [https://resend.com/api-keys](https://resend.com/api-keys)
- Créez une nouvelle clé API avec les permissions nécessaires
- Copiez cette clé, vous en aurez besoin

### 4. Configuration dans l'application
- Dans les préférences > Email
- Ajoutez votre clé API Resend dans les paramètres
- Configurez votre email expéditeur (doit correspondre à votre domaine validé)

### Exemples de configuration
```
Domaine validé: votreDomaine.com
Email expéditeur: noreply@votreDomaine.com
```

### Limites du plan gratuit Resend
- 3 000 emails par mois
- 100 emails par jour
- Parfait pour tester et débuter

### Support
- Documentation officielle: [https://resend.com/docs](https://resend.com/docs)
- En cas de problème, vérifiez d'abord la validation de votre domaine