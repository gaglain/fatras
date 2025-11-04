
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FormData } from '@/types/roadshow.types';
import { GeneralForm } from './GeneralForm';
import { LogisticsForm } from './LogisticsForm';
import { ContactsForm } from './ContactsForm';
import { LineupForm } from './LineupForm';
import { EntityLinksForm } from './EntityLinksForm';

interface RoadShowFormProps {
  formData: FormData;
  setFormData: React.Dispatch<React.SetStateAction<FormData>>;
  selectedTab: string;
  setSelectedTab: React.Dispatch<React.SetStateAction<string>>;
  users: { id: string; name: string; isActive?: boolean }[];
  roadshowStopId?: string;
}

export const RoadShowForm: React.FC<RoadShowFormProps> = ({ 
  formData, setFormData, selectedTab, setSelectedTab, users, roadshowStopId 
}) => {
  return (
    <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
      <TabsList className="grid grid-cols-5 mb-4">
        <TabsTrigger value="general">Général</TabsTrigger>
        <TabsTrigger value="logistics">Logistique</TabsTrigger>
        <TabsTrigger value="contacts">Contacts</TabsTrigger>
        <TabsTrigger value="lineup">Casting</TabsTrigger>
        <TabsTrigger value="entities">Entités</TabsTrigger>
      </TabsList>

      <TabsContent value="general">
        <GeneralForm formData={formData} setFormData={setFormData} />
      </TabsContent>

      <TabsContent value="logistics">
        <LogisticsForm formData={formData} setFormData={setFormData} />
      </TabsContent>

      <TabsContent value="contacts">
        <ContactsForm formData={formData} setFormData={setFormData} users={users} />
      </TabsContent>

      <TabsContent value="lineup">
        <div className="space-y-4">
          <div className="mb-4">
            <h3 className="text-lg font-medium mb-2">Sélection du casting</h3>
            <p className="text-sm text-muted-foreground">
              Choisissez les utilisateurs qui feront partie de cette étape de tournée
            </p>
          </div>
          {/* CastingSelector sera intégré ici */}
          <LineupForm formData={formData} setFormData={setFormData} users={users} />
        </div>
      </TabsContent>

      <TabsContent value="entities">
        <EntityLinksForm roadshowStopId={roadshowStopId} />
      </TabsContent>
    </Tabs>
  );
};
