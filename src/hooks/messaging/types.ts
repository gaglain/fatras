export interface Channel {
  id: string;
  name: string;
  description?: string;
  type: 'public' | 'private' | 'direct';
  user_id: string;
  roadshow_id?: string;
  created_at: string;
  updated_at: string;
  is_active: boolean;
  unread_count?: number;
  members?: ChannelMember[];
}

export interface ChannelMember {
  id: string;
  channel_id: string;
  user_id: string;
  role: 'admin' | 'member';
  joined_at: string;
  last_read_at?: string;
  user_profile?: {
    first_name?: string;
    last_name?: string;
    username?: string;
  };
}

export interface Message {
  id: string;
  channel_id: string;
  user_id: string;
  content: string;
  message_type: 'text' | 'image' | 'file' | 'system';
  created_at: string;
  edited_at?: string;
  reply_to_id?: string;
  metadata?: unknown;
  user_profile?: {
    first_name?: string;
    last_name?: string;
    username?: string;
    avatar_url?: string;
  };
}

export interface MessagingUserProfile {
  user_id: string;
  first_name?: string;
  last_name?: string;
  username?: string;
  email?: string;
  avatar_url?: string;
  is_active?: boolean;
  role?: string;
}
