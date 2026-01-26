-- Drop the partial unique index that doesn't work well with ON CONFLICT
DROP INDEX IF EXISTS inbound_emails_message_id_user_id_unique;

-- Create a proper unique constraint on (user_id, message_id)
ALTER TABLE inbound_emails 
ADD CONSTRAINT inbound_emails_user_message_unique 
UNIQUE (user_id, message_id);

-- Also ensure the emails table has a similar constraint for upserts
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'emails_user_message_unique'
  ) THEN
    ALTER TABLE emails 
    ADD CONSTRAINT emails_user_message_unique 
    UNIQUE (user_id, message_id);
  END IF;
EXCEPTION WHEN duplicate_object THEN
  -- Constraint already exists, ignore
END $$;