
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useIsMobile } from '@/hooks/use-mobile';
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
  const isMobile = useIsMobile();

  const tabOptions = [
    { value: 'general', label: 'Général' },
    { value: 'logistics', label: 'Logistique' },
    { value: 'contacts', label: 'Contacts' },
    { value: 'lineup', label: 'Casting' },
    { value: 'entities', label: 'Entités' },
    { value: 'travel', label: 'Route' },
    { value: 'expenses', label: 'Frais' },
    { value: 'documents', label: 'Docs' },
    { value: 'notes', label: 'Notes' },
  ];

  return (
    <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
      {isMobile ? (
        <Select value={selectedTab} onValueChange={setSelectedTab}>
          <SelectTrigger className="mb-4">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {tabOptions.map(tab => (
              <SelectItem key={tab.value} value={tab.value}>{tab.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      ) : (
        <TabsList className="grid w-full grid-cols-9 mb-4 h-auto gap-1">
          {tabOptions.map(tab => (
            <TabsTrigger key={tab.value} value={tab.value} className="text-xs py-2 px-2.5 whitespace-nowrap">
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>
      )}

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
