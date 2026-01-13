import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { X, Send, Paperclip, FileText, Image, Video, Music, Upload, Signature } from 'lucide-react';
import { useUser } from '@/contexts/UserContext';
import { generateEmailSignature, getPlainTextSignature } from '@/utils/emailSignature';
import { toast } from 'sonner';

interface EmailHistory {
  id: string;
  subject: string;
  date: string;
  direction: 'sent' | 'received';
  preview: string;
}

interface EmailPopupProps {
  isOpen: boolean;
  onClose: () => void;
  email: string;
  contactName: string;
}

interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  content: string;
}

const sampleEmailHistory: EmailHistory[] = [
  {
    id: '1',
    subject: 'Contrat pour Festival d\'Été 2024',
    date: '2024-06-10',
    direction: 'sent',
    preview: 'Bonjour, merci pour votre intérêt pour notre festival...'
  },
  {
    id: '2',
    subject: 'Re: Exigences techniques',
    date: '2024-06-08',
    direction: 'received',
    preview: 'Merci pour les informations. Nous avons quelques questions...'
  },
  {
    id: '3',
    subject: 'Confirmation de réservation',
    date: '2024-06-05',
    direction: 'sent',
    preview: 'Nous confirmons votre réservation pour...'
  }
];

const emailTemplates: EmailTemplate[] = [
  {
    id: '1',
    name: 'Suivi de Contrat',
    subject: 'Suivi du contrat pour {{event_name}}',
    content: 'Bonjour {{contact_name}},\n\nJ\'espère que ce email vous trouve en bonne santé. Je souhaitais faire le suivi du contrat que nous avons envoyé pour {{event_name}} le {{event_date}}.\n\nCordialement,\n{{user_name}}'
  },
  {
    id: '2',
    name: 'Confirmation d\'Événement',
    subject: 'Confirmation - {{artist_name}} à {{venue_name}}',
    content: 'Cher {{contact_name}},\n\nNous sommes heureux de confirmer la réservation pour {{artist_name}} à {{venue_name}} le {{event_date}}.\n\nDétails de l\'événement :\n- Artiste : {{artist_name}}\n- Lieu : {{venue_name}}\n- Date : {{event_date}}\n- Montant : {{contract_amount}}\n\nCordialement,\n{{user_name}}'
  },
  {
    id: '3',
    name: 'Demande de Renseignements',
    subject: 'Demande de renseignements - {{artist_name}}',
    content: 'Bonjour {{contact_name}},\n\nNous aimerions avoir plus d\'informations concernant {{artist_name}} pour un potentiel événement.\n\nPourriez-vous nous envoyer :\n- Tarifs\n- Disponibilités\n- Exigences techniques\n\nMerci d\'avance,\n{{user_name}}'
  }
];

export const EmailPopup: React.FC<EmailPopupProps> = ({ isOpen, onClose, email, contactName }) => {
  const { currentUser } = useUser();
  const [showCompose, setShowCompose] = useState(false);
  const [showBibleFiles, setShowBibleFiles] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate | null>(null);
  const [emailSubject, setEmailSubject] = useState('');
  const [emailContent, setEmailContent] = useState('');
  const [attachedBibleFiles, setAttachedBibleFiles] = useState<string[]>([]);
  const [externalFiles, setExternalFiles] = useState<File[]>([]);
  const [includeSignature, setIncludeSignature] = useState(true);

  const bibleFiles = [
    { id: '1', name: 'Technical Rider - The Midnight Express.pdf', type: 'pdf', size: '2.3 MB' },
    { id: '2', name: 'Stage Plot.jpg', type: 'image', size: '1.8 MB' },
    { id: '3', name: 'Intro Music.mp3', type: 'audio', size: '4.2 MB' },
    { id: '4', name: 'Performance Video.mp4', type: 'video', size: '15.7 MB' },
    { id: '5', name: 'Artist Bio.pdf', type: 'pdf', size: '890 KB' }
  ];

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'pdf':
        return <FileText className="h-4 w-4 text-red-500" />;
      case 'image':
        return <Image className="h-4 w-4 text-green-500" />;
      case 'audio':
        return <Music className="h-4 w-4 text-blue-500" />;
      case 'video':
        return <Video className="h-4 w-4 text-purple-500" />;
      default:
        return <FileText className="h-4 w-4 text-gray-500" />;
    }
  };

  const handleTemplateSelect = (template: EmailTemplate) => {
    setSelectedTemplate(template);
    
    // Remplacer les variables par des valeurs réelles ou des placeholders
    let processedSubject = template.subject;
    let processedContent = template.content;
    
    const replacements = {
      '{{contact_name}}': contactName,
      '{{user_name}}': currentUser ? `${currentUser.name} ${currentUser.lastName}` : 'Votre nom',
      '{{event_name}}': '[Nom de l\'événement]',
      '{{event_date}}': '[Date de l\'événement]',
      '{{venue_name}}': '[Nom du lieu]',
      '{{artist_name}}': '[Nom de l\'artiste]',
      '{{contract_amount}}': '[Montant du contrat]',
      '{{company_name}}': 'Fatras Booking'
    };

    Object.entries(replacements).forEach(([key, value]) => {
      processedSubject = processedSubject.replace(new RegExp(key, 'g'), value);
      processedContent = processedContent.replace(new RegExp(key, 'g'), value);
    });

    setEmailSubject(processedSubject);
    setEmailContent(processedContent);
    setShowTemplates(false);
    toast.success(`Modèle "${template.name}" appliqué`);
  };

  const handleBibleFileToggle = (fileId: string) => {
    setAttachedBibleFiles(prev => 
      prev.includes(fileId) 
        ? prev.filter(id => id !== fileId)
        : [...prev, fileId]
    );
  };

  const handleExternalFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setExternalFiles(prev => [...prev, ...files]);
  };

  const handleSendEmail = async () => {
    if (!emailSubject.trim() || !emailContent.trim()) {
      toast.error('Veuillez remplir l\'objet et le contenu de l\'email');
      return;
    }

    let finalContent = emailContent;
    
    if (includeSignature && currentUser) {
      finalContent += '\n\n' + getPlainTextSignature(currentUser);
    }
    
    try {
      // Simuler l'envoi d'email
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      toast.success('Email envoyé avec succès !');
      
      // Réinitialiser le formulaire
      setShowCompose(false);
      setEmailSubject('');
      setEmailContent('');
      setAttachedBibleFiles([]);
      setExternalFiles([]);
      setSelectedTemplate(null);
    } catch (error) {
      toast.error('Erreur lors de l\'envoi de l\'email');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <Card className="w-96 max-h-[600px] shadow-2xl">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg">{contactName}</CardTitle>
              <p className="text-sm text-gray-600">{email}</p>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="p-4">
          {!showCompose ? (
            <>
              <div className="flex space-x-2 mb-4">
                <Button 
                  onClick={() => setShowCompose(true)} 
                  className="flex-1 bg-purple-600 hover:bg-purple-700"
                  size="sm"
                >
                  <Send className="h-3 w-3 mr-1" />
                  Nouveau
                </Button>
                <Button variant="outline" size="sm">
                  Appeler
                </Button>
              </div>

              <div className="space-y-2 max-h-80 overflow-y-auto">
                <h4 className="font-medium text-gray-900 mb-2">Historique des conversations</h4>
                {sampleEmailHistory.map((email) => (
                  <div key={email.id} className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                    <div className="flex items-center justify-between mb-1">
                      <h5 className="font-medium text-sm">{email.subject}</h5>
                      <Badge variant={email.direction === 'sent' ? 'default' : 'secondary'} className="text-xs">
                        {email.direction === 'sent' ? 'Envoyé' : 'Reçu'}
                      </Badge>
                    </div>
                    <p className="text-xs text-gray-600 mb-1">{new Date(email.date).toLocaleDateString('fr-FR')}</p>
                    <p className="text-xs text-gray-500 truncate">{email.preview}</p>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium">Composer un email</h4>
                  <Button variant="ghost" size="sm" onClick={() => setShowCompose(false)}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                
                <div className="flex space-x-2 mb-3">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setShowTemplates(!showTemplates)}
                  >
                    <FileText className="h-3 w-3 mr-1" />
                    Modèles
                  </Button>
                  <Button 
                    variant={includeSignature ? "default" : "outline"}
                    size="sm"
                    onClick={() => setIncludeSignature(!includeSignature)}
                  >
                    <Signature className="h-3 w-3 mr-1" />
                    Signature
                  </Button>
                </div>

                {showTemplates && (
                  <div className="border border-gray-200 rounded-md p-3 mb-3">
                    <h5 className="font-medium text-sm mb-2">Modèles d'email</h5>
                    <div className="space-y-1">
                      {emailTemplates.map((template) => (
                        <div 
                          key={template.id} 
                          className="p-2 hover:bg-gray-50 rounded cursor-pointer text-sm"
                          onClick={() => handleTemplateSelect(template)}
                        >
                          <div className="font-medium">{template.name}</div>
                          <div className="text-xs text-gray-500">{template.subject}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                <Input 
                  placeholder="Objet" 
                  value={emailSubject}
                  onChange={(e) => setEmailSubject(e.target.value)}
                />
                <textarea 
                  placeholder="Votre message..."
                  className="w-full p-3 border border-gray-300 rounded-md text-sm"
                  rows={6}
                  value={emailContent}
                  onChange={(e) => setEmailContent(e.target.value)}
                />
                
                {includeSignature && currentUser && (
                  <div className="border border-purple-200 bg-purple-50 rounded-md p-3">
                    <div className="flex items-center mb-2">
                      <Signature className="h-4 w-4 text-purple-600 mr-2" />
                      <span className="text-sm font-medium text-purple-800">Aperçu de la signature</span>
                    </div>
                    <div 
                      className="text-xs"
                      dangerouslySetInnerHTML={{ __html: generateEmailSignature(currentUser) }}
                    />
                  </div>
                )}
                
                <div className="flex items-center space-x-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setShowBibleFiles(!showBibleFiles)}
                  >
                    <Paperclip className="h-3 w-3 mr-1" />
                    Bible ({attachedBibleFiles.length})
                  </Button>
                  <label className="cursor-pointer">
                    <Button variant="outline" size="sm" asChild>
                      <span>
                        <Upload className="h-3 w-3 mr-1" />
                        Fichier ({externalFiles.length})
                      </span>
                    </Button>
                    <input 
                      type="file" 
                      multiple 
                      className="hidden" 
                      onChange={handleExternalFileUpload}
                    />
                  </label>
                </div>

                {showBibleFiles && (
                  <div className="border border-gray-200 rounded-md p-3 max-h-40 overflow-y-auto">
                    <h5 className="font-medium text-sm mb-2">Fichiers de la Bible</h5>
                    <div className="space-y-1">
                      {bibleFiles.map((file) => (
                        <div key={file.id} className="flex items-center space-x-2 p-2 hover:bg-gray-50 rounded cursor-pointer">
                          {getFileIcon(file.type)}
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium truncate">{file.name}</p>
                            <p className="text-xs text-gray-500">{file.size}</p>
                          </div>
                          <input 
                            type="checkbox" 
                            className="rounded"
                            checked={attachedBibleFiles.includes(file.id)}
                            onChange={() => handleBibleFileToggle(file.id)}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {externalFiles.length > 0 && (
                  <div className="border border-gray-200 rounded-md p-3">
                    <h5 className="font-medium text-sm mb-2">Fichiers attachés</h5>
                    <div className="space-y-1">
                      {externalFiles.map((file, index) => (
                        <div key={index} className="flex items-center space-x-2 text-xs">
                          <FileText className="h-3 w-3" />
                          <span className="flex-1 truncate">{file.name}</span>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-6 w-6 p-0"
                            onClick={() => setExternalFiles(prev => prev.filter((_, i) => i !== index))}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm" className="flex-1">
                    Brouillon
                  </Button>
                  <Button size="sm" className="flex-1 bg-purple-600 hover:bg-purple-700" onClick={handleSendEmail}>
                    <Send className="h-3 w-3 mr-1" />
                    Envoyer
                  </Button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
