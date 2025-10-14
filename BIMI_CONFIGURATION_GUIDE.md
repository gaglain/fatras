# Configuration BIMI pour afficher le logo dans Gmail et Outlook

## Qu'est-ce que BIMI ?

BIMI (Brand Indicators for Message Identification) permet d'afficher votre logo à côté de vos emails dans Gmail, Yahoo, et certains autres clients email.

## Prérequis

### 1. DMARC stricte (OBLIGATOIRE)
Avant BIMI, vous devez avoir une politique DMARC stricte avec `p=quarantine` ou `p=reject`.

**Enregistrement DMARC à ajouter dans vos DNS :**
```
Nom: _dmarc.fatras.net
Type: TXT
Valeur: v=DMARC1; p=quarantine; rua=mailto:postmaster@fatras.net; pct=100; adkim=s; aspf=s
```

**Pour le sous-domaine booking :**
```
Nom: _dmarc.booking.fatras.net
Type: TXT
Valeur: v=DMARC1; p=quarantine; rua=mailto:postmaster@fatras.net; pct=100; adkim=s; aspf=s
```

### 2. Logo au format SVG Tiny PS (OBLIGATOIRE)

Le logo DOIT être au format **SVG Tiny Portable/Secure (SVG Tiny PS)** avec ces contraintes strictes :

- **Format uniquement : SVG Tiny PS 1.2**
- Taille maximale : 32 Ko
- Dimensions maximales : 512×512 pixels (carré recommandé)
- **Restrictions :**
  - ❌ Pas de JavaScript
  - ❌ Pas de liens externes
  - ❌ Pas de références externes (images, fonts)
  - ❌ Pas d'animations
  - ✅ Chemins vectoriels uniquement
  - ✅ Couleurs directement dans le SVG

**Exemple de structure SVG Tiny PS conforme :**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" version="1.2" baseProfile="tiny-ps">
  <title>Fatras Logo</title>
  <rect x="0" y="0" width="512" height="512" fill="#FFFFFF"/>
  <path d="M256,100 L356,300 L156,300 Z" fill="#FF0000"/>
  <!-- Vos formes vectorielles ici -->
</svg>
```

**Outils de conversion recommandés :**
- [BIMI Group SVG Converter](https://bimigroup.org/svg-conversion-tools/)
- [Illustrator](https://www.adobe.com/products/illustrator.html) : Exporter en SVG Tiny 1.2
- [Inkscape](https://inkscape.org/) (gratuit) : Enregistrer sous → SVG Tiny 1.2

**⚠️ Important :** Testez votre SVG avec le validateur officiel avant de continuer.

## Configuration DNS pour BIMI

### Pour fatras.net

```
Nom: default._bimi.fatras.net
Type: TXT
Valeur: v=BIMI1; l=https://fatras.net/logo-bimi.svg; a=
```

### Pour booking.fatras.net

```
Nom: default._bimi.booking.fatras.net
Type: TXT
Valeur: v=BIMI1; l=https://booking.fatras.net/logo-bimi.svg; a=
```

## Hébergement du logo

### Option 1: Hébergement sur votre site
1. Uploadez le logo SVG validé sur votre site
2. Rendez-le accessible en HTTPS (obligatoire)
3. Configurez les headers CORS si nécessaire :
   ```
   Access-Control-Allow-Origin: *
   Content-Type: image/svg+xml
   ```

### Option 2: Hébergement sur Supabase Storage
```javascript
// Upload le logo dans le bucket website-images (public)
const { data, error } = await supabase.storage
  .from('website-images')
  .upload('bimi/logo-fatras.svg', svgFile);

// Obtenir l'URL publique
const { data: { publicUrl } } = supabase.storage
  .from('website-images')
  .getPublicUrl('bimi/logo-fatras.svg');

// Utiliser cette URL dans l'enregistrement BIMI
```

## VMC (Verified Mark Certificate) - Optionnel mais recommandé

Pour Gmail et Yahoo, un VMC (certificat payant) est **fortement recommandé** car :
- Sans VMC, seuls certains ESP afficheront le logo
- Gmail n'affiche les logos BIMI **qu'avec un VMC**
- Coût : ~1500-3000€/an selon le fournisseur

**Fournisseurs de VMC :**
- DigiCert
- Entrust
- Sectigo (anciennement Comodo)

**Démarche VMC :**
1. Obtenir votre marque déposée (INPI en France)
2. Acheter le VMC auprès d'un CA (Certificate Authority)
3. Ajouter le certificat dans l'enregistrement BIMI :
   ```
   v=BIMI1; l=https://fatras.net/logo-bimi.svg; a=https://fatras.net/vmc.pem
   ```

## Vérification de la configuration

### 1. Vérifier DMARC
```bash
dig _dmarc.fatras.net TXT
dig _dmarc.booking.fatras.net TXT
```

### 2. Vérifier BIMI
```bash
dig default._bimi.fatras.net TXT
dig default._bimi.booking.fatras.net TXT
```

### 3. Outils en ligne
- [BIMI Inspector](https://bimigroup.org/bimi-generator/) - Validateur officiel
- [dmarcian BIMI Inspector](https://dmarcian.com/bimi-inspector/)
- [PowerDMARC BIMI Checker](https://powerdmarc.com/bimi-record-generator/)

### 4. Tester l'affichage
Envoyez un email de test à :
- Votre adresse Gmail personnelle
- Votre adresse Yahoo

**⏱ Délai d'affichage :**
- Propagation DNS : 24-48h
- Gmail : peut prendre 1-2 semaines après propagation
- Yahoo : généralement plus rapide (quelques jours)

## Alternatives sans BIMI

Si BIMI est trop complexe ou coûteux, considérez ces alternatives :

### 1. Photo de profil Google Workspace
- Gratuit
- Visible uniquement dans Gmail
- Configuration : Google Admin Console → Profils utilisateurs
- Synchronisé avec l'adresse email

### 2. Gravatar
- Gratuit
- Supporté par certains clients email
- Limité mais simple

### 3. Signature HTML avec logo
- Gratuit
- Universel (tous les clients)
- Moins visible qu'un logo BIMI officiel
- Déjà implémenté dans votre système

## Checklist de déploiement

- [ ] Politique DMARC stricte en place (p=quarantine ou p=reject)
- [ ] Logo converti au format SVG Tiny PS validé
- [ ] Logo hébergé en HTTPS accessible publiquement
- [ ] Enregistrement BIMI DNS créé
- [ ] Vérification avec BIMI Inspector
- [ ] Email de test envoyé
- [ ] (Optionnel) VMC commandé pour Gmail
- [ ] Documentation mise à jour

## Support et ressources

- [Spécification BIMI officielle](https://bimigroup.org/)
- [Guide Google BIMI](https://support.google.com/a/answer/10911027)
- [FAQ BIMI](https://bimigroup.org/faqs/)
- [Slack communauté BIMI](https://bimigroup.org/join-us/)

## Notes importantes

1. **Sans VMC, Gmail n'affichera PAS le logo** - Le VMC est quasi obligatoire pour Gmail
2. **Le logo doit être parfaitement carré** pour un rendu optimal
3. **La propagation peut prendre 2-3 semaines** pour Gmail même avec tout correctement configuré
4. **DMARC doit être en mode strict** - `p=none` ne fonctionne pas pour BIMI
5. **Testez d'abord avec des emails personnels** avant de déployer en production
