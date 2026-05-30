## Objectif

Te donner la main, depuis **Préférences**, sur les emails automatiques liés aux feuilles de route :
1. **Invitation** — envoyée quand tu ajoutes un artiste/équipier au casting
2. **Rappels** — J-15, J-7, J-1 avant la date
3. **Modification** — envoyé aux personnes du casting quand une feuille de route est modifiée (nouveau)

Tu pourras pour chacun :
- Activer / désactiver l'envoi
- Choisir les jours de rappel (J-15, J-7, J-3, J-1, jour J)
- Personnaliser **le sujet** et **le texte d'introduction**
- Choisir d'inclure ou non les destinataires confirmés / non confirmés
- Pour la modification : choisir un délai anti-spam (1 email max toutes les X minutes par feuille)

---

## Ce que je vais construire

### 1. Stockage des préférences
Stocker les réglages dans la table existante `app_settings`, sous des clés `roadshow_email_*` (JSON). Pas de nouvelle table.

Exemples de clés :
- `roadshow_email_invitation` → `{ enabled, subject, intro }`
- `roadshow_email_reminders` → `{ enabled, days: [15,7,1], subject, intro }`
- `roadshow_email_update` → `{ enabled, throttle_minutes, subject, intro, notify_unconfirmed_only }`

### 2. Nouvel onglet « Feuilles de route » dans Préférences
- 3 sections (Invitation / Rappels / Modification)
- Chaque section : toggle d'activation + champs sujet/intro + options spécifiques
- Aperçu du sujet en direct
- Bouton « Envoyer un email de test » (à mon adresse)

### 3. Email de modification (nouveau)
- Nouvelle edge function `send-roadshow-update-email`
- Déclenchée depuis `updateStop` quand des champs significatifs changent (date, horaires, lieu, logistique, contact)
- Liste les changements clés dans l'email
- Respecte le throttle (anti-spam) et l'activation depuis Préférences

### 4. Refactor des edge functions existantes
- `send-roadshow-assignment-email` et `send-roadshow-reminders` lisent les réglages depuis `app_settings` avant d'envoyer
- Si désactivé → no-op silencieux
- Sujet/intro repris des réglages (avec valeurs par défaut sensées)
- Les jours de rappel deviennent dynamiques

### 5. UI roadshow
- Petit badge dans le formulaire de feuille de route indiquant l'état des envois (« Invitation activée », « 3 rappels programmés », « Notif. modif activée ») pour transparence

---

## Détails techniques

- **Pas de changement de schéma DB** (réutilise `app_settings`).
- Les valeurs par défaut sont injectées si la clé est absente, donc rétro-compatible.
- L'edge function `send-roadshow-update-email` diffère les notifs `route_sheet_updated` Nylas (déjà existantes) : ces dernières mettent à jour le calendrier, la nouvelle envoie un email aux humains.
- Détection « changement significatif » : diff entre `oldStop` et `newStop` sur un set de champs whitelisté.
- Throttle : table déjà existante `roadshow_reminder_logs` étendue avec un type `update` et vérifié par horodatage.

---

## Hors scope (à confirmer si tu veux les ajouter)

- Éditeur WYSIWYG complet du HTML (je propose des champs simples sujet + intro car le reste du gabarit visuel reste cohérent avec la charte Fatras)
- Personnalisation différente par feuille de route individuelle (les réglages sont globaux)
- Réglages par utilisateur destinataire (tous les utilisateurs reçoivent selon les mêmes règles)

Dis-moi si tu valides ou si tu veux ajuster (par exemple : édition HTML complète, ou réglages par feuille).