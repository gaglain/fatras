
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

// Toutes les données sont vides par défaut
const initialContacts: Contact[] = [];
const initialEvents: Event[] = [];
const initialTasks: Task[] = [];
const initialContracts: Contract[] = [];
const initialEmailCampaigns: EmailCampaign[] = [];

export const AppDataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [contacts, setContacts] = useState<Contact[]>(initialContacts);
  const [events, setEvents] = useState<Event[]>(initialEvents);
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [contracts, setContracts] = useState<Contract[]>(initialContracts);
  const [emailCampaigns, setEmailCampaigns] = useState<EmailCampaign[]>(initialEmailCampaigns);
  const [revenue, setRevenue] = useState(0);

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
        setRevenue(data.revenue || 0);
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
