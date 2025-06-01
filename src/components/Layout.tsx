
import React from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { ChatWidget } from './ChatWidget';
import { useUser } from '@/contexts/UserContext';

export const Layout: React.FC = () => {
  const { currentUser } = useUser();
  
  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Header 
          companyName="ShowManager Pro"
        />
        <main className="flex-1 p-6 overflow-auto">
          <Outlet />
        </main>
      </div>
      {currentUser && <ChatWidget />}
    </div>
  );
};
