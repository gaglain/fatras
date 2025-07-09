
-- Table pour stocker les pages du site web
CREATE TABLE public.website_pages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  content JSONB DEFAULT '[]'::jsonb,
  meta_title TEXT,
  meta_description TEXT,
  meta_keywords TEXT,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  page_type TEXT DEFAULT 'page' CHECK (page_type IN ('page', 'home', 'legal')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Table pour le menu du site
CREATE TABLE public.website_menu (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  label TEXT NOT NULL,
  url TEXT NOT NULL,
  parent_id UUID REFERENCES public.website_menu(id) ON DELETE CASCADE,
  menu_order INTEGER DEFAULT 0,
  is_visible BOOLEAN DEFAULT true,
  target TEXT DEFAULT '_self' CHECK (target IN ('_self', '_blank')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Table pour les paramètres SEO globaux
CREATE TABLE public.website_seo (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  site_title TEXT,
  site_description TEXT,
  site_keywords TEXT,
  og_image TEXT,
  twitter_card_type TEXT DEFAULT 'summary_large_image',
  google_analytics_id TEXT,
  google_search_console_id TEXT,
  robots_txt TEXT DEFAULT 'User-agent: *\nAllow: /',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Table pour les contenus légaux
CREATE TABLE public.legal_content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  content_type TEXT NOT NULL CHECK (content_type IN ('terms', 'privacy', 'legal_notices', 'cookies')),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  is_published BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, content_type)
);

-- Table pour les commandes (pour le système de paiement)
CREATE TABLE public.shop_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  customer_email TEXT NOT NULL,
  customer_name TEXT,
  customer_address JSONB,
  total_amount DECIMAL(10,2) NOT NULL,
  currency TEXT DEFAULT 'EUR',
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'cancelled', 'refunded')),
  payment_method TEXT,
  stripe_session_id TEXT,
  stripe_payment_intent_id TEXT,
  items JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- RLS pour website_pages
ALTER TABLE public.website_pages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own website pages" ON public.website_pages
  FOR ALL USING (auth.uid() = user_id);

-- RLS pour website_menu
ALTER TABLE public.website_menu ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own website menu" ON public.website_menu
  FOR ALL USING (auth.uid() = user_id);

-- RLS pour website_seo
ALTER TABLE public.website_seo ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own website seo" ON public.website_seo
  FOR ALL USING (auth.uid() = user_id);

-- RLS pour legal_content
ALTER TABLE public.legal_content ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own legal content" ON public.legal_content
  FOR ALL USING (auth.uid() = user_id);

-- RLS pour shop_orders
ALTER TABLE public.shop_orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own shop orders" ON public.shop_orders
  FOR ALL USING (auth.uid() = user_id);

-- Fonction pour mettre à jour updated_at automatiquement
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers pour updated_at
CREATE TRIGGER update_website_pages_updated_at BEFORE UPDATE ON public.website_pages
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_website_menu_updated_at BEFORE UPDATE ON public.website_menu
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_website_seo_updated_at BEFORE UPDATE ON public.website_seo
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_legal_content_updated_at BEFORE UPDATE ON public.legal_content
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_shop_orders_updated_at BEFORE UPDATE ON public.shop_orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
