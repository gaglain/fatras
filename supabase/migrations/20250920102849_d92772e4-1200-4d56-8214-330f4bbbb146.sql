-- Migration simplifiée pour éviter les deadlocks
-- Corriger la contrainte de clé étrangère pour user_profiles

-- D'abord, s'assurer qu'il n'y a pas d'enregistrements orphelins
DELETE FROM user_profiles WHERE user_id NOT IN (SELECT id FROM auth.users);

-- Recréer la contrainte de clé étrangère
ALTER TABLE user_profiles 
DROP CONSTRAINT IF EXISTS user_profiles_user_id_fkey;

ALTER TABLE user_profiles 
ADD CONSTRAINT user_profiles_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;