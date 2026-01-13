import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Settings, 
  Mail, 
  Server,
  Eye,
  Loader2 
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useEmailSync } from '@/hooks/useEmailSync';
import { toast } from 'sonner';

interface DiagnosticResult {
  name: string;
  status: 'success' | 'warning' | 'error' | 'pending';
  message: string;
  details?: string;
}

export const EmailDiagnostic: React.FC = () => {
  const { user } = useAuth();
  const { testImapConnection } = useEmailSync();
  const [results, setResults] = useState<DiagnosticResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [emailConfig, setEmailConfig] = useState<any>({});

  useEffect(() => {
    if (user) {
      loadConfig();
    }
  }, [user]);

  const loadConfig = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('app_settings')
        .select('setting_key, setting_value')
        .eq('user_id', user.id)
        .in('setting_key', [
          'imap_host', 'imap_port', 'imap_username', 'imap_password', 'imap_security',
          'from_email', 'smtp_host', 'smtp_port', 'smtp_username', 'smtp_password'
        ]);
      
      if (error) throw error;
      
      const config: any = {};
      data?.forEach(setting => {
        config[setting.setting_key] = setting.setting_value;
      });
      setEmailConfig(config);
    } catch {
      // Config loading failed silently
    }
  };

  const runDiagnostic = async () => {
    setIsRunning(true);
    const diagnosticResults: DiagnosticResult[] = [];

    try {
      // Test 1: Configuration IMAP
      if (!emailConfig.imap_host || !emailConfig.imap_username || !emailConfig.imap_password) {
        diagnosticResults.push({
          name: 'Configuration IMAP',
          status: 'error',
          message: 'Configuration IMAP incomplète',
          details: 'Configurez votre serveur IMAP dans Préférences → Email'
        });
      } else {
        diagnosticResults.push({
          name: 'Configuration IMAP',
          status: 'success',
          message: 'Configuration IMAP présente',
          details: `Serveur: ${emailConfig.imap_host}:${emailConfig.imap_port}`
        });

        // Test 2: Connexion IMAP
        try {
          await testImapConnection();
          diagnosticResults.push({
            name: 'Connexion IMAP',
            status: 'success',
            message: 'Connexion IMAP réussie',
            details: 'Le serveur IMAP répond correctement'
          });
        } catch (error: any) {
          diagnosticResults.push({
            name: 'Connexion IMAP',
            status: 'error',
            message: 'Échec de la connexion IMAP',
            details: error.message || 'Vérifiez vos identifiants et paramètres'
          });
        }
      }

      // Test 3: Configuration d'envoi
      if (!emailConfig.from_email) {
        diagnosticResults.push({
          name: 'Email d\'envoi',
          status: 'warning',
          message: 'Email d\'envoi non configuré',
          details: 'Configurez votre email d\'envoi dans Préférences → Email'
        });
      } else {
        diagnosticResults.push({
          name: 'Email d\'envoi',
          status: 'success',
          message: 'Email d\'envoi configuré',
          details: `Expéditeur: ${emailConfig.from_email}`
        });
      }

      // Test 4: Clé API Resend (côté client, on ne peut pas vérifier directement)
      diagnosticResults.push({
        name: 'Clé API Resend',
        status: 'warning',
        message: 'Clé API Resend à vérifier',
        details: 'Vérifiez que la clé RESEND_API_KEY est configurée côté serveur'
      });

      // Test 5: Emails reçus
      const { data: emailCount } = await supabase
        .from('inbound_emails')
        .select('id', { count: 'exact' })
        .eq('user_id', user.id);

      if (!emailCount || emailCount.length === 0) {
        diagnosticResults.push({
          name: 'Emails reçus',
          status: 'warning',
          message: 'Aucun email synchronisé',
          details: 'Essayez de synchroniser vos emails manuellement'
        });
      } else {
        diagnosticResults.push({
          name: 'Emails reçus',
          status: 'success',
          message: `${emailCount.length} emails trouvés`,
          details: 'Des emails ont été synchronisés avec succès'
        });
      }

    } catch (error: any) {
      diagnosticResults.push({
        name: 'Diagnostic général',
        status: 'error',
        message: 'Erreur lors du diagnostic',
        details: error.message
      });
    }

    setResults(diagnosticResults);
    setIsRunning(false);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case 'error':
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Loader2 className="h-5 w-5 animate-spin text-blue-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'success':
        return <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">OK</Badge>;
      case 'warning':
        return <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100">Attention</Badge>;
      case 'error':
        return <Badge className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100">Erreur</Badge>;
      default:
        return <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100">Test</Badge>;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Mail className="h-5 w-5" />
          Diagnostic Email
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Button onClick={runDiagnostic} disabled={isRunning}>
            {isRunning ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Diagnostic en cours...
              </>
            ) : (
              <>
                <Eye className="h-4 w-4 mr-2" />
                Lancer le diagnostic
              </>
            )}
          </Button>
          <Button 
            variant="outline" 
            onClick={() => window.open('/preferences?tab=email', '_blank')}
          >
            <Settings className="h-4 w-4 mr-2" />
            Configurer
          </Button>
        </div>

        {results.length > 0 && (
          <div className="space-y-3">
            <h4 className="font-medium">Résultats du diagnostic :</h4>
            {results.map((result, index) => (
              <Alert key={index} className="p-4">
                <div className="flex items-start gap-3">
                  {getStatusIcon(result.status)}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium">{result.name}</span>
                      {getStatusBadge(result.status)}
                    </div>
                    <p className="text-sm">{result.message}</p>
                    {result.details && (
                      <p className="text-xs text-muted-foreground mt-1">
                        {result.details}
                      </p>
                    )}
                  </div>
                </div>
              </Alert>
            ))}
          </div>
        )}

        {results.length === 0 && !isRunning && (
          <Alert>
            <AlertDescription>
              Lancez le diagnostic pour vérifier la configuration de votre système email.
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
};