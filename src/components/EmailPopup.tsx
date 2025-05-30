
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { X, Send, Paperclip, FileText, Image, Video, Music } from 'lucide-react';

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

export const EmailPopup: React.FC<EmailPopupProps> = ({ isOpen, onClose, email, contactName }) => {
  const [showCompose, setShowCompose] = useState(false);
  const [showBibleFiles, setShowBibleFiles] = useState(false);

  // Sample Bible files for attachment
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
              {/* Action Buttons */}
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

              {/* Email History */}
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
              {/* Compose Email */}
              <div className="space-y-3 max-h-96 overflow-y-auto">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium">Composer un email</h4>
                  <Button variant="ghost" size="sm" onClick={() => setShowCompose(false)}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                
                <Input placeholder="Objet" />
                <textarea 
                  placeholder="Votre message..."
                  className="w-full p-3 border border-gray-300 rounded-md text-sm"
                  rows={6}
                />
                
                {/* Attachment Options */}
                <div className="flex items-center space-x-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setShowBibleFiles(!showBibleFiles)}
                  >
                    <Paperclip className="h-3 w-3 mr-1" />
                    Bible
                  </Button>
                  <Button variant="outline" size="sm">
                    <Paperclip className="h-3 w-3 mr-1" />
                    Fichier
                  </Button>
                </div>

                {/* Bible Files Selection */}
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
                          <input type="checkbox" className="rounded" />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm" className="flex-1">
                    Brouillon
                  </Button>
                  <Button size="sm" className="flex-1 bg-purple-600 hover:bg-purple-700">
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
