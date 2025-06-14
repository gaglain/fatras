
import React, { createContext, useContext, useState, useEffect } from 'react';

interface Contact {
  id: string;
  name: string;
  email: string;
  phone?: string;
  type: 'artist' | 'venue' | 'promoter' | 'media' | 'other';
  status: 'active' | 'inactive';
  createdAt: string;
}

interface Event {
  id: string;
  title: string;
  date: string;
  venue: string;
  status: 'planned' | 'confirmed' | 'completed' | 'cancelled';
  artistId?: string;
  type: string;
}

interface Task {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'in_progress' | 'completed';
  priority: 'low' | 'medium' | 'high';
  dueDate: string;
  assignedTo?: string;
}

interface Contract {
  id: string;
  title: string;
  clientName: string;
  amount: number;
  status: 'draft' | 'sent' | 'signed' | 'completed';
  createdAt: string;
}

interface EmailCampaign {
  id: string;
  name: string;
  subject: string;
  status: 'draft' | 'scheduled' | 'sent';
  recipients: number;
  sentAt?: string;
}

interface AppData {
  contacts: Contact[];
  events: Event[];
  tasks: Task[];
  contracts: Contract[];
  emailCampaigns: EmailCampaign[];
  revenue: number;
  addContact: (contact: Omit<Contact, 'id' | 'createdAt'>) => void;
  addEvent: (event: Omit<Event, 'id'>) => void;
  addTask: (task: Omit<Task, 'id'>) => void;
  addContract: (contract: Omit<Contract, 'id' | 'createdAt'>) => void;
  addEmailCampaign: (campaign: Omit<EmailCampaign, 'id'>) => void;
  updateRevenue: (amount: number) => void;
}

const AppDataContext = createContext<AppData | undefined>(undefined);

// Données d'exemple réalistes
const initialContacts: Contact[] = [
  { id: '1', name: 'Marie Dubois', email: 'marie@electropop.fr', phone: '06 12 34 56 78', type: 'artist', status: 'active', createdAt: '2024-12-01' },
  { id: '2', name: 'Le Bataclan', email: 'booking@bataclan.fr', phone: '01 43 14 00 30', type: 'venue', status: 'active', createdAt: '2024-11-28' },
  { id: '3', name: 'Thomas Martin', email: 'thomas@soundpromo.com', type: 'promoter', status: 'active', createdAt: '2024-11-25' },
];

const initialEvents: Event[] = [
  { id: '1', title: 'Concert Marie Dubois', date: '2024-12-20', venue: 'Le Bataclan', status: 'confirmed', artistId: '1', type: 'Concert' },
  { id: '2', title: 'Festival Summer Vibes', date: '2024-12-25', venue: 'Parc des Expositions', status: 'planned', type: 'Festival' },
];

const initialTasks: Task[] = [
  { id: '1', title: 'Finaliser contrat Marie Dubois', description: 'Réviser les clauses techniques', status: 'pending', priority: 'high', dueDate: '2024-12-18' },
  { id: '2', title: 'Préparer rider technique', description: 'Listing matériel concert Bataclan', status: 'in_progress', priority: 'medium', dueDate: '2024-12-19' },
];

const initialContracts: Contract[] = [
  { id: '1', title: 'Contrat Marie Dubois - Bataclan', clientName: 'Le Bataclan', amount: 15000, status: 'sent', createdAt: '2024-12-10' },
];

const initialEmailCampaigns: EmailCampaign[] = [
  { id: '1', name: 'Newsletter Décembre', subject: 'Nos concerts de fin d\'année', status: 'sent', recipients: 1200, sentAt: '2024-12-01' },
];

export const AppDataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [contacts, setContacts] = useState<Contact[]>(initialContacts);
  const [events, setEvents] = useState<Event[]>(initialEvents);
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [contracts, setContracts] = useState<Contract[]>(initialContracts);
  const [emailCampaigns, setEmailCampaigns] = useState<EmailCampaign[]>(initialEmailCampaigns);
  const [revenue, setRevenue] = useState(48500);

  // Sauvegarder dans localStorage
  useEffect(() => {
    localStorage.setItem('appData', JSON.stringify({
      contacts, events, tasks, contracts, emailCampaigns, revenue
    }));
  }, [contacts, events, tasks, contracts, emailCampaigns, revenue]);

  // Charger depuis localStorage
  useEffect(() => {
    const saved = localStorage.getItem('appData');
    if (saved) {
      try {
        const data = JSON.parse(saved);
        setContacts(data.contacts || initialContacts);
        setEvents(data.events || initialEvents);
        setTasks(data.tasks || initialTasks);
        setContracts(data.contracts || initialContracts);
        setEmailCampaigns(data.emailCampaigns || initialEmailCampaigns);
        setRevenue(data.revenue || 48500);
      } catch (error) {
        console.error('Erreur lors du chargement des données:', error);
      }
    }
  }, []);

  const addContact = (contact: Omit<Contact, 'id' | 'createdAt'>) => {
    const newContact: Contact = {
      ...contact,
      id: Date.now().toString(),
      createdAt: new Date().toISOString().split('T')[0]
    };
    setContacts(prev => [...prev, newContact]);
  };

  const addEvent = (event: Omit<Event, 'id'>) => {
    const newEvent: Event = {
      ...event,
      id: Date.now().toString()
    };
    setEvents(prev => [...prev, newEvent]);
  };

  const addTask = (task: Omit<Task, 'id'>) => {
    const newTask: Task = {
      ...task,
      id: Date.now().toString()
    };
    setTasks(prev => [...prev, newTask]);
  };

  const addContract = (contract: Omit<Contract, 'id' | 'createdAt'>) => {
    const newContract: Contract = {
      ...contract,
      id: Date.now().toString(),
      createdAt: new Date().toISOString().split('T')[0]
    };
    setContracts(prev => [...prev, newContract]);
  };

  const addEmailCampaign = (campaign: Omit<EmailCampaign, 'id'>) => {
    const newCampaign: EmailCampaign = {
      ...campaign,
      id: Date.now().toString()
    };
    setEmailCampaigns(prev => [...prev, newCampaign]);
  };

  const updateRevenue = (amount: number) => {
    setRevenue(prev => prev + amount);
  };

  return (
    <AppDataContext.Provider value={{
      contacts,
      events,
      tasks,
      contracts,
      emailCampaigns,
      revenue,
      addContact,
      addEvent,
      addTask,
      addContract,
      addEmailCampaign,
      updateRevenue
    }}>
      {children}
    </AppDataContext.Provider>
  );
};

export const useAppData = () => {
  const context = useContext(AppDataContext);
  if (context === undefined) {
    throw new Error('useAppData must be used within an AppDataProvider');
  }
  return context;
};
