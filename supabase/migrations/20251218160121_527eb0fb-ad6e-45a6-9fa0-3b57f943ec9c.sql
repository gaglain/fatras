-- Add slug column to centralized_artists
ALTER TABLE centralized_artists ADD COLUMN IF NOT EXISTS slug text;

-- Create unique index on slug
CREATE UNIQUE INDEX IF NOT EXISTS idx_centralized_artists_slug ON centralized_artists(slug) WHERE slug IS NOT NULL;

-- Generate slugs for existing artists based on their names
UPDATE centralized_artists 
SET slug = LOWER(
  REGEXP_REPLACE(
    REGEXP_REPLACE(
      REGEXP_REPLACE(
        REGEXP_REPLACE(
          REGEXP_REPLACE(name, '[àáâãäå]', 'a', 'gi'),
          '[èéêë]', 'e', 'gi'
        ),
        '[ìíîï]', 'i', 'gi'
      ),
      '[òóôõö]', 'o', 'gi'
    ),
    '[ùúûü]', 'u', 'gi'
  )
)
WHERE slug IS NULL;

-- Replace special characters with hyphens
UPDATE centralized_artists 
SET slug = LOWER(REGEXP_REPLACE(slug, '[^a-z0-9]+', '-', 'gi'))
WHERE slug IS NOT NULL;

-- Remove leading/trailing hyphens
UPDATE centralized_artists 
SET slug = TRIM(BOTH '-' FROM slug)
WHERE slug IS NOT NULL;