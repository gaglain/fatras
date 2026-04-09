import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Calendar, Edit, Trash2, Image, Link, MessageSquare, CheckCircle, XCircle, Users } from 'lucide-react';
import { Publication, PublicationComment } from '@/contexts/CentralizedDataContext';

const platforms = [
  { value: 'facebook', label: 'Facebook' },
  { value: 'instagram', label: 'Instagram' },
  { value: 'twitter', label: 'Twitter' },
  { value: 'linkedin', label: 'LinkedIn' },
  { value: 'youtube', label: 'YouTube' },
  { value: 'tiktok', label: 'TikTok' }
];

interface PublicationCardProps {
  publication: Publication;
  showComments: string | null;
  onToggleComments: (id: string | null) => void;
  onEdit: (publication: Publication) => void;
  onDelete: (id: string) => void;
  onChangeStatus: (id: string, status: Publication['status']) => void;
  onAddComment: (publicationId: string, comment: string) => void;
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'draft': return 'bg-gray-100 text-gray-800';
    case 'scheduled': return 'bg-blue-100 text-blue-800';
    case 'published': return 'bg-green-100 text-green-800';
    case 'pending_approval': return 'bg-yellow-100 text-yellow-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

const getStatusLabel = (status: string) => {
  switch (status) {
    case 'draft': return 'Brouillon';
    case 'scheduled': return 'Programmé';
    case 'published': return 'Publié';
    case 'pending_approval': return 'En attente';
    default: return status;
  }
};

export const PublicationCard: React.FC<PublicationCardProps> = ({
  publication,
  showComments,
  onToggleComments,
  onEdit,
  onDelete,
  onChangeStatus,
  onAddComment,
}) => {
  const [newComment, setNewComment] = useState('');
  const isCommentsOpen = showComments === publication.id;

  const handleAddComment = () => {
    if (!newComment.trim()) return;
    onAddComment(publication.id, newComment.trim());
    setNewComment('');
  };

  return (
    <Card className="relative">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg">{publication.title}</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              {platforms.find(p => p.value === publication.platform)?.label}
            </p>
          </div>
          <Badge className={getStatusColor(publication.status)}>
            {getStatusLabel(publication.status)}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm line-clamp-3">{publication.content}</p>
        
        <div className="space-y-2">
          <div className="flex items-center text-sm text-muted-foreground">
            <Calendar className="h-4 w-4 mr-2" />
            {new Date(publication.scheduled_date).toLocaleDateString('fr-FR')} à{' '}
            {new Date(publication.scheduled_date).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
          </div>
          {publication.assigned_username && (
            <div className="flex items-center text-sm text-muted-foreground">
              <Users className="h-4 w-4 mr-2" />
              Assigné à @{publication.assigned_username}
            </div>
          )}
          {publication.media_url && (
            <div className="flex items-center text-sm text-blue-600">
              <Image className="h-4 w-4 mr-2" />
              Média joint
            </div>
          )}
          {publication.external_link && (
            <div className="flex items-center text-sm text-blue-600">
              <Link className="h-4 w-4 mr-2" />
              Lien externe
            </div>
          )}
        </div>
        
        <div className="flex flex-col gap-2 pt-2 border-t">
          <div className="flex flex-wrap gap-1 md:hidden">
            {(['draft', 'scheduled', 'published'] as const).map(status => (
              <Button
                key={status}
                variant={publication.status === status ? 'secondary' : 'ghost'}
                size="sm"
                className="text-xs h-7 px-2"
                onClick={() => onChangeStatus(publication.id, status)}
              >
                {getStatusLabel(status)}
              </Button>
            ))}
          </div>
          
          <div className="flex items-center justify-between">
            <Button variant="ghost" size="sm" onClick={() => onToggleComments(isCommentsOpen ? null : publication.id)}>
              <MessageSquare className="h-4 w-4 mr-1" />
              <span>{publication.comments.length}</span>
            </Button>
            
            <div className="flex items-center gap-1">
              {publication.status === 'pending_approval' && (
                <div className="hidden md:flex items-center gap-1">
                  <Button variant="ghost" size="sm" onClick={() => onChangeStatus(publication.id, 'scheduled')} className="text-green-600 hover:text-green-700">
                    <CheckCircle className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => onChangeStatus(publication.id, 'draft')} className="text-red-600 hover:text-red-700">
                    <XCircle className="h-4 w-4" />
                  </Button>
                </div>
              )}
              <Button variant="ghost" size="sm" onClick={() => onEdit(publication)}>
                <Edit className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm" onClick={() => onDelete(publication.id)} className="text-red-600 hover:text-red-700">
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {isCommentsOpen && (
          <div className="space-y-3 pt-3 border-t">
            <div className="space-y-2 max-h-32 overflow-y-auto">
              {publication.comments.map((comment) => (
                <div key={comment.id} className="text-sm">
                  <div className="font-medium">@{comment.username}</div>
                  <div className="text-muted-foreground">{comment.comment}</div>
                </div>
              ))}
            </div>
            <div className="flex space-x-2">
              <Input
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Ajouter un commentaire..."
                className="flex-1"
                onKeyPress={(e) => e.key === 'Enter' && handleAddComment()}
              />
              <Button size="sm" onClick={handleAddComment} disabled={!newComment.trim()}>
                <MessageSquare className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
