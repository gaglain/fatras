
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Reply, Forward, Archive, Trash2, Star, MoreHorizontal } from 'lucide-react';

interface Email {
  id: string;
  from: string;
  to: string;
  subject: string;
  content: string;
  date: string;
  isRead: boolean;
  isStarred: boolean;
  attachments?: string[];
}

interface EmailViewerProps {
  email: Email;
  onClose: () => void;
  onReply: (email: Email) => void;
  onForward: (email: Email) => void;
}

export const EmailViewer: React.FC<EmailViewerProps> = ({ 
  email, 
  onClose, 
  onReply, 
  onForward 
}) => {
  return (
    <Card className="h-full">
      <CardHeader className="border-b">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Button variant="outline" size="sm" onClick={onClose}>
              ← Retour
            </Button>
            <div>
              <CardTitle className="text-lg">{email.subject}</CardTitle>
              <div className="text-sm text-gray-600 mt-1">
                De: {email.from} • À: {email.to} • {new Date(email.date).toLocaleString('fr-FR')}
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm">
              <Star className={`h-4 w-4 ${email.isStarred ? 'fill-yellow-400 text-yellow-400' : ''}`} />
            </Button>
            <Button variant="outline" size="sm">
              <Archive className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm">
              <Trash2 className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        <div className="space-y-4">
          {!email.isRead && (
            <Badge className="bg-blue-100 text-blue-800">Nouveau</Badge>
          )}
          
          <div className="prose max-w-none">
            <div className="whitespace-pre-wrap text-gray-900">
              {email.content}
            </div>
          </div>

          {email.attachments && email.attachments.length > 0 && (
            <div className="border-t pt-4">
              <h4 className="font-medium text-gray-900 mb-2">Pièces jointes ({email.attachments.length})</h4>
              <div className="space-y-2">
                {email.attachments.map((attachment, index) => (
                  <div key={index} className="flex items-center justify-between p-2 border rounded">
                    <span className="text-sm">{attachment}</span>
                    <Button variant="outline" size="sm">Télécharger</Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="border-t pt-4 flex space-x-3">
            <Button onClick={() => onReply(email)} className="bg-purple-600 hover:bg-purple-700">
              <Reply className="h-4 w-4 mr-2" />
              Répondre
            </Button>
            <Button variant="outline" onClick={() => onForward(email)}>
              <Forward className="h-4 w-4 mr-2" />
              Transférer
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
