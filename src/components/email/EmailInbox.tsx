import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Inbox, RefreshCw, Clock, Reply, Forward, Trash2, MoreVertical } from 'lucide-react';

interface InboundEmail {
  id: string;
  message_id?: string;
  from_email: string;
  to_email: string;
  subject: string;
  content: string;
  html_content?: string;
  received_at: string;
  read_at?: string;
  provider: string;
  labels?: string[];
}

interface EmailInboxProps {
  emails: InboundEmail[];
  loading: boolean;
  onSync: () => void;
  onMarkAsRead: (email: InboundEmail) => void;
  onReply: (email: InboundEmail) => void;
  onForward: (email: InboundEmail) => void;
  onDelete: (email: InboundEmail) => void;
  getEmailPreview: (email: InboundEmail) => string;
}

export const EmailInbox: React.FC<EmailInboxProps> = ({
  emails, loading, onSync, onMarkAsRead, onReply, onForward, onDelete, getEmailPreview
}) => {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Inbox className="h-5 w-5" />
              Boîte de réception
            </CardTitle>
            <CardDescription>
              {emails.length} email{emails.length !== 1 ? 's' : ''}
            </CardDescription>
          </div>
          <Button variant="outline" size="sm" onClick={onSync} disabled={loading} className="flex items-center gap-2">
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Synchroniser Gmail
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="text-center py-8">Chargement...</div>
        ) : emails.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            Aucun email dans la boîte de réception
          </div>
        ) : (
          <div className="space-y-2">
            {emails.map(email => (
              <div
                key={email.id}
                className={`group p-4 border rounded-lg hover:bg-muted/50 transition-colors ${
                  !email.read_at ? 'border-primary bg-primary/5' : ''
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0 cursor-pointer" onClick={() => onMarkAsRead(email)}>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium truncate">{email.from_email}</span>
                      {!email.read_at && <Badge variant="secondary" className="text-xs">Nouveau</Badge>}
                      <Badge variant="outline" className="text-xs">{email.provider}</Badge>
                    </div>
                    <div className="font-medium mb-1 truncate">{email.subject}</div>
                    <div className="text-sm text-muted-foreground truncate">{getEmailPreview(email)}</div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <div className="text-xs text-muted-foreground whitespace-nowrap flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {new Date(email.received_at).toLocaleDateString('fr-FR', {
                        day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit'
                      })}
                    </div>
                    <div className="hidden md:flex items-center gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8" title="Répondre"
                        onClick={(e) => { e.stopPropagation(); onReply(email); }}>
                        <Reply className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8" title="Transférer"
                        onClick={(e) => { e.stopPropagation(); onForward(email); }}>
                        <Forward className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8" title="Supprimer"
                        onClick={(e) => { e.stopPropagation(); onDelete(email); }}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild className="md:hidden">
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={(e) => e.stopPropagation()}>
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onReply(email); }}>
                          <Reply className="h-4 w-4 mr-2" /> Répondre
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onForward(email); }}>
                          <Forward className="h-4 w-4 mr-2" /> Transférer
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onDelete(email); }} className="text-destructive">
                          <Trash2 className="h-4 w-4 mr-2" /> Supprimer
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
