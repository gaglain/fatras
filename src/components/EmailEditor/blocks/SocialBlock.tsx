import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Share2, Settings } from 'lucide-react';

export interface SocialBlockContent {
  platforms: Array<{
    type: 'facebook' | 'instagram' | 'linkedin' | 'youtube';
    url: string;
    enabled: boolean;
    color?: string;
  }>;
  align: 'left' | 'center' | 'right';
  iconSize: number;
  spacing: number;
}

interface SocialBlockProps {
  content: SocialBlockContent;
  onChange: (content: SocialBlockContent) => void;
}

export const SocialBlock: React.FC<SocialBlockProps> = ({ content, onChange }) => {
  const [showSettings, setShowSettings] = useState(false);

  // Inline brand SVGs for cleaner, consistent look in emails
  const renderLogo = (type: 'facebook' | 'instagram' | 'linkedin' | 'youtube', size = 14) => {
    const common = { width: size, height: size, viewBox: '0 0 24 24', fill: 'currentColor' } as const;
    switch (type) {
      case 'facebook':
        return (
          <svg {...common} aria-hidden="true">
            <path d="M22 12a10 10 0 1 0-11.56 9.9v-7h-2.2V12h2.2V9.8c0-2.17 1.29-3.37 3.27-3.37.95 0 1.94.17 1.94.17v2.13h-1.09c-1.07 0-1.41.66-1.41 1.34V12h2.4l-.38 2.9h-2.02v7A10 10 0 0 0 22 12z" />
          </svg>
        );
      case 'instagram':
        return (
          <svg {...common} aria-hidden="true">
            <path d="M7 2h10a5 5 0 0 1 5 5v10a5 5 0 0 1-5 5H7a5 5 0 0 1-5-5V7a5 5 0 0 1 5-5zm5 5a5 5 0 1 0 0 10 5 5 0 0 0 0-10zm6-1.25a1.25 1.25 0 1 0 0 2.5 1.25 1.25 0 0 0 0-2.5zM12 9a3 3 0 1 1 0 6 3 3 0 0 1 0-6z" />
          </svg>
        );
      case 'linkedin':
        return (
          <svg {...common} aria-hidden="true">
            <path d="M4.98 3.5C4.98 4.61 4.1 5.5 3 5.5S1.02 4.61 1.02 3.5C1.02 2.39 1.9 1.5 3 1.5s1.98.89 1.98 2zM1 8h4v13H1zM9 8h3.8v1.8h.05c.53-1 1.84-2.05 3.78-2.05 4.04 0 4.79 2.66 4.79 6.12V21H17v-5.3c0-1.27-.02-2.91-1.77-2.91-1.77 0-2.04 1.38-2.04 2.82V21H9z" />
          </svg>
        );
      case 'youtube':
        return (
          <svg {...common} aria-hidden="true">
            <path d="M23.5 7.2a3 3 0 0 0-2.1-2.1C19.5 4.5 12 4.5 12 4.5s-7.5 0-9.4.6A3 3 0 0 0 .5 7.2C0 9.1 0 12 0 12s0 2.9.5 4.8a3 3 0 0 0 2.1 2.1c1.9.6 9.4.6 9.4.6s7.5 0 9.4-.6a3 3 0 0 0 2.1-2.1c.5-1.9.5-4.8.5-4.8s0-2.9-.5-4.8zM9.75 15.02V8.98L15.5 12l-5.75 3.02z" />
          </svg>
        );
    }
  };

  const platformColors = {
    facebook: '#1877F2',
    instagram: '#E4405F',
    linkedin: '#0A66C2',
    youtube: '#FF0000'
  } as const;
  const platformTypes: Array<'facebook' | 'instagram' | 'linkedin' | 'youtube'> = ['facebook', 'instagram', 'linkedin', 'youtube'];

  // Initialize platforms if empty
  if (!content.platforms || content.platforms.length === 0) {
    const initialPlatforms = platformTypes.map(type => ({
      type,
      url: '',
      enabled: false,
      color: platformColors[type]
    }));
    onChange({ ...content, platforms: initialPlatforms });
  }

  const updatePlatform = (type: string, updates: Partial<{ url: string; enabled: boolean; color: string }>) => {
    const updatedPlatforms = content.platforms.map(p => 
      p.type === type ? { ...p, ...updates } : p
    );
    onChange({ ...content, platforms: updatedPlatforms });
  };

  if (showSettings) {
    return (
      <div className="space-y-4 p-4 border rounded-lg bg-muted/30">
        <div className="flex items-center justify-between">
          <Label className="flex items-center gap-2">
            <Share2 className="h-4 w-4" />
            Configuration des réseaux sociaux
          </Label>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowSettings(false)}
          >
            Fermer
          </Button>
        </div>
        
        <div className="space-y-4">
          {content.platforms?.map((platform) => {
            return (
              <div key={platform.type} className="border rounded-lg p-3">
                <div className="flex items-center justify-between mb-2">
                  <Label className="flex items-center gap-2 capitalize">
                    <span
                      className="inline-flex items-center justify-center rounded-full"
                      style={{ width: 18, height: 18, backgroundColor: platform.color || platformColors[platform.type], color: '#fff' }}
                    >
                      {renderLogo(platform.type, 12)}
                    </span>
                    {platform.type}
                  </Label>
                  <Switch
                    checked={platform.enabled}
                    onCheckedChange={(enabled) => updatePlatform(platform.type, { enabled })}
                  />
                </div>
                {platform.enabled && (
                  <Input
                    value={platform.url}
                    onChange={(e) => updatePlatform(platform.type, { url: e.target.value })}
                    placeholder={`URL ${platform.type}`}
                    className="mt-2"
                  />
                )}
              </div>
            );
          })}
          
          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label htmlFor="alignment">Alignement</Label>
              <Select
                value={content.align || 'center'}
                onValueChange={(value: 'left' | 'center' | 'right') => 
                  onChange({ ...content, align: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="left">Gauche</SelectItem>
                  <SelectItem value="center">Centre</SelectItem>
                  <SelectItem value="right">Droite</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="iconSize">Taille des icônes</Label>
              <Input
                id="iconSize"
                type="number"
                value={content.iconSize}
                onChange={(e) => onChange({ ...content, iconSize: parseInt(e.target.value) || 24 })}
                min="16"
                max="48"
              />
            </div>
            <div>
              <Label htmlFor="spacing">Espacement</Label>
              <Input
                id="spacing"
                type="number"
                value={content.spacing}
                onChange={(e) => onChange({ ...content, spacing: parseInt(e.target.value) || 12 })}
                min="4"
                max="32"
              />
            </div>
          </div>
        </div>
      </div>
    );
  }

  const enabledPlatforms = content.platforms?.filter(p => p.enabled && p.url) || [];

  return (
    <div className="group relative">
      <Button
        variant="ghost"
        size="sm"
        className="absolute top-0 right-0 opacity-0 group-hover:opacity-100 transition-opacity"
        onClick={() => setShowSettings(true)}
      >
        <Settings className="h-4 w-4" />
      </Button>
      <div
        style={{ textAlign: content.align || 'center' }}
        onClick={() => setShowSettings(true)}
        className="p-4 hover:bg-muted/20 rounded transition-colors cursor-pointer"
      >
        {enabledPlatforms.length > 0 ? (
          <div className="flex items-center gap-3" style={{ justifyContent: content.align === 'left' ? 'flex-start' : content.align === 'right' ? 'flex-end' : 'center' }}>
              {enabledPlatforms.map((platform) => (
                <a
                  key={platform.type}
                  href={platform.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center hover:opacity-80 transition-opacity"
                  style={{ 
                    lineHeight: 0,
                    color: platform.color || platformColors[platform.type]
                  }}
                  aria-label={`Ouvrir ${platform.type}`}
                >
                  {renderLogo(platform.type, Math.max(16, content.iconSize))}
                  <span className="sr-only">{`Ouvrir ${platform.type}`}</span>
                </a>
              ))}
          </div>
        ) : (
          <div className="text-center text-gray-500 py-4">
            <Share2 className="h-8 w-8 mx-auto mb-2 text-gray-300" />
            <p>Cliquez pour configurer les réseaux sociaux</p>
          </div>
        )}
      </div>
    </div>
  );
};