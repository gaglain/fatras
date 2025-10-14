-- Add quote_id column to roadshow_stops table
ALTER TABLE roadshow_stops 
ADD COLUMN IF NOT EXISTS quote_id uuid REFERENCES quotes(id) ON DELETE SET NULL;

-- Add index for better query performance
CREATE INDEX IF NOT EXISTS idx_roadshow_stops_quote_id ON roadshow_stops(quote_id);

-- Add comment for documentation
COMMENT ON COLUMN roadshow_stops.quote_id IS 'Reference to the quote that created this roadshow stop';