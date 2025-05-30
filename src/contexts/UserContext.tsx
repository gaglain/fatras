
import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'manager' | 'member';
  avatar?: string;
  isActive: boolean;
}

export interface UserPermissions {
  canCreateContacts: boolean;
  canEditAllContacts: boolean;
  canDeleteContacts: boolean;
  canCreateEvents: boolean;
  canEditAllEvents: boolean;
  canDeleteEvents: boolean;
  canManageUsers: boolean;
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
}

const UserContext = createContext<UserContextType | undefined>(undefined);

const sampleUsers: User[] = [
  {
    id: 'user-1',
    name: 'Alice Johnson',
    email: 'alice@showmanager.com',
    role: 'admin',
    isActive: true
  },
  {
    id: 'user-2',
    name: 'Bob Miller',
    email: 'bob@showmanager.com',
    role: 'manager',
    isActive: true
  },
  {
    id: 'user-3',
    name: 'Charlie Brown',
    email: 'charlie@showmanager.com',
    role: 'member',
    isActive: true
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
      case 'admin':
        return {
          canCreateContacts: true,
          canEditAllContacts: true,
          canDeleteContacts: true,
          canCreateEvents: true,
          canEditAllEvents: true,
          canDeleteEvents: true,
          canManageUsers: true
        };
      case 'manager':
        return {
          canCreateContacts: true,
          canEditAllContacts: true,
          canDeleteContacts: false,
          canCreateEvents: true,
          canEditAllEvents: true,
          canDeleteEvents: false,
          canManageUsers: false
        };
      case 'member':
        return {
          canCreateContacts: true,
          canEditAllContacts: false,
          canDeleteContacts: false,
          canCreateEvents: true,
          canEditAllEvents: false,
          canDeleteEvents: false,
          canManageUsers: false
        };
      default:
        return {
          canCreateContacts: false,
          canEditAllContacts: false,
          canDeleteContacts: false,
          canCreateEvents: false,
          canEditAllEvents: false,
          canDeleteEvents: false,
          canManageUsers: false
        };
    }
  };

  const getUserById = (id: string) => {
    return users.find(user => user.id === id);
  };

  const changeOwnership = (itemType: 'contact' | 'event', itemId: string, newOwnerId: string) => {
    // This would be implemented to update ownership in the respective data stores
    console.log(`Changing ownership of ${itemType} ${itemId} to user ${newOwnerId}`);
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
      changeOwnership
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
