-- Add owner_id column to contacts, opportunities, and events tables
-- This allows assigning a user as the owner/responsible person for each entity

-- Add owner_id to contacts
ALTER TABLE public.contacts 
ADD COLUMN IF NOT EXISTS owner_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;

-- Add owner_id to opportunities
ALTER TABLE public.opportunities 
ADD COLUMN IF NOT EXISTS owner_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;

-- Add owner_id to events
ALTER TABLE public.events 
ADD COLUMN IF NOT EXISTS owner_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_contacts_owner_id ON public.contacts(owner_id);
CREATE INDEX IF NOT EXISTS idx_opportunities_owner_id ON public.opportunities(owner_id);
CREATE INDEX IF NOT EXISTS idx_events_owner_id ON public.events(owner_id);