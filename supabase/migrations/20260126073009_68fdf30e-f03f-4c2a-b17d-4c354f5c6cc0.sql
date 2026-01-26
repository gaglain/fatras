-- Add grant_id column to email_accounts table
ALTER TABLE email_accounts 
ADD COLUMN IF NOT EXISTS grant_id TEXT;

-- Update the grant_id for the Gmail account with the value from Nylas
UPDATE email_accounts 
SET grant_id = '1689aa22-c0cc-48b2-ac09-6f221aff790f'
WHERE email = 'fatrasplanning@gmail.com';

-- Update the grant_id for the IMAP account with the value from Nylas  
UPDATE email_accounts
SET grant_id = '62ce2f4d-58f6-49e8-8c2e-9fd390b81643'
WHERE email = 'booking@fatras.net';

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_email_accounts_grant_id ON email_accounts(grant_id);