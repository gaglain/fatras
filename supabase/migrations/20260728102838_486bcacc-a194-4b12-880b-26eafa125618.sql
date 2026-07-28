ALTER TABLE public.quotes ADD COLUMN IF NOT EXISTS owner_id uuid;
UPDATE public.quotes SET owner_id = user_id WHERE owner_id IS NULL;