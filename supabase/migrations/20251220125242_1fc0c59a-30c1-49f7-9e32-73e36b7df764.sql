-- Enable pgcrypto extension for encryption
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Function to encrypt a token
CREATE OR REPLACE FUNCTION public.encrypt_token(plain_text text)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  encryption_key text;
BEGIN
  -- Get encryption key from vault or environment
  SELECT decrypted_secret INTO encryption_key 
  FROM vault.decrypted_secrets 
  WHERE name = 'TOKEN_ENCRYPTION_KEY' 
  LIMIT 1;
  
  IF encryption_key IS NULL OR plain_text IS NULL THEN
    RETURN NULL;
  END IF;
  
  -- Encrypt using AES-256
  RETURN encode(
    pgp_sym_encrypt(plain_text, encryption_key, 'cipher-algo=aes256'),
    'base64'
  );
END;
$$;

-- Function to decrypt a token
CREATE OR REPLACE FUNCTION public.decrypt_token(encrypted_text text)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  encryption_key text;
BEGIN
  -- Get encryption key from vault
  SELECT decrypted_secret INTO encryption_key 
  FROM vault.decrypted_secrets 
  WHERE name = 'TOKEN_ENCRYPTION_KEY' 
  LIMIT 1;
  
  IF encryption_key IS NULL OR encrypted_text IS NULL THEN
    RETURN NULL;
  END IF;
  
  -- Decrypt
  RETURN pgp_sym_decrypt(
    decode(encrypted_text, 'base64'),
    encryption_key
  );
EXCEPTION
  WHEN OTHERS THEN
    -- Return NULL if decryption fails (corrupted or wrong key)
    RETURN NULL;
END;
$$;

-- Add encrypted columns to email_accounts
ALTER TABLE public.email_accounts 
ADD COLUMN IF NOT EXISTS access_token_encrypted text,
ADD COLUMN IF NOT EXISTS refresh_token_encrypted text;

-- Migrate existing tokens to encrypted format
UPDATE public.email_accounts
SET 
  access_token_encrypted = public.encrypt_token(access_token),
  refresh_token_encrypted = public.encrypt_token(refresh_token)
WHERE access_token IS NOT NULL OR refresh_token IS NOT NULL;

-- Create a secure view for reading email accounts with decrypted tokens
CREATE OR REPLACE VIEW public.email_accounts_secure AS
SELECT 
  id,
  user_id,
  email,
  provider,
  is_active,
  is_organization_shared,
  last_sync_at,
  token_expires_at,
  imap_config,
  created_at,
  updated_at,
  -- Decrypt tokens only for the owner
  CASE 
    WHEN user_id = auth.uid() THEN public.decrypt_token(access_token_encrypted)
    ELSE NULL 
  END as access_token,
  CASE 
    WHEN user_id = auth.uid() THEN public.decrypt_token(refresh_token_encrypted)
    ELSE NULL 
  END as refresh_token
FROM public.email_accounts
WHERE user_id = auth.uid();

-- Grant access to the secure view
GRANT SELECT ON public.email_accounts_secure TO authenticated;

-- Function to safely insert/update email account with encryption
CREATE OR REPLACE FUNCTION public.upsert_email_account(
  p_email text,
  p_provider text,
  p_access_token text DEFAULT NULL,
  p_refresh_token text DEFAULT NULL,
  p_token_expires_at timestamptz DEFAULT NULL,
  p_imap_config jsonb DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_id uuid;
BEGIN
  INSERT INTO public.email_accounts (
    user_id,
    email,
    provider,
    access_token_encrypted,
    refresh_token_encrypted,
    token_expires_at,
    imap_config,
    is_active
  ) VALUES (
    auth.uid(),
    p_email,
    p_provider,
    public.encrypt_token(p_access_token),
    public.encrypt_token(p_refresh_token),
    p_token_expires_at,
    p_imap_config,
    true
  )
  ON CONFLICT (email, user_id) 
  DO UPDATE SET
    access_token_encrypted = CASE 
      WHEN p_access_token IS NOT NULL THEN public.encrypt_token(p_access_token)
      ELSE email_accounts.access_token_encrypted 
    END,
    refresh_token_encrypted = CASE 
      WHEN p_refresh_token IS NOT NULL THEN public.encrypt_token(p_refresh_token)
      ELSE email_accounts.refresh_token_encrypted 
    END,
    token_expires_at = COALESCE(p_token_expires_at, email_accounts.token_expires_at),
    imap_config = COALESCE(p_imap_config, email_accounts.imap_config),
    updated_at = now()
  RETURNING id INTO v_id;
  
  RETURN v_id;
END;
$$;

-- After migration is complete and verified, we can drop the plain text columns
-- For now, we'll set them to NULL to prevent exposure while keeping for rollback
UPDATE public.email_accounts
SET 
  access_token = NULL,
  refresh_token = NULL
WHERE access_token_encrypted IS NOT NULL;