-- Ajouter le champ task_type à la table tasks pour les types Email, Telephone, RDV, Autre
ALTER TABLE public.tasks ADD COLUMN task_type text DEFAULT 'Autre';

-- Ajouter une fonction pour mettre à jour quote_items
CREATE OR REPLACE FUNCTION public.update_quote_items_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  -- Mettre à jour la colonne updated_at du devis parent
  UPDATE public.quotes 
  SET updated_at = now()
  WHERE id = NEW.quote_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Créer un trigger pour mettre à jour la date des devis quand on ajoute des items
CREATE TRIGGER update_quote_on_item_change
  AFTER INSERT OR UPDATE OR DELETE ON public.quote_items
  FOR EACH ROW
  EXECUTE FUNCTION public.update_quote_items_updated_at();

-- Ajouter une colonne updated_at à quote_items si elle n'existe pas
ALTER TABLE public.quote_items ADD COLUMN IF NOT EXISTS updated_at timestamp with time zone DEFAULT now();

-- Créer un trigger pour mettre à jour quote_items.updated_at
CREATE TRIGGER update_quote_items_updated_at_trigger
  BEFORE UPDATE ON public.quote_items
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();