
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { logger } from '@/lib/logger';

interface LogoSectionProps {
  siteName: string;
  logo: string;
  onSiteNameChange: (value: string) => void;
  onLogoChange: (value: string) => void;
}

export const LogoSection: React.FC<LogoSectionProps> = ({ 
  siteName, 
  logo, 
  onSiteNameChange, 
  onLogoChange 
}) => {
  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        logger.debug('📸 Logo uploaded');
        onLogoChange(result);
        toast.success('Logo chargé avec succès');
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Logo et Branding</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="siteName">Nom du site</Label>
          <Input
            id="siteName"
            value={siteName}
            onChange={(e) => onSiteNameChange(e.target.value)}
            placeholder="Nom de votre site"
          />
        </div>
        
        <div>
          <Label htmlFor="logo">Logo</Label>
          <div className="flex items-center space-x-4">
            <div className="flex-1">
              <Input
                id="logo"
                type="file"
                accept="image/*"
                onChange={handleLogoUpload}
              />
            </div>
            {logo && (
              <div className="flex flex-col items-center space-y-2">
                <img
                  src={logo}
                  alt="Logo"
                  className="h-12 w-12 object-contain border rounded"
                  onError={(e) => { 
                    logger.warn('❌ Logo loading error');
                    (e.currentTarget as HTMLImageElement).style.display = 'none'; 
                  }}
                />
                <Badge variant="secondary" className="text-xs">Logo chargé</Badge>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
