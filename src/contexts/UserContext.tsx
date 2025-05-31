
import React, { createContext, useContext, useState, ReactNode } from 'react';

export type UserRole = 'super-admin' | 'booker' | 'artist' | 'casting-artist' | 'user' | 'external-user';

export interface User {
  id: string;
  name: string;
  lastName: string;
  email: string;
  role: UserRole;
  avatar?: string;
  isActive: boolean;
  googleCalendarConnected?: boolean;
  gmailConnected?: boolean;
  department?: string;
  phone?: string;
  bio?: string;
}

export interface UserPermissions {
  canCreateContacts: boolean;
  canEditAllContacts: boolean;
  canDeleteContacts: boolean;
  canCreateEvents: boolean;
  canEditAllEvents: boolean;
  canDeleteEvents: boolean;
  canManageUsers: boolean;
  canManageContracts: boolean;
  canViewFinancials: boolean;
  canManageSettings: boolean;
  canAccessChat: boolean;
  canCreateOpportunities: boolean;
  canManageCasting: boolean;
}

interface UserContextType {
  currentUser: User | null;
  users: User[];
  setCurrentUser: (user: User) => void;
  addUser: (user: Omit<User, 'id'>) => void;
  updateUser: (id: string, updates: Partial<User>) => void;
  removeUser: (id: string) => void;
  getUserPermissions: (user: User) => UserPermissions;
  getUserById: (id: string) => User | undefined;
  changeOwnership: (itemType: 'contact' | 'event', itemId: string, newOwnerId: string) => void;
  connectGoogleCalendar: (userId: string) => void;
  connectGmail: (userId: string) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

const sampleUsers: User[] = [
  {
    id: 'user-1',
    name: 'Alice',
    lastName: 'Johnson',
    email: 'alice@showmanager.com',
    role: 'super-admin',
    isActive: true,
    googleCalendarConnected: true,
    gmailConnected: true,
    department: 'Direction',
    phone: '+33 1 23 45 67 89',
    bio: 'Directrice générale avec 15 ans d\'expérience dans l\'événementiel'
  },
  {
    id: 'user-2',
    name: 'Bob',
    lastName: 'Miller',
    email: 'bob@showmanager.com',
    role: 'booker',
    isActive: true,
    department: 'Booking',
    phone: '+33 1 23 45 67 90'
  },
  {
    id: 'user-3',
    name: 'Charlie',
    lastName: 'Brown',
    email: 'charlie@showmanager.com',
    role: 'artist',
    isActive: true,
    department: 'Artistes'
  },
  {
    id: 'user-4',
    name: 'Diana',
    lastName: 'Prince',
    email: 'diana@external.com',
    role: 'external-user',
    isActive: true,
    department: 'Partenaire externe'
  }
];

export const UserProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(sampleUsers[0]);
  const [users, setUsers] = useState<User[]>(sampleUsers);

  const addUser = (user: Omit<User, 'id'>) => {
    const newUser: User = {
      ...user,
      id: `user-${Date.now()}`
    };
    setUsers(prev => [...prev, newUser]);
  };

  const updateUser = (id: string, updates: Partial<User>) => {
    setUsers(prev => prev.map(user => 
      user.id === id ? { ...user, ...updates } : user
    ));
  };

  const removeUser = (id: string) => {
    setUsers(prev => prev.filter(user => user.id !== id));
  };

  const getUserPermissions = (user: User): UserPermissions => {
    switch (user.role) {
      case 'super-admin':
        return {
          canCreateContacts: true,
          canEditAllContacts: true,
          canDeleteContacts: true,
          canCreateEvents: true,
          canEditAllEvents: true,
          canDeleteEvents: true,
          canManageUsers: true,
          canManageContracts: true,
          canViewFinancials: true,
          canManageSettings: true,
          canAccessChat: true,
          canCreateOpportunities: true,
          canManageCasting: true
        };
      case 'booker':
        return {
          canCreateContacts: true,
          canEditAllContacts: true,
          canDeleteContacts: false,
          canCreateEvents: true,
          canEditAllEvents: true,
          canDeleteEvents: false,
          canManageUsers: false,
          canManageContracts: true,
          canViewFinancials: true,
          canManageSettings: false,
          canAccessChat: true,
          canCreateOpportunities: true,
          canManageCasting: true
        };
      case 'artist':
        return {
          canCreateContacts: false,
          canEditAllContacts: false,
          canDeleteContacts: false,
          canCreateEvents: false,
          canEditAllEvents: false,
          canDeleteEvents: false,
          canManageUsers: false,
          canManageContracts: false,
          canViewFinancials: false,
          canManageSettings: false,
          canAccessChat: true,
          canCreateOpportunities: false,
          canManageCasting: false
        };
      case 'casting-artist':
        return {
          canCreateContacts: false,
          canEditAllContacts: false,
          canDeleteContacts: false,
          canCreateEvents: false,
          canEditAllEvents: false,
          canDeleteEvents: false,
          canManageUsers: false,
          canManageContracts: false,
          canViewFinancials: false,
          canManageSettings: false,
          canAccessChat: true,
          canCreateOpportunities: false,
          canManageCasting: false
        };
      case 'user':
        return {
          canCreateContacts: true,
          canEditAllContacts: false,
          canDeleteContacts: false,
          canCreateEvents: true,
          canEditAllEvents: false,
          canDeleteEvents: false,
          canManageUsers: false,
          canManageContracts: false,
          canViewFinancials: false,
          canManageSettings: false,
          canAccessChat: true,
          canCreateOpportunities: false,
          canManageCasting: false
        };
      case 'external-user':
        return {
          canCreateContacts: false,
          canEditAllContacts: false,
          canDeleteContacts: false,
          canCreateEvents: false,
          canEditAllEvents: false,
          canDeleteEvents: false,
          canManageUsers: false,
          canManageContracts: false,
          canViewFinancials: false,
          canManageSettings: false,
          canAccessChat: false,
          canCreateOpportunities: false,
          canManageCasting: false
        };
      default:
        return {
          canCreateContacts: false,
          canEditAllContacts: false,
          canDeleteContacts: false,
          canCreateEvents: false,
          canEditAllEvents: false,
          canDeleteEvents: false,
          canManageUsers: false,
          canManageContracts: false,
          canViewFinancials: false,
          canManageSettings: false,
          canAccessChat: false,
          canCreateOpportunities: false,
          canManageCasting: false
        };
    }
  };

  const getUserById = (id: string) => {
    return users.find(user => user.id === id);
  };

  const changeOwnership = (itemType: 'contact' | 'event', itemId: string, newOwnerId: string) => {
    console.log(`Changing ownership of ${itemType} ${itemId} to user ${newOwnerId}`);
  };

  const connectGoogleCalendar = (userId: string) => {
    updateUser(userId, { googleCalendarConnected: true });
  };

  const connectGmail = (userId: string) => {
    updateUser(userId, { gmailConnected: true });
  };

  return (
    <UserContext.Provider value={{
      currentUser,
      users,
      setCurrentUser,
      addUser,
      updateUser,
      removeUser,
      getUserPermissions,
      getUserById,
      changeOwnership,
      connectGoogleCalendar,
      connectGmail
    }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};
