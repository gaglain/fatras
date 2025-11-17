import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Save, Mail, Eye } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuthContext } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { RichTextEditor } from '@/components/RichTextEditor';

interface EmailSignatureManagerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const EmailSignatureManager: React.FC<EmailSignatureManagerProps> = ({
  isOpen,
  onClose
}) => {
  const { user } = useAuth();
  const [signature, setSignature] = useState('');
  const [trackingEnabled, setTrackingEnabled] = useState(true);
  const [loading, setLoading] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    if (isOpen && user) {
      loadSignature();
    }
  }, [isOpen, user]);

  const loadSignature = async () => {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('email_signature, email_tracking_enabled')
        .eq('user_id', user?.id)
        .single();

      if (error) throw error;
      
      if (data) {
        setSignature(data.email_signature || '');
        setTrackingEnabled(data.email_tracking_enabled ?? true);
      }
    } catch (error) {
      console.error('Erreur lors du chargement de la signature:', error);
    }
  };

  const saveSignature = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('user_profiles')
        .update({
          email_signature: signature,
          email_tracking_enabled: trackingEnabled
        })
        .eq('user_id', user.id);

      if (error) throw error;

      toast.success('Signature email sauvegardée');
      onClose();
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      toast.error('Erreur lors de la sauvegarde de la signature');
    } finally {
      setLoading(false);
    }
  };

  const defaultSignature = `<p>--</p>
<p><strong>[Votre Nom]</strong><br>
[Votre Titre]<br>
Fatras Booking<br>
📧 [Votre Email]<br>
📞 [Votre Téléphone]</p>
<p>🌐 Visitez notre site: <a href="[URL]">[URL]</a></p>`;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Configuration de la signature email
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Configuration du tracking */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Paramètres de tracking</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-base font-medium">
                    Activer le tracking des emails
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Suivre les ouvertures et clics dans vos emails (comme HubSpot)
                  </p>
                </div>
                <Switch
                  checked={trackingEnabled}
                  onCheckedChange={setTrackingEnabled}
                />
              </div>
            </CardContent>
          </Card>

          {/* Configuration de la signature */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Signature personnalisée</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="signature">Votre signature</Label>
                <RichTextEditor
                  value={signature || defaultSignature}
                  onChange={setSignature}
                  placeholder="Votre signature..."
                  className="min-h-[200px]"
                />
                <p className="text-xs text-muted-foreground mt-2">
                  Formatez votre signature avec du texte riche, liens, couleurs, etc.
                </p>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setShowPreview(!showPreview)}
                >
                  <Eye className="h-4 w-4 mr-2" />
                  {showPreview ? 'Masquer' : 'Aperçu'}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setSignature(defaultSignature)}
                >
                  Utiliser le modèle par défaut
                </Button>
              </div>

              {showPreview && (
                <Card className="bg-muted/50">
                  <CardContent className="pt-4">
                    <h4 className="font-medium mb-2">Aperçu de la signature:</h4>
                    <div className="bg-background p-3 rounded border">
                      <div dangerouslySetInnerHTML={{ __html: signature || defaultSignature }} />
                    </div>
                  </CardContent>
                </Card>
              )}
            </CardContent>
          </Card>

          {/* Conseils */}
          <Card>
            <CardContent className="pt-6">
              <h4 className="font-medium mb-2">💡 Conseils pour une bonne signature:</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Gardez-la concise (4-6 lignes maximum)</li>
                <li>• Incluez vos informations de contact essentielles</li>
                <li>• Ajoutez vos réseaux sociaux professionnels</li>
                <li>• Évitez les images trop volumineuses</li>
                <li>• Testez l'affichage sur mobile et desktop</li>
              </ul>
            </CardContent>
          </Card>
        </div>

        <div className="flex justify-end space-x-2 pt-4 border-t">
          <Button variant="outline" onClick={onClose}>
            Annuler
          </Button>
          <Button onClick={saveSignature} disabled={loading}>
            <Save className="h-4 w-4 mr-2" />
            {loading ? 'Sauvegarde...' : 'Sauvegarder'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};