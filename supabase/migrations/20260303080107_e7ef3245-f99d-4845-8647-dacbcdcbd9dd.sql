-- Rendre le bucket artist-documents public pour que les URLs publiques fonctionnent sur le front
UPDATE storage.buckets SET public = true WHERE id = 'artist-documents';
