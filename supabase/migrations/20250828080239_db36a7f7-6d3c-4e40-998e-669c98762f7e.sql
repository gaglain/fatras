-- Create opportunities table with relationships
CREATE TABLE IF NOT EXISTS public.opportunities (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  venue TEXT,
  location TEXT,
  date DATE,
  budget NUMERIC DEFAULT 0,
  status TEXT DEFAULT 'open' CHECK (status IN ('open', 'applied', 'won', 'lost')),
  deadline DATE,
  requirements TEXT,
  contact TEXT,
  -- Relations
  artist_id UUID,
  contact_id UUID,
  event_id UUID,
  task_id UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.opportunities ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can manage own opportunities"
ON public.opportunities
FOR ALL
USING (auth.uid() = user_id);

-- Create publications table if not exists
CREATE TABLE IF NOT EXISTS public.publications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  scheduled_date TIMESTAMP WITH TIME ZONE NOT NULL,
  platform TEXT NOT NULL,
  assigned_to UUID,
  assigned_username TEXT,
  media_url TEXT,
  media_type TEXT DEFAULT 'image',
  external_link TEXT,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'scheduled', 'published', 'pending_approval')),
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Enable RLS for publications
ALTER TABLE public.publications ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for publications
CREATE POLICY "Users can manage own publications"
ON public.publications
FOR ALL
USING (auth.uid() = user_id);

-- Create publication_comments table
CREATE TABLE IF NOT EXISTS public.publication_comments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  publication_id UUID NOT NULL REFERENCES public.publications(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  username TEXT NOT NULL,
  comment TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Enable RLS for publication comments
ALTER TABLE public.publication_comments ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for publication comments
CREATE POLICY "Users can manage own publication comments"
ON public.publication_comments
FOR ALL
USING (auth.uid() = user_id);

-- Update trigger for opportunities
CREATE OR REPLACE FUNCTION public.update_opportunities_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_opportunities_updated_at
  BEFORE UPDATE ON public.opportunities
  FOR EACH ROW
  EXECUTE FUNCTION public.update_opportunities_updated_at();

-- Update trigger for publications
CREATE OR REPLACE FUNCTION public.update_publications_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;