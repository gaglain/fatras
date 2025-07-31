-- Add scheduling fields to email_campaigns table if not exists
DO $$ 
BEGIN
    -- Add scheduled_for column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'email_campaigns' AND column_name = 'scheduled_for') THEN
        ALTER TABLE email_campaigns ADD COLUMN scheduled_for timestamp with time zone;
    END IF;
    
    -- Add auto_send column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'email_campaigns' AND column_name = 'auto_send') THEN
        ALTER TABLE email_campaigns ADD COLUMN auto_send boolean DEFAULT false;
    END IF;
END $$;