
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, XCircle, AlertTriangle, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

export const GoogleIntegrationDiagnostic: React.FC = () => {
  const [gmailApiKey, setGmailApiKey] = useState('');
  const [calendarApiKey, setCalendarApiKey] = useState('');
  const [testResults, setTestResults] = useState<{
    gmail: 'success' | 'error' | 'pending' | null;
    calendar: 'success' | 'error' | 'pending' | null;
    errors: string[];
  }>({
    gmail: null,
    calendar: null,
    errors: []
  });

  const testGmailConnection = async () => {
    if (!gmailApiKey.trim()) {
      toast.error('Veuillez entrer votre clé API Gmail');
      return;
    }

    setTestResults(prev => ({ ...prev, gmail: 'pending', errors: [] }));

    try {
      // Test basique de validation de la clé API
      const response = await fetch(`https://www.googleapis.com/gmail/v1/users/me/profile?key=${gmailApiKey}`);
      
      if (response.ok) {
        setTestResults(prev => ({ ...prev, gmail: 'success' }));
        toast.success('Connexion Gmail réussie');
      } else {
        const errorData = await response.json();
        setTestResults(prev => ({ 
          ...prev, 
          gmail: 'error',
          errors: [`Gmail: ${errorData.error?.message || 'Erreur inconnue'}`]
        }));
        toast.error('Erreur de connexion Gmail');
      }
    } catch (error: any) {
      setTestResults(prev => ({ 
        ...prev, 
        gmail: 'error',
        errors: [`Gmail: ${error.message || 'Erreur de réseau'}`]
      }));
      toast.error('Erreur lors du test Gmail');
    }
  };

  const testCalendarConnection = async () => {
    if (!calendarApiKey.trim()) {
      toast.error('Veuillez entrer votre clé API Google Calendar');
      return;
    }

    setTestResults(prev => ({ ...prev, calendar: 'pending', errors: [] }));

    try {
      // Test basique de validation de la clé API
      const response = await fetch(`https://www.googleapis.com/calendar/v3/calendars/primary?key=${calendarApiKey}`);
      
      if (response.ok) {
        setTestResults(prev => ({ ...prev, calendar: 'success' }));
        toast.success('Connexion Google Calendar réussie');
      } else {
        const errorData = await response.json();
        setTestResults(prev => ({ 
          ...prev, 
          calendar: 'error',
          errors: [`Calendar: ${errorData.error?.message || 'Erreur inconnue'}`]
        }));
        toast.error('Erreur de connexion Google Calendar');
      }
    } catch (error: any) {
      setTestResults(prev => ({ 
        ...prev, 
        calendar: 'error',
        errors: [`Calendar: ${error.message || 'Erreur de réseau'}`]
      }));
      toast.error('Erreur lors du test Google Calendar');
    }
  };

  const getStatusIcon = (status: 'success' | 'error' | 'pending' | null) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'error':
        return <XCircle className="h-5 w-5 text-red-600" />;
      case 'pending':
        return <RefreshCw className="h-5 w-5 text-blue-600 animate-spin" />;
      default:
        return <AlertTriangle className="h-5 w-5 text-gray-400" />;
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Diagnostic des Intégrations Google</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Gmail */}
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              {getStatusIcon(testResults.gmail)}
              <Label htmlFor="gmail-api">Clé API Gmail</Label>
            </div>
            <div className="flex space-x-2">
              <Input
                id="gmail-api"
                type="password"
                value={gmailApiKey}
                onChange={(e) => setGmailApiKey(e.target.value)}
                placeholder="Entrez votre clé d'API Gmail"
                className="flex-1"
              />
              <Button 
                onClick={testGmailConnection}
                disabled={testResults.gmail === 'pending'}
              >
                Tester
              </Button>
            </div>
          </div>

          {/* Google Calendar */}
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              {getStatusIcon(testResults.calendar)}
              <Label htmlFor="calendar-api">Clé API Google Calendar</Label>
            </div>
            <div className="flex space-x-2">
              <Input
                id="calendar-api"
                type="password"
                value={calendarApiKey}
                onChange={(e) => setCalendarApiKey(e.target.value)}
                placeholder="Entrez votre clé d'API Google Calendar"
                className="flex-1"
              />
              <Button 
                onClick={testCalendarConnection}
                disabled={testResults.calendar === 'pending'}
              >
                Tester
              </Button>
            </div>
          </div>

          {/* Erreurs */}
          {testResults.errors.length > 0 && (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <div className="space-y-1">
                  <strong>Erreurs détectées :</strong>
                  {testResults.errors.map((error, index) => (
                    <div key={index} className="text-sm text-red-600">
                      • {error}
                    </div>
                  ))}
                </div>
              </AlertDescription>
            </Alert>
          )}

          {/* Instructions */}
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <div className="space-y-2">
                <strong>Instructions :</strong>
                <ol className="list-decimal list-inside space-y-1 text-sm">
                  <li>Créez un projet dans Google Cloud Console</li>
                  <li>Activez les APIs Gmail et Google Calendar</li>
                  <li>Créez des identifiants (clés API)</li>
                  <li>Configurez les domaines autorisés</li>
                  <li>Testez vos clés API ici</li>
                </ol>
                <p className="text-sm text-blue-600">
                  <strong>Note :</strong> En production, utilisez OAuth2 au lieu des clés API directes pour plus de sécurité.
                </p>
              </div>
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
  );
};
