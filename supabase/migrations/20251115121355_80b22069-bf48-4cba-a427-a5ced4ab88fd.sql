-- Fix campaign_contact_lists to reference email_campaigns instead of campaigns

-- Drop existing foreign key constraint
ALTER TABLE campaign_contact_lists 
DROP CONSTRAINT IF EXISTS campaign_contact_lists_campaign_id_fkey;

-- Add new foreign key to email_campaigns
ALTER TABLE campaign_contact_lists
ADD CONSTRAINT campaign_contact_lists_campaign_id_fkey 
FOREIGN KEY (campaign_id) 
REFERENCES email_campaigns(id) 
ON DELETE CASCADE;

-- Drop existing RLS policy
DROP POLICY IF EXISTS "Users can manage own campaign contact lists" ON campaign_contact_lists;

-- Create updated RLS policy
CREATE POLICY "Users can manage own campaign contact lists"
ON campaign_contact_lists
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM email_campaigns
    WHERE email_campaigns.id = campaign_contact_lists.campaign_id
    AND email_campaigns.user_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM email_campaigns
    WHERE email_campaigns.id = campaign_contact_lists.campaign_id
    AND email_campaigns.user_id = auth.uid()
  )
);