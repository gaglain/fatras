-- Add VAT rate column to quotes for per-quote tax selection
ALTER TABLE public.quotes
ADD COLUMN IF NOT EXISTS vat_rate numeric NOT NULL DEFAULT 0;