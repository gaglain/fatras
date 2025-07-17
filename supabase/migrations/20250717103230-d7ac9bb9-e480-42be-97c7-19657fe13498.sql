
-- Créer une table pour les profils utilisateurs étendus
CREATE TABLE IF NOT EXISTS public.user_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  username TEXT UNIQUE NOT NULL,
  first_name TEXT,
  last_name TEXT,
  email TEXT,
  phone TEXT,
  role TEXT NOT NULL DEFAULT 'utilisateur',
  company TEXT,
  address TEXT,
  postal_code TEXT,
  city TEXT,
  birth_date DATE,
  birth_place TEXT,
  social_security_number TEXT,
  guso_id TEXT,
  function_title TEXT,
  nationality TEXT,
  show_name TEXT,
  associated_artists TEXT[] DEFAULT '{}',
  avatar_url TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- Activer RLS sur la table user_profiles
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- Politique pour permettre aux utilisateurs de voir leur propre profil
CREATE POLICY "Users can view their own profile" ON public.user_profiles
  FOR SELECT USING (auth.uid() = user_id);

-- Politique pour permettre aux utilisateurs de mettre à jour leur propre profil
CREATE POLICY "Users can update their own profile" ON public.user_profiles
  FOR UPDATE USING (auth.uid() = user_id);

-- Politique pour permettre aux admins de voir tous les profils
CREATE POLICY "Admins can view all profiles" ON public.user_profiles
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles 
      WHERE user_id = auth.uid() 
      AND role IN ('super_admin', 'admin')
    )
  );

-- Fonction pour créer automatiquement un profil à l'inscription
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (
    user_id,
    username,
    email,
    first_name,
    last_name,
    role
  ) VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)),
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'last_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'role', 'utilisateur')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Déclencher la fonction à chaque nouvel utilisateur
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Fonction pour mettre à jour automatiquement updated_at
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Déclencher la mise à jour d'updated_at
CREATE TRIGGER handle_user_profiles_updated_at
  BEFORE UPDATE ON public.user_profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
