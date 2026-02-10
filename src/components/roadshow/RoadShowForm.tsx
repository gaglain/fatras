
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FormData } from '@/types/roadshow.types';
import { GeneralForm } from './GeneralForm';
import { LogisticsForm } from './LogisticsForm';
import { ContactsForm } from './ContactsForm';
import { LineupForm } from './LineupForm';
import { EntityLinksForm } from './EntityLinksForm';
import { ExpensesForm } from './ExpensesForm';
import { TravelCostsForm } from './TravelCostsForm';
import { RoadshowDocuments } from './RoadshowDocuments';
import { RoadshowNotes } from './RoadshowNotes';

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
      <TabsList className="grid grid-cols-3 sm:grid-cols-9 mb-4 h-auto gap-1">
        <TabsTrigger value="general" className="text-xs py-2">Général</TabsTrigger>
        <TabsTrigger value="logistics" className="text-xs py-2">Logistique</TabsTrigger>
        <TabsTrigger value="contacts" className="text-xs py-2">Contacts</TabsTrigger>
        <TabsTrigger value="lineup" className="text-xs py-2">Casting</TabsTrigger>
        <TabsTrigger value="entities" className="text-xs py-2">Entités</TabsTrigger>
        <TabsTrigger value="travel" className="text-xs py-2">Route</TabsTrigger>
        <TabsTrigger value="expenses" className="text-xs py-2">Frais</TabsTrigger>
        <TabsTrigger value="documents" className="text-xs py-2">Documents</TabsTrigger>
        <TabsTrigger value="notes" className="text-xs py-2">Notes</TabsTrigger>
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
          <LineupForm formData={formData} setFormData={setFormData} users={users} />
        </div>
      </TabsContent>

      <TabsContent value="entities">
        <EntityLinksForm roadshowStopId={roadshowStopId} />
      </TabsContent>

      <TabsContent value="travel">
        <TravelCostsForm roadshowStopId={roadshowStopId} />
      </TabsContent>

      <TabsContent value="expenses">
        <ExpensesForm roadshowStopId={roadshowStopId} />
      </TabsContent>

      <TabsContent value="documents">
        <RoadshowDocuments roadshowStopId={roadshowStopId} />
      </TabsContent>

      <TabsContent value="notes">
        <RoadshowNotes roadshowStopId={roadshowStopId} />
      </TabsContent>
    </Tabs>
  );
};
