-- Créer la table products pour le catalogue
CREATE TABLE public.products (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  price NUMERIC NOT NULL DEFAULT 0,
  category TEXT,
  stock_quantity INTEGER DEFAULT 0,
  status TEXT DEFAULT 'active',
  images JSONB DEFAULT '[]'::jsonb,
  attributes JSONB DEFAULT '[]'::jsonb,
  variations JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- Create policies for products
CREATE POLICY "All authenticated users can manage all products" 
ON public.products 
FOR ALL 
USING (true)
WITH CHECK (true);

-- Create trigger for timestamps
CREATE TRIGGER update_products_updated_at
BEFORE UPDATE ON public.products
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Mettre à jour la table publications pour supporter plusieurs plateformes
ALTER TABLE public.publications 
ADD COLUMN IF NOT EXISTS platforms JSONB DEFAULT '[]'::jsonb;

-- Mise à jour des données existantes
UPDATE public.publications 
SET platforms = jsonb_build_array(platform) 
WHERE platforms IS NULL OR platforms = '[]'::jsonb;