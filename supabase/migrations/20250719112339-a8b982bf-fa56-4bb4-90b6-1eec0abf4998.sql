-- Create table for email analytics
CREATE TABLE public.email_analytics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  campaign_id UUID NOT NULL,
  contact_id UUID NOT NULL,
  event_type TEXT NOT NULL CHECK (event_type IN ('sent', 'delivered', 'opened', 'clicked', 'bounced', 'unsubscribed')),
  event_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.email_analytics ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can manage own email analytics" 
ON public.email_analytics 
FOR ALL
USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX idx_email_analytics_campaign_id ON public.email_analytics(campaign_id);
CREATE INDEX idx_email_analytics_contact_id ON public.email_analytics(contact_id);
CREATE INDEX idx_email_analytics_event_type ON public.email_analytics(event_type);
CREATE INDEX idx_email_analytics_created_at ON public.email_analytics(created_at);

-- Add campaign analytics columns
ALTER TABLE public.campaigns 
ADD COLUMN IF NOT EXISTS sent_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS delivered_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS opened_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS clicked_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS bounced_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS unsubscribed_count INTEGER DEFAULT 0;