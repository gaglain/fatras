// Ce fichier est déprécié - utilisez maintenant src/hooks/useCentralizedData.ts
// qui utilise Supabase au lieu de localStorage

export { useCentralizedData } from '@/hooks/useCentralizedData';
export type { 
  CentralizedArtist as Artist,
  Publication,
  PublicationComment,
  CentralizedEvent as Event
} from '@/hooks/useCentralizedData';
