# Configuration des Webhooks Resend pour le Tracking Email

Ce guide explique comment configurer les webhooks Resend pour activer le tracking complet des statistiques d'email (ouvertures, clics, rebonds, etc.).

## Prérequis

- Compte Resend actif avec une clé API configurée
- Campagnes email déjà configurées dans l'application

## Étapes de configuration

### 1. Accéder aux Webhooks Resend

1. Connectez-vous à votre compte Resend : https://resend.com/
2. Allez dans **Settings** > **Webhooks**
3. Cliquez sur **Add Webhook**

### 2. Configurer l'URL du Webhook

Utilisez l'URL de votre fonction edge Supabase :

```
https://nhoemjarkxqwruupqgyd.supabase.co/functions/v1/resend-email-events
```

### 3. Sélectionner les événements

Cochez les événements suivants pour activer le tracking complet :

✅ **email.sent** - Email envoyé
✅ **email.delivered** - Email livré  
✅ **email.opened** - Email ouvert (tracking pixel)
✅ **email.clicked** - Lien cliqué
✅ **email.bounced** - Email rejeté
✅ **email.complained** - Plainte SPAM

### 4. Vérifier le Secret de Signature

Le secret de signature du webhook est déjà configuré dans les variables d'environnement :
- Variable : `RESEND_WEBHOOK_SECRET`

Si vous devez le régénérer :
1. Copiez le nouveau secret depuis Resend
2. Mettez à jour la variable dans Supabase : Settings > Edge Functions > Secrets

### 5. Tester le Webhook

1. Dans Resend, utilisez le bouton **Test** pour envoyer un événement de test
2. Vérifiez les logs de la fonction edge :
   - Allez dans Supabase : Functions > resend-email-events > Logs
3. Vous devriez voir : `✅ Processing webhook event: email.opened`

## Vérification du Tracking

### Pixels de Tracking (Ouvertures)

Les emails contiennent automatiquement un pixel invisible de 1x1 pixel qui se charge quand l'email est ouvert :

```html
<img src="https://...supabase.co/functions/v1/track-email-open?campaign=...&contact=..." 
     width="1" height="1" alt="" style="display:none;" />
```

### Liens Trackés (Clics)

Tous les liens dans les emails sont automatiquement remplacés par des URLs de tracking :

```html
<!-- Lien original -->
<a href="https://example.com">Cliquez ici</a>

<!-- Devient -->
<a href="https://...supabase.co/functions/v1/track-email-click?campaign=...&contact=...&url=https://example.com">
  Cliquez ici
</a>
```

Le lien redirige automatiquement vers l'URL originale après avoir enregistré le clic.

## Consultation des Statistiques

### Vue Globale

1. Allez dans **Campagnes Email**
2. Cliquez sur le bouton **Statistiques** en haut à droite
3. Sélectionnez une campagne ou "Toutes les campagnes"

Vous verrez :
- 📊 **Emails envoyés** : Nombre total d'emails envoyés
- 👁️ **Taux d'ouverture** : Pourcentage d'emails ouverts (Benchmark : 20%)
- 🖱️ **Taux de clic** : Pourcentage de clics (Benchmark : 3%)
- ⚠️ **Taux de rebond** : Pourcentage de rebonds (Max acceptable : 2%)

### Statistiques par Campagne

Sur chaque carte de campagne envoyée, vous verrez directement :
- Nombre d'emails envoyés
- Taux d'ouverture en %
- Taux de clic en %
- Nombre de rebonds

### Graphiques Détaillés

Dans l'onglet **Statistiques** :
- **Graphiques** : Comparaison visuelle des performances par campagne
- **Campagnes** : Tableau détaillé avec toutes les métriques
- **Événements** : Historique de tous les événements de tracking

## Résolution de Problèmes

### Les statistiques ne s'affichent pas

1. **Vérifier que le webhook est actif** :
   - Resend > Settings > Webhooks > Status doit être "Active"

2. **Vérifier les logs** :
   ```
   Supabase > Functions > resend-email-events > Logs
   ```
   Vous devriez voir les événements arriver en temps réel

3. **Vérifier la signature** :
   Si vous voyez "Webhook verification failed", vérifiez que `RESEND_WEBHOOK_SECRET` correspond au secret dans Resend

### Les ouvertures ne sont pas trackées

- Certains clients email bloquent le chargement des images
- Les ouvertures via des prévisualisations ne sont pas toujours comptées
- Taux d'ouverture typique : 15-25%

### Les clics ne sont pas trackés

- Vérifiez que les liens dans vos templates email sont bien des balises `<a href="...">`
- Les liens dans du texte brut ne sont pas trackés automatiquement

## Fonctionnalités Supplémentaires

### Webhooks Personnalisés

Pour recevoir les événements dans votre propre système :

```typescript
// Dans votre API
POST /api/email-events
{
  "type": "email.opened",
  "data": {
    "campaign_id": "...",
    "contact_id": "...",
    "opened_at": "2024-01-15T10:30:00Z"
  }
}
```

### Exports CSV

Vous pouvez exporter les statistiques depuis la page Analytics :
- Cliquez sur "Exporter" dans l'onglet "Campagnes"
- Format : CSV avec toutes les métriques

## Support

Pour toute question ou problème :
- Documentation Resend : https://resend.com/docs/webhooks
- Documentation Supabase : https://supabase.com/docs/guides/functions
