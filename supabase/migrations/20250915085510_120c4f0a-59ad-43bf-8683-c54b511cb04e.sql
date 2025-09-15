-- Fix ON CONFLICT target for email_accounts upsert
-- 1) Drop the previous partial unique index which cannot be used by ON CONFLICT (column_list)
DROP INDEX IF EXISTS public.email_accounts_user_id_email_unique_idx;

-- 2) Add a proper unique constraint over (user_id, email)
ALTER TABLE public.email_accounts
ADD CONSTRAINT email_accounts_user_id_email_key UNIQUE (user_id, email);
