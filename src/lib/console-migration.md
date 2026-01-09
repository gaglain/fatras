# Migration console.log → logger

## Problème
2500+ appels `console.log` dans 123 fichiers qui s'affichent en production.

## Solution
Utiliser le logger centralisé dans `src/lib/logger.ts` qui:
- Affiche les logs uniquement en développement (`import.meta.env.DEV`)
- Affiche toujours les erreurs (même en production)
- Offre une API identique à `console`

## Comment migrer un fichier

### 1. Ajouter l'import
```typescript
import { logger } from '@/lib/logger';
```

### 2. Remplacer les appels
| Avant | Après |
|-------|-------|
| `console.log(...)` | `logger.log(...)` |
| `console.warn(...)` | `logger.warn(...)` |
| `console.error(...)` | `logger.error(...)` |
| `console.info(...)` | `logger.info(...)` |
| `console.debug(...)` | `logger.debug(...)` |

### 3. Commande de remplacement (VS Code)
Rechercher: `console\.(log|warn|info|debug)\(`
Remplacer: `logger.$1(`

**Note:** Ne pas remplacer `console.error` automatiquement car ils sont déjà affichés en production par le logger.

## Fichiers prioritaires à migrer
- [x] `src/contexts/UnifiedAuthContext.tsx`
- [x] `src/components/Layout.tsx`
- [x] `src/pages/Index.tsx`
- [x] `src/components/AppSidebar.tsx`
- [x] `src/hooks/useMessaging.ts` ✅ migré
- [x] `src/hooks/useWebsitePagesSync.ts` ✅ migré
- [x] `src/components/CSVImporter.tsx` ✅ migré
- [ ] Autres hooks dans `src/hooks/`

## Fichiers déjà migrés
Les fichiers suivants utilisent déjà le logger:
- `src/contexts/UnifiedAuthContext.tsx`
- `src/components/Layout.tsx`
