-- Create a table for public chat messages from website visitors
CREATE TABLE public.public_chat_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  visitor_id TEXT NOT NULL, -- Anonymous visitor identifier (stored in localStorage)
  visitor_name TEXT,
  visitor_email TEXT,
  message TEXT NOT NULL,
  is_from_admin BOOLEAN NOT NULL DEFAULT false,
  admin_user_id UUID REFERENCES auth.users(id),
  is_read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.public_chat_messages ENABLE ROW LEVEL SECURITY;

-- Allow anyone to insert messages (visitors can send)
CREATE POLICY "Anyone can insert public chat messages"
ON public.public_chat_messages
FOR INSERT
WITH CHECK (true);

-- Allow visitors to read their own messages based on visitor_id
CREATE POLICY "Visitors can read their own messages"
ON public.public_chat_messages
FOR SELECT
USING (true);

-- Allow authenticated admins to manage all messages
CREATE POLICY "Admins can manage all public chat messages"
ON public.public_chat_messages
FOR ALL
USING (auth.uid() IS NOT NULL)
WITH CHECK (auth.uid() IS NOT NULL);

-- Enable realtime for this table
ALTER PUBLICATION supabase_realtime ADD TABLE public.public_chat_messages;