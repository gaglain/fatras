-- Create messaging tables with enhanced features

-- Create channels table with private channels and user management
CREATE TABLE public.messaging_channels (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL, -- Owner of the channel
  name TEXT NOT NULL,
  description TEXT,
  type TEXT NOT NULL DEFAULT 'public' CHECK (type IN ('public', 'private', 'direct')),
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  roadshow_id UUID, -- Link to roadshow tour stops
  
  -- Constraints
  UNIQUE(name, user_id) WHERE type != 'direct'
);

-- Create channel members table for user permissions
CREATE TABLE public.messaging_channel_members (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  channel_id UUID NOT NULL REFERENCES public.messaging_channels(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('admin', 'member')),
  joined_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  last_read_at TIMESTAMP WITH TIME ZONE,
  
  UNIQUE(channel_id, user_id)
);

-- Create messages table
CREATE TABLE public.messaging_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  channel_id UUID NOT NULL REFERENCES public.messaging_channels(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  content TEXT NOT NULL,
  message_type TEXT NOT NULL DEFAULT 'text' CHECK (message_type IN ('text', 'image', 'file', 'system')),
  edited_at TIMESTAMP WITH TIME ZONE,
  reply_to_id UUID REFERENCES public.messaging_messages(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  -- For system messages or special formatting
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Enable Row Level Security
ALTER TABLE public.messaging_channels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messaging_channel_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messaging_messages ENABLE ROW LEVEL SECURITY;

-- RLS Policies for channels
CREATE POLICY "Users can view channels they are members of" 
ON public.messaging_channels 
FOR SELECT 
USING (
  id IN (
    SELECT channel_id 
    FROM public.messaging_channel_members 
    WHERE user_id = auth.uid()
  ) OR user_id = auth.uid()
);

CREATE POLICY "Users can create their own channels" 
ON public.messaging_channels 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Channel owners can update their channels" 
ON public.messaging_channels 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Channel owners can delete their channels" 
ON public.messaging_channels 
FOR DELETE 
USING (auth.uid() = user_id);

-- RLS Policies for channel members
CREATE POLICY "Users can view members of channels they belong to" 
ON public.messaging_channel_members 
FOR SELECT 
USING (
  channel_id IN (
    SELECT channel_id 
    FROM public.messaging_channel_members 
    WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Channel owners and admins can manage members" 
ON public.messaging_channel_members 
FOR ALL 
USING (
  channel_id IN (
    SELECT id 
    FROM public.messaging_channels 
    WHERE user_id = auth.uid()
  ) OR 
  channel_id IN (
    SELECT channel_id 
    FROM public.messaging_channel_members 
    WHERE user_id = auth.uid() AND role = 'admin'
  ) OR
  user_id = auth.uid() -- Users can manage their own membership
);

-- RLS Policies for messages
CREATE POLICY "Users can view messages in channels they belong to" 
ON public.messaging_messages 
FOR SELECT 
USING (
  channel_id IN (
    SELECT channel_id 
    FROM public.messaging_channel_members 
    WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Users can create messages in channels they belong to" 
ON public.messaging_messages 
FOR INSERT 
WITH CHECK (
  auth.uid() = user_id AND
  channel_id IN (
    SELECT channel_id 
    FROM public.messaging_channel_members 
    WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Users can update their own messages" 
ON public.messaging_messages 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own messages" 
ON public.messaging_messages 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create function to auto-update timestamps
CREATE OR REPLACE FUNCTION public.update_messaging_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for timestamp updates
CREATE TRIGGER update_messaging_channels_updated_at
  BEFORE UPDATE ON public.messaging_channels
  FOR EACH ROW
  EXECUTE FUNCTION public.update_messaging_updated_at();

-- Create function to create channel with creator as admin
CREATE OR REPLACE FUNCTION public.create_messaging_channel(
  channel_name TEXT,
  channel_description TEXT DEFAULT NULL,
  channel_type TEXT DEFAULT 'public',
  member_user_ids UUID[] DEFAULT ARRAY[]::UUID[],
  roadshow_ref_id UUID DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  new_channel_id UUID;
  member_id UUID;
BEGIN
  -- Create the channel
  INSERT INTO public.messaging_channels (user_id, name, description, type, roadshow_id)
  VALUES (auth.uid(), channel_name, channel_description, channel_type, roadshow_ref_id)
  RETURNING id INTO new_channel_id;
  
  -- Add creator as admin
  INSERT INTO public.messaging_channel_members (channel_id, user_id, role)
  VALUES (new_channel_id, auth.uid(), 'admin');
  
  -- Add other members if provided
  IF array_length(member_user_ids, 1) > 0 THEN
    FOREACH member_id IN ARRAY member_user_ids
    LOOP
      INSERT INTO public.messaging_channel_members (channel_id, user_id, role)
      VALUES (new_channel_id, member_id, 'member')
      ON CONFLICT (channel_id, user_id) DO NOTHING;
    END LOOP;
  END IF;
  
  RETURN new_channel_id;
END;
$$;

-- Create function to create direct message channel between two users
CREATE OR REPLACE FUNCTION public.create_direct_message_channel(
  other_user_id UUID
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  existing_channel_id UUID;
  new_channel_id UUID;
  dm_name TEXT;
BEGIN
  -- Check if DM channel already exists between these users
  SELECT c.id INTO existing_channel_id
  FROM public.messaging_channels c
  WHERE c.type = 'direct'
    AND c.id IN (
      SELECT cm1.channel_id 
      FROM public.messaging_channel_members cm1
      WHERE cm1.user_id = auth.uid()
      INTERSECT
      SELECT cm2.channel_id 
      FROM public.messaging_channel_members cm2
      WHERE cm2.user_id = other_user_id
    );
  
  IF existing_channel_id IS NOT NULL THEN
    RETURN existing_channel_id;
  END IF;
  
  -- Create new DM channel
  dm_name := 'DM-' || auth.uid()::text || '-' || other_user_id::text;
  
  INSERT INTO public.messaging_channels (user_id, name, type)
  VALUES (auth.uid(), dm_name, 'direct')
  RETURNING id INTO new_channel_id;
  
  -- Add both users as members
  INSERT INTO public.messaging_channel_members (channel_id, user_id, role)
  VALUES 
    (new_channel_id, auth.uid(), 'admin'),
    (new_channel_id, other_user_id, 'admin');
  
  RETURN new_channel_id;
END;
$$;