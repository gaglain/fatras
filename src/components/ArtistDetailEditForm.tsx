
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RichTextEditor } from '@/components/RichTextEditor';
import { Download, Play, Plus, X } from 'lucide-react';

interface ArtistDetailEditFormProps {
  artistData: any;
  setArtistData: (data: any) => void;
  isEditing: boolean;
  users: any[];
  newPhoto: string;
  setNewPhoto: (v: string) => void;
  addPhoto: () => void;
  removePhoto: (index: number) => void;
  handleSave: () => void;
}

export const ArtistDetailEditForm: React.FC<ArtistDetailEditFormProps> = ({
  artistData, setArtistData, isEditing, users, newPhoto, setNewPhoto, addPhoto, removePhoto, handleSave
}) => {
  return (
    <div className="lg:col-span-2 space-y-6">
      {/* Section Présentation */}
      <Card>
        <CardHeader><CardTitle>Texte de Présentation</CardTitle></CardHeader>
        <CardContent>
          {isEditing ? (
            <RichTextEditor
              value={artistData.presentation_text || ''}
              onChange={(val) => setArtistData({ ...artistData, presentation_text: val })}
              placeholder="Texte de présentation de l'artiste..."
            />
          ) : (
            <div className="prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: artistData.presentation_text || 'Aucun texte de présentation disponible' }} />
          )}
        </CardContent>
      </Card>

      {/* Section Photographies */}
      <Card>
        <CardHeader><CardTitle>Photographies</CardTitle></CardHeader>
        <CardContent>
          {isEditing && (
            <div className="mb-4 flex gap-2">
              <Input value={newPhoto} onChange={(e) => setNewPhoto(e.target.value)} placeholder="URL de la photo" />
              <Button onClick={addPhoto} size="sm"><Plus className="h-4 w-4" /></Button>
            </div>
          )}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {artistData.photos?.map((photo: string, index: number) => (
              <div key={index} className="relative group">
                <img src={photo} alt={`Photo ${index + 1}`} className="w-full h-32 object-cover rounded-lg" />
                {isEditing && (
                  <Button onClick={() => removePhoto(index)} size="sm" variant="destructive" className="absolute top-1 right-1 h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity">
                    <X className="h-3 w-3" />
                  </Button>
                )}
              </div>
            )) || <p className="text-muted-foreground col-span-full">Aucune photo disponible</p>}
          </div>
        </CardContent>
      </Card>

      {/* Section Fichiers et Médias */}
      <Card>
        <CardHeader><CardTitle>Fichiers et Médias</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { label: 'Dossier de présentation (PDF)', key: 'presentation_pdf_url', icon: Download, actionLabel: 'Télécharger le dossier' },
              { label: 'Fiche technique (PDF)', key: 'tech_sheet_pdf_url', icon: Download, actionLabel: 'Télécharger la fiche technique' },
              { label: 'Vidéo', key: 'video_url', icon: Play, actionLabel: 'Voir la vidéo' },
              { label: 'Audio', key: 'audio_url', icon: Play, actionLabel: 'Écouter l\'audio' },
            ].map(({ label, key, icon: Icon, actionLabel }) => (
              <div key={key}>
                <Label>{label}</Label>
                {isEditing ? (
                  <Input value={artistData[key] || ''} onChange={(e) => setArtistData({ ...artistData, [key]: e.target.value })} placeholder={`URL ${label.toLowerCase()}`} />
                ) : artistData[key] ? (
                  <Button variant="outline" className="w-full"><Icon className="h-4 w-4 mr-2" />{actionLabel}</Button>
                ) : (
                  <p className="text-muted-foreground">Aucun fichier disponible</p>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Section Contacts */}
      <Card>
        <CardHeader><CardTitle>Contacts</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { label: 'Contact Technique', key: 'technical_contact_id', filterRoles: undefined },
              { label: 'Contact Booking', key: 'booking_contact_id', filterRoles: ['booker', 'admin', 'super_admin'] },
            ].map(({ label, key, filterRoles }) => (
              <div key={key}>
                <Label>{label}</Label>
                {isEditing ? (
                  <Select value={artistData[key] || ''} onValueChange={(value) => setArtistData({ ...artistData, [key]: value })}>
                    <SelectTrigger><SelectValue placeholder={`Choisir un ${label.toLowerCase()}`} /></SelectTrigger>
                    <SelectContent>
                      {(filterRoles ? users.filter(u => filterRoles.includes(u.role)) : users).map((u) => (
                        <SelectItem key={u.id} value={u.id}>{u.first_name} {u.last_name} ({u.role})</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <p className="text-foreground">
                    {users.find(u => u.id === artistData[key])
                      ? `${users.find(u => u.id === artistData[key])?.first_name} ${users.find(u => u.id === artistData[key])?.last_name}`
                      : 'Non défini'}
                  </p>
                )}
              </div>
            ))}

            <div>
              <Label>Numéro de programme SACEM (interne)</Label>
              {isEditing ? (
                <Input value={artistData.sacem_program_number || ''} onChange={(e) => setArtistData({ ...artistData, sacem_program_number: e.target.value })} placeholder="Ex: 123456789" />
              ) : (
                <p className="text-foreground">{artistData.sacem_program_number || 'Non défini'}</p>
              )}
              <p className="text-xs text-muted-foreground mt-1">Information interne - non affichée sur le site public.</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {isEditing && (
        <div className="flex justify-end">
          <Button onClick={handleSave} className="px-8">Sauvegarder les modifications</Button>
        </div>
      )}
    </div>
  );
};
