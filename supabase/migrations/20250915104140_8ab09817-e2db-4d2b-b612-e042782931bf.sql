-- Drop existing policies if they exist to avoid conflicts
DROP POLICY IF EXISTS "Users can view their own emails" ON emails;
DROP POLICY IF EXISTS "Users can create their own emails" ON emails;
DROP POLICY IF EXISTS "Users can update their own emails" ON emails;  
DROP POLICY IF EXISTS "Users can delete their own emails" ON emails;

-- Alter existing emails table to add new columns
ALTER TABLE emails ADD COLUMN IF NOT EXISTS message_id text;
ALTER TABLE emails ADD COLUMN IF NOT EXISTS direction text DEFAULT 'sent' CHECK (direction IN ('received', 'sent'));
ALTER TABLE emails ADD COLUMN IF NOT EXISTS from_name text;
ALTER TABLE emails ADD COLUMN IF NOT EXISTS to_name text;
ALTER TABLE emails ADD COLUMN IF NOT EXISTS cc_emails text[] DEFAULT ARRAY[]::text[];
ALTER TABLE emails ADD COLUMN IF NOT EXISTS bcc_emails text[] DEFAULT ARRAY[]::text[];
ALTER TABLE emails ADD COLUMN IF NOT EXISTS provider text DEFAULT 'nylas';
ALTER TABLE emails ADD COLUMN IF NOT EXISTS thread_id text;
ALTER TABLE emails ADD COLUMN IF NOT EXISTS labels text[] DEFAULT ARRAY[]::text[];
ALTER TABLE emails ADD COLUMN IF NOT EXISTS contact_id uuid REFERENCES contacts(id);
ALTER TABLE emails ADD COLUMN IF NOT EXISTS received_at timestamp with time zone;
ALTER TABLE emails ADD COLUMN IF NOT EXISTS read_at timestamp with time zone;

-- Update the table structure for better email management
ALTER TABLE emails ALTER COLUMN from_email DROP NOT NULL;
ALTER TABLE emails ALTER COLUMN to_email DROP NOT NULL;
ALTER TABLE emails ALTER COLUMN subject DROP NOT NULL;
ALTER TABLE emails ALTER COLUMN content DROP NOT NULL;
ALTER TABLE emails ALTER COLUMN status DROP NOT NULL;

-- Add sender_name to inbound_emails
ALTER TABLE inbound_emails ADD COLUMN IF NOT EXISTS direction text DEFAULT 'received' CHECK (direction IN ('received', 'sent'));
ALTER TABLE inbound_emails ADD COLUMN IF NOT EXISTS sender_name text;

-- Create email_notifications table
CREATE TABLE IF NOT EXISTS email_notifications (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users NOT NULL,
  email_id uuid REFERENCES emails(id),
  type text NOT NULL CHECK (type IN ('new_email', 'email_sent', 'email_failed')),
  title text NOT NULL,
  message text,
  is_read boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now()
);

-- Enable RLS on tables
ALTER TABLE emails ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_notifications ENABLE ROW LEVEL SECURITY;

-- Create policies for emails
CREATE POLICY "Users can view their own emails" 
ON emails FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own emails" 
ON emails FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own emails" 
ON emails FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own emails" 
ON emails FOR DELETE 
USING (auth.uid() = user_id);

-- Create policies for notifications
CREATE POLICY "Users can view their own email notifications" 
ON email_notifications FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own email notifications" 
ON email_notifications FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own email notifications" 
ON email_notifications FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_emails_user_id ON emails(user_id);
CREATE INDEX IF NOT EXISTS idx_emails_direction ON emails(direction);
CREATE INDEX IF NOT EXISTS idx_emails_from_email ON emails(from_email);
CREATE INDEX IF NOT EXISTS idx_emails_to_email ON emails(to_email);
CREATE INDEX IF NOT EXISTS idx_emails_contact_id ON emails(contact_id);
CREATE INDEX IF NOT EXISTS idx_emails_received_at ON emails(received_at DESC);
CREATE INDEX IF NOT EXISTS idx_emails_sent_at ON emails(sent_at DESC);
CREATE INDEX IF NOT EXISTS idx_email_notifications_user_id ON email_notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_email_notifications_is_read ON email_notifications(is_read);

-- Function to link emails to contacts automatically
CREATE OR REPLACE FUNCTION link_email_to_contact()
RETURNS TRIGGER AS $$
DECLARE
  contact_record UUID;
BEGIN
  -- Try to find contact by email (received emails: from_email, sent emails: to_email)
  IF NEW.direction = 'received' THEN
    SELECT id INTO contact_record 
    FROM contacts 
    WHERE user_id = NEW.user_id 
    AND email = NEW.from_email
    LIMIT 1;
  ELSE
    SELECT id INTO contact_record 
    FROM contacts 
    WHERE user_id = NEW.user_id 
    AND email = NEW.to_email
    LIMIT 1;
  END IF;
  
  -- Link to contact if found
  IF contact_record IS NOT NULL THEN
    NEW.contact_id = contact_record;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-link emails to contacts
CREATE TRIGGER link_email_to_contact_trigger
BEFORE INSERT ON emails
FOR EACH ROW
EXECUTE FUNCTION link_email_to_contact();

-- Function to create email notifications
CREATE OR REPLACE FUNCTION create_email_notification()
RETURNS TRIGGER AS $$
BEGIN
  -- Create notification for new received emails
  IF NEW.direction = 'received' AND OLD IS NULL THEN
    INSERT INTO email_notifications (user_id, email_id, type, title, message)
    VALUES (
      NEW.user_id,
      NEW.id,
      'new_email',
      'Nouveau email reçu',
      'De: ' || COALESCE(NEW.from_name, NEW.from_email) || ' - ' || COALESCE(NEW.subject, '(Aucun sujet)')
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for email notifications
CREATE TRIGGER create_email_notification_trigger
AFTER INSERT ON emails
FOR EACH ROW
EXECUTE FUNCTION create_email_notification();