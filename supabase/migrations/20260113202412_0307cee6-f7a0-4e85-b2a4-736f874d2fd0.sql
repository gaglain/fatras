-- Index pour accélérer les requêtes de messagerie
CREATE INDEX IF NOT EXISTS idx_messaging_channel_members_user_id 
ON public.messaging_channel_members(user_id);

CREATE INDEX IF NOT EXISTS idx_messaging_channel_members_channel_id 
ON public.messaging_channel_members(channel_id);

CREATE INDEX IF NOT EXISTS idx_messaging_channels_type_active 
ON public.messaging_channels(type, is_active);

CREATE INDEX IF NOT EXISTS idx_messaging_channels_updated_at 
ON public.messaging_channels(updated_at DESC);

CREATE INDEX IF NOT EXISTS idx_messaging_messages_channel_created 
ON public.messaging_messages(channel_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_messaging_messages_user_id 
ON public.messaging_messages(user_id);