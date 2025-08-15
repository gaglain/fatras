-- Créer la table pour les publications
CREATE TABLE public.publications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  scheduled_date TIMESTAMP WITH TIME ZONE,
  platform TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'scheduled', 'published', 'pending_approval')),
  assigned_to UUID,
  assigned_username TEXT,
  media_url TEXT,
  media_type TEXT CHECK (media_type IN ('image', 'video')),
  external_link TEXT,
  created_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Créer la table pour les commentaires de publications
CREATE TABLE public.publication_comments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  publication_id UUID NOT NULL REFERENCES public.publications(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  username TEXT NOT NULL,
  comment TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Créer la table pour les artistes centralisés
CREATE TABLE public.centralized_artists (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  genre TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  upcoming_shows INTEGER DEFAULT 0,
  total_shows INTEGER DEFAULT 0,
  current_tour TEXT,
  bio TEXT,
  image TEXT,
  rating DECIMAL(2,1),
  contact_email TEXT,
  contact_phone TEXT,
  website TEXT,
  instagram TEXT,
  facebook TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Créer la table pour les événements centralisés
CREATE TABLE public.centralized_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  start_date TIMESTAMP WITH TIME ZONE,
  end_date TIMESTAMP WITH TIME ZONE,
  venue TEXT,
  address TEXT,
  city TEXT,
  country TEXT,
  event_type TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  budget_min DECIMAL(10,2),
  budget_max DECIMAL(10,2),
  attendees_count INTEGER,
  artist_id TEXT,
  image TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Créer la table pour les designs de site web
CREATE TABLE public.website_designs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  logo TEXT,
  site_name TEXT NOT NULL,
  primary_color TEXT NOT NULL,
  secondary_color TEXT NOT NULL,
  accent_color TEXT NOT NULL,
  header_bg TEXT NOT NULL,
  footer_bg TEXT NOT NULL,
  text_color TEXT NOT NULL,
  link_color TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.publications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.publication_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.centralized_artists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.centralized_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.website_designs ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can manage own publications" 
ON public.publications 
FOR ALL 
USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own publication comments" 
ON public.publication_comments 
FOR ALL 
USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own centralized artists" 
ON public.centralized_artists 
FOR ALL 
USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own centralized events" 
ON public.centralized_events 
FOR ALL 
USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own website designs" 
ON public.website_designs 
FOR ALL 
USING (auth.uid() = user_id);

-- Create triggers for updated_at
CREATE TRIGGER update_publications_updated_at
BEFORE UPDATE ON public.publications
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_centralized_artists_updated_at
BEFORE UPDATE ON public.centralized_artists
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_centralized_events_updated_at
BEFORE UPDATE ON public.centralized_events
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_website_designs_updated_at
BEFORE UPDATE ON public.website_designs
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();