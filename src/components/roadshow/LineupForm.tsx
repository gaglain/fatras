
import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Switch } from '@/components/ui/switch';
import { FormData } from '@/types/roadshow.types';

interface LineupFormProps {
  formData: FormData;
  setFormData: React.Dispatch<React.SetStateAction<FormData>>;
  users: { id: string; name: string; isActive?: boolean }[];
}

export const LineupForm: React.FC<LineupFormProps> = ({ formData, setFormData, users }) => {
  const [userSearchTerm, setUserSearchTerm] = useState('');

  const toggleArtistLineup = (userId: string) => {
    const existingArtist = formData.artistLineup.find(a => a.userId === userId);
    
    if (existingArtist) {
      // Remove if exists
      setFormData({
        ...formData,
        artistLineup: formData.artistLineup.filter(a => a.userId !== userId)
      });
    } else {
      // Add if doesn't exist
      setFormData({
        ...formData,
        artistLineup: [...formData.artistLineup, { userId, confirmed: false }]
      });
    }
  };

  const toggleArtistConfirmation = (userId: string) => {
    setFormData({
      ...formData,
      artistLineup: formData.artistLineup.map(artist => 
        artist.userId === userId 
          ? { ...artist, confirmed: !artist.confirmed } 
          : artist
      )
    });
  };

  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(userSearchTerm.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Rechercher des artistes</label>
        <Input
          value={userSearchTerm}
          onChange={(e) => setUserSearchTerm(e.target.value)}
          placeholder="Rechercher des artistes..."
          className="mb-2"
        />
        <div className="max-h-64 overflow-y-auto border rounded p-2">
          {filteredUsers.map((user) => {
            const isSelected = formData.artistLineup.some(a => a.userId === user.id);
            const isConfirmed = formData.artistLineup.find(a => a.userId === user.id)?.confirmed || false;
            
            return (
              <div key={user.id} className="flex items-center justify-between p-2 hover:bg-gray-100">
                <div className="flex items-center">
                  <Checkbox
                    checked={isSelected}
                    onCheckedChange={() => toggleArtistLineup(user.id)}
                  />
                  <span className="ml-2">{user.name}</span>
                </div>
                
                {isSelected && (
                  <div className="flex items-center">
                    <span className="mr-2 text-sm">Confirmé</span>
                    <Switch
                      checked={isConfirmed}
                      onCheckedChange={() => toggleArtistConfirmation(user.id)}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
