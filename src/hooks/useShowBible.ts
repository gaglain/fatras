import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { logger } from '@/lib/logger';

export interface ShowBibleDocument {
  id: string;
  name: string;
  type: 'audio' | 'video' | 'image' | 'text' | 'pdf' | 'other';
  url: string;
  file_path: string;
  bucket_name: string;
  file_size_bytes: number;
  file_size_display: string;
  category: string;
  description: string | null;
  tags: string[];
  version: string;
  artists: string[];
  created_at: string;
  updated_at: string;
}

export interface CreateDocumentData {
  name: string;
  type: 'audio' | 'video' | 'image' | 'text' | 'pdf' | 'other';
  url: string;
  file_path: string;
  bucket_name: string;
  file_size_bytes: number;
  file_size_display: string;
  category: string;
  description?: string;
  tags: string[];
  version: string;
  artists: string[];
}

const STORAGE_BUCKETS = ['publication-media', 'app-files', 'avatars', 'email-attachments', 'artist-documents'];

function getFileType(name: string): ShowBibleDocument['type'] {
  const ext = name.split('.').pop()?.toLowerCase() || '';
  if (['png', 'jpg', 'jpeg', 'gif', 'webp', 'svg'].includes(ext)) return 'image';
  if (['pdf'].includes(ext)) return 'pdf';
  if (['mp3', 'wav', 'ogg', 'aac', 'm4a', 'flac'].includes(ext)) return 'audio';
  if (['mp4', 'webm', 'mov', 'avi', 'mkv'].includes(ext)) return 'video';
  if (['txt', 'md', 'csv', 'json'].includes(ext)) return 'text';
  return 'other';
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

async function listBucketRecursive(bucket: string, prefix: string): Promise<ShowBibleDocument[]> {
  const items: ShowBibleDocument[] = [];
  try {
    const { data, error } = await supabase.storage.from(bucket).list(prefix, {
      limit: 1000,
      sortBy: { column: 'created_at', order: 'desc' },
    } as any);

    if (error || !data) return items;

    for (const f of data) {
      if (!f.name) continue;
      const fullPath = prefix ? `${prefix}/${f.name}` : f.name;
      const meta = f as any;

      // If it's a folder (no metadata / id is null), recurse into it
      if (meta.id === null || (!meta.metadata && f.name && !f.name.includes('.'))) {
        const subItems = await listBucketRecursive(bucket, fullPath);
        items.push(...subItems);
        continue;
      }

      if (f.name.endsWith('/')) continue;

      const { data: pub } = supabase.storage.from(bucket).getPublicUrl(fullPath);
      const sizeBytes = meta.metadata?.size || 0;
      items.push({
        id: `bucket-${bucket}-${fullPath}`,
        name: f.name.split('/').pop() || f.name,
        type: getFileType(f.name),
        url: pub.publicUrl,
        file_path: fullPath,
        bucket_name: bucket,
        file_size_bytes: sizeBytes,
        file_size_display: formatFileSize(sizeBytes),
        category: bucket,
        description: null,
        tags: [],
        version: '1',
        artists: [],
        created_at: meta.created_at || '',
        updated_at: meta.updated_at || meta.created_at || '',
      });
    }
  } catch {
    // silently skip bucket errors
  }
  return items;
}

async function fetchBucketFiles(): Promise<ShowBibleDocument[]> {
  const allItems: ShowBibleDocument[] = [];
  for (const bucket of STORAGE_BUCKETS) {
    const bucketItems = await listBucketRecursive(bucket, '');
    allItems.push(...bucketItems);
  }
  return allItems;
}

export const useShowBible = () => {
  const { user } = useAuth();
  const [documents, setDocuments] = useState<ShowBibleDocument[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchDocuments = async () => {
    if (!user) {
      setDocuments([]);
      setLoading(false);
      return;
    }

    try {
      // Fetch from show_bible_documents table
      const [{ data, error }, { data: bgImages }] = await Promise.all([
        supabase
          .from('show_bible_documents')
          .select('*')
          .order('created_at', { ascending: false }),
        supabase
          .from('background_images')
          .select('url, source_id')
          .not('source_id', 'is', null)
      ]);

      if (error) {
        logger.error('Erreur lors du chargement des documents:', error);
      }

      // Build a map of URL -> source_id from background_images
      const urlToArtistMap = new Map<string, string>();
      (bgImages || []).forEach((img: { url: string; source_id: string | null }) => {
        if (img.source_id) urlToArtistMap.set(img.url, img.source_id);
      });

      const dbDocs = (data || []).map((doc: any) => {
        const d = doc as ShowBibleDocument;
        // Enrich DB docs with background_images artist association if not already set
        if ((!d.artists || d.artists.length === 0) && urlToArtistMap.has(d.url)) {
          d.artists = [urlToArtistMap.get(d.url)!];
        }
        return d;
      });

      // Fetch from storage buckets
      const bucketDocs = await fetchBucketFiles();

      // Enrich bucket docs with background_images artist associations
      for (const bd of bucketDocs) {
        const artistId = urlToArtistMap.get(bd.url);
        if (artistId) {
          bd.artists = [artistId];
        }
      }

      // Deduplicate: if a bucket file URL matches a DB doc URL, keep the DB version (richer metadata)
      const dbUrls = new Set(dbDocs.map((d: ShowBibleDocument) => d.url));
      const uniqueBucketDocs = bucketDocs.filter(bd => !dbUrls.has(bd.url));

      setDocuments([...dbDocs, ...uniqueBucketDocs]);
    } catch (error: unknown) {
      logger.error('Erreur lors du chargement des documents:', error);
      toast.error('Erreur lors du chargement des documents');
    } finally {
      setLoading(false);
    }
  };

  const createDocument = async (documentData: CreateDocumentData) => {
    if (!user) {
      toast.error('Vous devez être connecté pour ajouter des documents');
      return null;
    }

    try {
      const { data, error } = await supabase
        .from('show_bible_documents')
        .insert([{
          user_id: user.id,
          ...documentData
        }])
        .select()
        .single();

      if (error) {
        logger.error('Erreur lors de la création du document:', error);
        toast.error('Erreur lors de la création du document');
        return null;
      }

      setDocuments(prev => [data as ShowBibleDocument, ...prev]);
      toast.success('Document ajouté à la bible du spectacle');
      return data;
    } catch (error: unknown) {
      logger.error('Erreur lors de la création du document:', error);
      toast.error('Erreur lors de la création du document');
      return null;
    }
  };

  const deleteDocument = async (documentId: string, filePath: string, bucketName: string) => {
    if (!user) {
      toast.error('Vous devez être connecté pour supprimer des documents');
      return false;
    }

    try {
      const { error: storageError } = await supabase.storage
        .from(bucketName)
        .remove([filePath]);

      if (storageError) {
        logger.error('Erreur lors de la suppression du fichier:', storageError);
      }

      // Only delete from DB if it's a real DB document
      if (!documentId.startsWith('bucket-')) {
        const { error: dbError } = await supabase
          .from('show_bible_documents')
          .delete()
          .eq('id', documentId);

        if (dbError) {
          logger.error('Erreur lors de la suppression du document:', dbError);
          toast.error('Erreur lors de la suppression du document');
          return false;
        }
      }

      setDocuments(prev => prev.filter(doc => doc.id !== documentId));
      toast.success('Document supprimé');
      return true;
    } catch (error: unknown) {
      logger.error('Erreur lors de la suppression du document:', error);
      toast.error('Erreur lors de la suppression du document');
      return false;
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, [user]);

  return {
    documents,
    loading,
    createDocument,
    deleteDocument,
    refetch: fetchDocuments
  };
};