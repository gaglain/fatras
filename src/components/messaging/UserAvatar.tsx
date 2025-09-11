import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { MessageSquare, User } from 'lucide-react';

interface UserWithAvatar {
  user_id: string;
  username: string;
  first_name: string;
  last_name: string;
  email: string;
  avatar_url?: string;
  role: string;
  is_active: boolean;
}

interface UserAvatarProps {
  user: UserWithAvatar;
  size?: 'sm' | 'md' | 'lg';
  showName?: boolean;
  showStatus?: boolean;
  onClick?: () => void;
  className?: string;
}

export const UserAvatar: React.FC<UserAvatarProps> = ({
  user,
  size = 'md',
  showName = false,
  showStatus = false,
  onClick,
  className = ''
}) => {
  const sizeClasses = {
    sm: 'h-6 w-6',
    md: 'h-8 w-8',
    lg: 'h-12 w-12'
  };

  const initials = `${user.first_name?.[0] || ''}${user.last_name?.[0] || ''}`.toUpperCase() || user.username?.[0]?.toUpperCase() || 'U';

  const AvatarComponent = (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className="relative">
        <Avatar className={`${sizeClasses[size]} ${onClick ? 'cursor-pointer hover:opacity-80' : ''}`}>
          <AvatarImage src={user.avatar_url} alt={`${user.first_name} ${user.last_name}`} />
          <AvatarFallback className="bg-primary text-primary-foreground text-xs">
            {initials}
          </AvatarFallback>
        </Avatar>
        {showStatus && (
          <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white ${
            user.is_active ? 'bg-green-500' : 'bg-gray-400'
          }`} />
        )}
      </div>
      
      {showName && (
        <div className="flex flex-col min-w-0">
          <span className="text-sm font-medium truncate">
            {user.first_name} {user.last_name}
          </span>
          <div className="flex items-center gap-1">
            <span className="text-xs text-muted-foreground truncate">
              @{user.username}
            </span>
            {user.role && (
              <Badge variant="outline" className="text-xs px-1 py-0">
                {user.role}
              </Badge>
            )}
          </div>
        </div>
      )}
    </div>
  );

  if (onClick) {
    return (
      <button onClick={onClick} className="text-left">
        {AvatarComponent}
      </button>
    );
  }

  return AvatarComponent;
};