# Séquences emailing avec re-segmentation par engagement

## Objectif

Permettre de créer une **séquence de campagnes** (4 emails ou plus) où, après chaque envoi, les contacts sont automatiquement triés en sous-listes selon leur comportement (bounced / opened / clicked / not opened), et tu lances manuellement l'étape suivante en choisissant quels segments cibler avec quel contenu.

---

## Ce qui sera construit

### 1. Nouveau module "Séquences" dans la section Campagnes

Une séquence = un parent qui contient plusieurs **étapes** (Email 1, Email 2, Email 3, Email 4…).

**Vue Workflow visuelle** : arbre interactif qui affiche chaque étape comme une carte, avec des branches conditionnelles entre elles.

```text
        ┌─ Email 1 (1247 envoyés) ─┐
        │                          │
   ┌────┼──────┬──────────┬────────┤
   ▼    ▼      ▼          ▼        ▼
 Bounced Clicked Opened  Not opened
  (23)   (89)    (210)    (925)
   ✗      │       │         │
          ▼       ▼         ▼
       Email 2A Email 2B  Email 2C
       "chaud"  "tiède"   "relance"
```

Chaque carte montre : nom de l'étape, statut (brouillon / programmé / envoyé), nb de destinataires, taux d'ouverture/clic une fois envoyé.

### 2. Re-segmentation automatique après chaque envoi

Dès qu'une étape est envoyée, le système crée automatiquement **4 sous-listes** liées à cette étape :
- `[Étape 1] Bounced` — emails invalides (exclus définitivement de toute la séquence)
- `[Étape 1] Clicked` — ont cliqué au moins un lien
- `[Étape 1] Opened` — ont ouvert mais pas cliqué
- `[Étape 1] Not opened` — n'ont pas ouvert (après 48h minimum)

Ces listes sont réutilisables comme n'importe quelle liste de contacts existante (visibles dans la section Listes).

### 3. Création de l'étape suivante

Bouton **"+ Ajouter une étape"** sur la vue Workflow. Pour chaque nouvelle étape tu choisis :
- **Source** : une ou plusieurs sous-listes issues d'étapes précédentes (ex: "Clicked Étape 1" + "Opened Étape 2")
- **Exclusions automatiques** : tous les Bounced de la séquence sont toujours exclus
- **Template email** : depuis ta bibliothèque existante, ou nouveau
- **Délai indicatif** : champ texte libre ("J+7", "Dans 2 semaines") — purement informatif puisque tu lances manuellement

### 4. Lancement manuel par étape

Pour chaque étape en statut "Prêt", un bouton **"Lancer cette étape"** ouvre un récapitulatif :
- Nombre de destinataires finaux après dédoublonnage et exclusions
- Aperçu du contenu
- Estimation du nb de jours (à 200/jour max)
- Bouton de confirmation

Une fois lancé, l'envoi entre dans la file existante (batch 200/jour) et la re-segmentation se déclenche dès la fin de l'envoi.

### 5. Dashboard de la séquence

Vue d'ensemble : entonnoir global de la séquence (combien de contacts à l'étape 1 vs étape 4), taux d'engagement cumulé, contacts les plus engagés (ont cliqué à plusieurs étapes).

---

## Détails techniques

**Tables à ajouter** :
- `email_sequences` (id, name, status, created_by, created_at)
- `email_sequence_steps` (id, sequence_id, position, name, template_id, status, sent_at, source_list_ids[], excluded_list_ids[])
- `email_sequence_segments` (id, step_id, segment_type [bounced/opened/clicked/not_opened], list_id, contact_count)

**Edge functions à ajouter** :
- `compute-sequence-segments` : appelée 48h après la fin d'un envoi, lit `email_analytics` + Resend webhooks, crée les 4 listes auto et les remplit
- Réutilisation de la fonction d'envoi de campagne existante (batch 200/jour)

**Re-segmentation** : basée sur `email_analytics` (déjà alimentée par les webhooks Resend `delivered` / `opened` / `clicked` / `bounced` / `complained`). Un contact qui a cliqué est aussi compté comme opened mais sera classé dans Clicked (priorité la plus forte).

**Sécurité** : RLS standard, accès limité aux utilisateurs authentifiés du CRM collaboratif.

---

## Ce que cela ne fait PAS (volontairement)

- Pas d'envoi automatique entre étapes (tu valides chaque lancement)
- Pas de A/B testing par étape (peut être ajouté plus tard)
- Pas de modification du système d'envoi par lots existant (200/jour reste la règle)
- Pas de templates d'email préfaits — tu utilises ta bibliothèque actuelle

---

## Livraison estimée

Module construit en une seule passe :
1. Migration DB (3 tables + RLS)
2. Edge function de segmentation
3. UI Workflow visuelle (page Séquences + builder de séquence + vue détail étape)
4. Intégration avec le système d'envoi existant

Une fois validé, je commence par la migration.