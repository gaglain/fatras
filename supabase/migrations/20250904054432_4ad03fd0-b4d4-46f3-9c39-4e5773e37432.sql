-- Mettre à jour l'utilisateur booking@fatras.net en tant que super admin
UPDATE user_profiles 
SET role = 'super_admin'
WHERE email = 'booking@fatras.net';