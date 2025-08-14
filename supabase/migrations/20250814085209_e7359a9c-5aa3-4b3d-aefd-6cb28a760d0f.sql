-- Add new fields to user_profiles table for bank details, contracts, availability, skills, and identity documents
ALTER TABLE public.user_profiles ADD COLUMN IF NOT EXISTS bank_details jsonb DEFAULT NULL;
ALTER TABLE public.user_profiles ADD COLUMN IF NOT EXISTS contracts_fees jsonb DEFAULT '[]'::jsonb;
ALTER TABLE public.user_profiles ADD COLUMN IF NOT EXISTS availability jsonb DEFAULT NULL;
ALTER TABLE public.user_profiles ADD COLUMN IF NOT EXISTS skills text[] DEFAULT '{}';
ALTER TABLE public.user_profiles ADD COLUMN IF NOT EXISTS identity_documents jsonb DEFAULT '[]'::jsonb;

-- Add comments for documentation
COMMENT ON COLUMN public.user_profiles.bank_details IS 'Bank account information (IBAN, BIC, bank name, etc.)';
COMMENT ON COLUMN public.user_profiles.contracts_fees IS 'Array of contracts and fees information';
COMMENT ON COLUMN public.user_profiles.availability IS 'User availability calendar/schedule information';
COMMENT ON COLUMN public.user_profiles.skills IS 'Array of user skills/competencies';
COMMENT ON COLUMN public.user_profiles.identity_documents IS 'Array of identity documents (passport, ID card, etc.)';