-- Add direction and sender info to emails
ALTER TABLE inbound_emails ADD COLUMN IF NOT EXISTS direction text DEFAULT 'received' CHECK (direction IN ('received', 'sent'));
ALTER TABLE inbound_emails ADD COLUMN IF NOT EXISTS sender_name text;

-- Create emails table for unified email management (sent/received)
CREATE TABLE IF NOT EXISTS emails (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users NOT NULL,
  message_id text,
  direction text NOT NULL CHECK (direction IN ('received', 'sent')),
  from_email text NOT NULL,
  from_name text,
  to_email text NOT NULL,
  to_name text,
  cc_emails text[] DEFAULT ARRAY[]::text[],
  bcc_emails text[] DEFAULT ARRAY[]::text[],
  subject text,
  content text,
  html_content text,
  status text DEFAULT 'delivered',
  provider text DEFAULT 'nylas',
  thread_id text,
  labels text[] DEFAULT ARRAY[]::text[],
  attachments jsonb DEFAULT '[]'::jsonb,
  contact_id uuid REFERENCES contacts(id),
  sent_at timestamp with time zone,
  received_at timestamp with time zone,
  read_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Enable RLS
ALTER TABLE emails ENABLE ROW LEVEL SECURITY;

-- Create policies
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

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_emails_updated_at
BEFORE UPDATE ON emails
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Create notifications table for email notifications
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

-- Enable RLS on notifications
ALTER TABLE email_notifications ENABLE ROW LEVEL SECURITY;

-- Create policies for notifications
CREATE POLICY "Users can view their own email notifications" 
ON email_notifications FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own email notifications" 
ON email_notifications FOR UPDATE 
USING (auth.uid() = user_id);

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