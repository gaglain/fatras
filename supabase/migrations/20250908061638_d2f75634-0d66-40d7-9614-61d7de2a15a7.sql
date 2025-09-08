-- Ajouter les champs manquants à la table user_profiles pour les informations de congé spectacle et d'abattement

ALTER TABLE public.user_profiles 
ADD COLUMN IF NOT EXISTS entertainment_leave_number text,
ADD COLUMN IF NOT EXISTS tax_reduction boolean DEFAULT false;