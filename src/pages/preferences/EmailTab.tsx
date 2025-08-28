import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Mail, Settings } from 'lucide-react';
import { EmailSignatureManager } from '@/components/email/EmailSignatureManager';

export const EmailTab: React.FC = () => {
  const [showSignatureManager, setShowSignatureManager] = useState(false);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Configuration Email
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4">
            <Button
              onClick={() => setShowSignatureManager(true)}
              variant="outline"
              className="justify-start"
            >
              <Settings className="h-4 w-4 mr-2" />
              Gérer la signature email
            </Button>
          </div>
        </CardContent>
      </Card>

      <EmailSignatureManager
        isOpen={showSignatureManager}
        onClose={() => setShowSignatureManager(false)}
      />
    </div>
  );
};