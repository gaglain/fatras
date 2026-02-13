-- Désactiver le compte Gmail en erreur permanente
UPDATE public.email_accounts SET is_active = false WHERE email = 'fatrasplanning@gmail.com';