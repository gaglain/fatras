
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FormData } from '@/types/roadshow.types';
import { GeneralForm } from './GeneralForm';
import { LogisticsForm } from './LogisticsForm';
import { ContactsForm } from './ContactsForm';
import { LineupForm } from './LineupForm';

interface RoadShowFormProps {
  formData: FormData;
  setFormData: React.Dispatch<React.SetStateAction<FormData>>;
  selectedTab: string;
  setSelectedTab: React.Dispatch<React.SetStateAction<string>>;
  users: { id: string; name: string; isActive?: boolean }[];
}

export const RoadShowForm: React.FC<RoadShowFormProps> = ({ 
  formData, setFormData, selectedTab, setSelectedTab, users 
}) => {
  return (
    <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
      <TabsList className="grid grid-cols-4 mb-4">
        <TabsTrigger value="general">Général</TabsTrigger>
        <TabsTrigger value="logistics">Logistique</TabsTrigger>
        <TabsTrigger value="contacts">Contacts</TabsTrigger>
        <TabsTrigger value="lineup">Casting</TabsTrigger>
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
        <LineupForm formData={formData} setFormData={setFormData} users={users} />
      </TabsContent>
    </Tabs>
  );
};
