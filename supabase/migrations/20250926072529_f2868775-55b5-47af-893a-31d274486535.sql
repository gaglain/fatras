-- Enable realtime for messaging tables
ALTER TABLE public.messaging_messages REPLICA IDENTITY FULL;
ALTER TABLE public.messaging_channels REPLICA IDENTITY FULL;
ALTER TABLE public.messaging_channel_members REPLICA IDENTITY FULL;

-- Add tables to realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.messaging_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.messaging_channels;
ALTER PUBLICATION supabase_realtime ADD TABLE public.messaging_channel_members;