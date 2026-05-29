
import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { FormData } from '@/types/roadshow.types';

interface ContactsFormProps {
  formData: FormData;
  setFormData: React.Dispatch<React.SetStateAction<FormData>>;
  users: { id: string; name: string; isActive?: boolean }[];
}

export const ContactsForm: React.FC<ContactsFormProps> = ({ formData, setFormData, users }) => {
  const [crewSearchTerm, setCrewSearchTerm] = useState('');

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Contact sur place</label>
        <Input
          value={formData.localContact}
          onChange={(e) => setFormData({ ...formData, localContact: e.target.value })}
          placeholder="Nom du contact local"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Téléphone du contact</label>
        <Input
          value={formData.localContactPhone}
          onChange={(e) => setFormData({ ...formData, localContactPhone: e.target.value })}
          placeholder="+33 6 12 34 56 78"
        />
      </div>

      <div className="pt-2 border-t">
        <h4 className="text-sm font-semibold text-gray-800 mb-3">Contact technique sur place</h4>
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Nom</label>
            <Input
              value={formData.technicalContactName || ''}
              onChange={(e) => setFormData({ ...formData, technicalContactName: e.target.value })}
              placeholder="Nom du régisseur / technicien"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
            <Input
              type="email"
              value={formData.technicalContactEmail || ''}
              onChange={(e) => setFormData({ ...formData, technicalContactEmail: e.target.value })}
              placeholder="technique@salle.fr"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Téléphone</label>
            <Input
              value={formData.technicalContactPhone || ''}
              onChange={(e) => setFormData({ ...formData, technicalContactPhone: e.target.value })}
              placeholder="+33 6 12 34 56 78"
            />
          </div>
        </div>
      </div>


      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Équipe technique</label>
        <Input
          value={crewSearchTerm}
          onChange={(e) => setCrewSearchTerm(e.target.value)}
          placeholder="Rechercher des membres d'équipe..."
          className="mb-2"
        />
        <div className="max-h-48 overflow-y-auto border rounded p-2">
          {users
            .filter(user => user.name.toLowerCase().includes(crewSearchTerm.toLowerCase()))
            .map((user) => (
              <div key={user.id} className="flex items-center p-2 hover:bg-gray-100">
                <Checkbox
                  checked={formData.crew.includes(user.id)}
                  onCheckedChange={() => {
                    if (formData.crew.includes(user.id)) {
                      setFormData({
                        ...formData,
                        crew: formData.crew.filter(id => id !== user.id)
                      });
                    } else {
                      setFormData({
                        ...formData,
                        crew: [...formData.crew, user.id]
                      });
                    }
                  }}
                />
                <span className="ml-2">{user.name}</span>
              </div>
            ))
          }
        </div>
      </div>
    </div>
  );
};
