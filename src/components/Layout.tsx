
import React from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { ChatWidget } from './ChatWidget';
import { useAuth } from '@/hooks/useAuth';

export const Layout: React.FC = () => {
  const { user } = useAuth();
  
  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Header 
          companyName="Fatras Booking"
        />
        <main className="flex-1 p-6 overflow-auto">
          <Outlet />
        </main>
      </div>
      {user && <ChatWidget />}
    </div>
  );
};
