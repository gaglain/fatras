-- Create contact lists table
CREATE TABLE public.contact_lists (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create contact list members (many-to-many relation)
CREATE TABLE public.contact_list_members (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  contact_list_id UUID NOT NULL REFERENCES public.contact_lists(id) ON DELETE CASCADE,
  contact_id UUID NOT NULL REFERENCES public.contacts(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(contact_list_id, contact_id)
);

-- Create campaign contact lists (many-to-many relation)
CREATE TABLE public.campaign_contact_lists (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  campaign_id UUID NOT NULL REFERENCES public.campaigns(id) ON DELETE CASCADE,
  contact_list_id UUID NOT NULL REFERENCES public.contact_lists(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(campaign_id, contact_list_id)
);

-- Enable Row Level Security
ALTER TABLE public.contact_lists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_list_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaign_contact_lists ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for contact_lists
CREATE POLICY "Users can manage own contact lists" 
ON public.contact_lists 
FOR ALL 
USING (auth.uid() = user_id);

-- Create RLS policies for contact_list_members
CREATE POLICY "Users can manage own contact list members" 
ON public.contact_list_members 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM public.contact_lists 
  WHERE contact_lists.id = contact_list_members.contact_list_id 
  AND contact_lists.user_id = auth.uid()
));

-- Create RLS policies for campaign_contact_lists
CREATE POLICY "Users can manage own campaign contact lists" 
ON public.campaign_contact_lists 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM public.campaigns 
  WHERE campaigns.id = campaign_contact_lists.campaign_id 
  AND campaigns.user_id = auth.uid()
));

-- Create triggers for updated_at columns
CREATE TRIGGER update_contact_lists_updated_at
BEFORE UPDATE ON public.contact_lists
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();