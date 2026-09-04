import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Save, Mail, Eye } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { RichTextEditor } from '@/components/RichTextEditor';
import { addAvatarToEmailSignature, EMAIL_SIGNATURE_UPDATED_EVENT } from '@/hooks/useEmailSignature';

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
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && user) {
      loadSignature();
    }
  }, [isOpen, user]);

  const loadSignature = async () => {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('email_signature, email_tracking_enabled, avatar_url')
        .eq('user_id', user?.id)
        .single();

      if (error) throw error;
      
      if (data) {
        // Keep only the editable signature in the database. The avatar is
        // composed dynamically so changing it never leaves an old image embedded.
        setSignature(data.email_signature || '');
        setAvatarUrl(data.avatar_url || null);
        setTrackingEnabled(data.email_tracking_enabled ?? true);
      }
    } catch {
      // Silent error - signature not loaded
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

      window.dispatchEvent(new CustomEvent(EMAIL_SIGNATURE_UPDATED_EVENT));
      toast.success('Signature email sauvegardée');
      onClose();
    } catch {
      toast.error('Erreur lors de la sauvegarde de la signature');
    } finally {
      setLoading(false);
    }
  };

  const defaultSignature = `<div style="font-family: Arial, sans-serif; font-size: 14px; color: #333;">
  <div style="border-left: 3px solid #8b5cf6; padding-left: 15px; margin: 20px 0;">
    <img src="https://i.pravatar.cc/120?img=12" alt="Photo" style="width: 60px; height: 60px; border-radius: 50%; margin-bottom: 10px; object-fit: cover;" />
    <div style="font-weight: bold; font-size: 16px; color: #8b5cf6;">[Votre Nom]</div>
    <div style="color: #666; margin: 2px 0;">Fatras Booking</div>
    <div style="margin: 5px 0;">✉️ <a href="mailto:Booking@fatras.net" style="color: #333; text-decoration: none;">Booking@fatras.net</a></div>
    <div style="margin: 5px 0;">🌐 <a href="https://fatras.net" style="color: #8b5cf6; text-decoration: none;">https://fatras.net</a></div>
    <div style="margin: 10px 0;">
      <a href="https://www.facebook.com/fatrasmusic" style="margin-right: 10px; color: #8b5cf6; text-decoration: none;">Facebook</a>
      <a href="https://www.instagram.com/fatrasmusic" style="margin-right: 10px; color: #8b5cf6; text-decoration: none;">Instagram</a>
      <a href="https://www.youtube.com/@fatrasmusic" style="color: #8b5cf6; text-decoration: none;">YouTube</a>
    </div>
  </div>
</div>`;

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
                      <div dangerouslySetInnerHTML={{ __html: addAvatarToEmailSignature(signature || defaultSignature, avatarUrl) }} />
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