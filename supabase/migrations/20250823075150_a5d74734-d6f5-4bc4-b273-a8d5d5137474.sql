-- Create roadshow stops table
CREATE TABLE public.roadshow_stops (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  city TEXT NOT NULL,
  venue TEXT NOT NULL,
  address TEXT,
  event_date DATE,
  event_time TIME,
  check_in_time TIME,
  departure_time TIME,
  capacity INTEGER DEFAULT 0,
  tickets_available INTEGER DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('confirmed', 'pending', 'cancelled')),
  crew TEXT[] DEFAULT '{}',
  equipment TEXT[] DEFAULT '{}',
  notes TEXT,
  artists TEXT[] DEFAULT '{}',
  accommodation TEXT,
  accommodation_address TEXT,
  local_contact TEXT,
  local_contact_phone TEXT,
  transport TEXT,
  artist_lineup JSONB DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.roadshow_stops ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own roadshow stops" 
ON public.roadshow_stops 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own roadshow stops" 
ON public.roadshow_stops 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own roadshow stops" 
ON public.roadshow_stops 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own roadshow stops" 
ON public.roadshow_stops 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create function to update timestamps
CREATE TRIGGER update_roadshow_stops_updated_at
  BEFORE UPDATE ON public.roadshow_stops
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();