import { supabase } from '@/integrations/supabase/client';

/**
 * Génère un permalien propre pour un document
 * Format: /media/[category]/[filename-slug]
 */
export const generateDocumentPermalink = (
  bucketName: string,
  filePath: string,
  category?: string
): string => {
  // Extraire le nom du fichier
  const fileName = filePath.split('/').pop() || filePath;
  
  // Créer un slug propre
  const slug = fileName
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Retirer les accents
    .replace(/[^a-z0-9.-]/g, '-') // Remplacer caractères spéciaux par -
    .replace(/-+/g, '-') // Supprimer tirets multiples
    .replace(/^-|-$/g, ''); // Supprimer tirets début/fin
  
  // Catégorie par défaut basée sur le bucket
  const categorySlug = category 
    ? category.toLowerCase().replace(/\s+/g, '-')
    : bucketName.replace(/_/g, '-');
  
  return `/media/${categorySlug}/${slug}`;
};

/**
 * Résout un permalien vers l'URL Supabase Storage réelle
 */
export const resolvePermalink = async (
  permalink: string
): Promise<string | null> => {
  try {
    // Extraire catégorie et slug du permalien
    const match = permalink.match(/^\/media\/([^\/]+)\/(.+)$/);
    if (!match) return null;
    
    const [, category, slug] = match;
    
    // Rechercher le document correspondant dans la base
    const { data, error } = await supabase
      .from('artist_files')
      .select('bucket_name, file_path')
      .or(`file_name.ilike.%${slug}%,file_path.ilike.%${slug}%`)
      .limit(1)
      .single();
    
    if (error || !data) {
      console.error('Document non trouvé pour le permalien:', permalink);
      return null;
    }
    
    // Générer l'URL publique Supabase
    const { data: urlData } = supabase.storage
      .from(data.bucket_name)
      .getPublicUrl(data.file_path);
    
    return urlData.publicUrl;
  } catch (error) {
    console.error('Erreur résolution permalien:', error);
    return null;
  }
};

/**
 * Obtient l'URL d'un document avec permalien comme fallback
 */
export const getDocumentUrl = (
  bucketName: string,
  filePath: string,
  category?: string,
  usePermalink = false
): string => {
  if (usePermalink) {
    return generateDocumentPermalink(bucketName, filePath, category);
  }
  
  // URL directe Supabase Storage
  const { data } = supabase.storage
    .from(bucketName)
    .getPublicUrl(filePath);
  
  return data.publicUrl;
};
