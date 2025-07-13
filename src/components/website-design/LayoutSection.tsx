
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface LayoutSectionProps {
  headerBg: string;
  footerBg: string;
  onHeaderBgChange: (value: string) => void;
  onFooterBgChange: (value: string) => void;
}

export const LayoutSection: React.FC<LayoutSectionProps> = ({
  headerBg,
  footerBg,
  onHeaderBgChange,
  onFooterBgChange
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Header et Footer</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="headerBg">Couleur de fond du header</Label>
            <Input
              id="headerBg"
              value={headerBg}
              onChange={(e) => onHeaderBgChange(e.target.value)}
              placeholder="ex: #1a1f2e ou linear-gradient(...)"
            />
          </div>

          <div>
            <Label htmlFor="footerBg">Couleur de fond du footer</Label>
            <Input
              id="footerBg"
              value={footerBg}
              onChange={(e) => onFooterBgChange(e.target.value)}
              placeholder="ex: #1a1f2e ou linear-gradient(...)"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
