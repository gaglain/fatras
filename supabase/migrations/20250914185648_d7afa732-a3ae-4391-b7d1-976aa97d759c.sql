-- Ensure upsert on email_accounts works with ON CONFLICT (user_id, email)
-- Create a unique index covering (user_id, email). Using a partial index keeps NULL user_id rows unconstrained.
CREATE UNIQUE INDEX IF NOT EXISTS email_accounts_user_id_email_unique_idx
ON public.email_accounts (user_id, email)
WHERE user_id IS NOT NULL;