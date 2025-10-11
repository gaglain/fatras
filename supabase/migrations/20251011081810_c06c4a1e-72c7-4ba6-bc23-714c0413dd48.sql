-- Add new columns to centralized_artists table
ALTER TABLE centralized_artists
ADD COLUMN IF NOT EXISTS logo_url text,
ADD COLUMN IF NOT EXISTS press_kit_url text,
ADD COLUMN IF NOT EXISTS short_description text,
ADD COLUMN IF NOT EXISTS official_photos text[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS quote_template_id uuid REFERENCES quote_templates(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS email_template_id uuid REFERENCES email_templates(id) ON DELETE SET NULL;

-- Create artist_users table to link users to artists with specific roles
CREATE TABLE IF NOT EXISTS artist_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  artist_id uuid NOT NULL REFERENCES centralized_artists(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role text NOT NULL CHECK (role IN ('artist', 'booker', 'admin', 'super_admin')),
  created_at timestamp with time zone DEFAULT now(),
  UNIQUE(artist_id, user_id, role)
);

-- Enable RLS on artist_users
ALTER TABLE artist_users ENABLE ROW LEVEL SECURITY;

-- RLS policies for artist_users
CREATE POLICY "Users can view artist users for their artists"
ON artist_users FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM centralized_artists
    WHERE centralized_artists.id = artist_users.artist_id
    AND centralized_artists.user_id = auth.uid()
  )
);

CREATE POLICY "Users can manage artist users for their artists"
ON artist_users FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM centralized_artists
    WHERE centralized_artists.id = artist_users.artist_id
    AND centralized_artists.user_id = auth.uid()
  )
);