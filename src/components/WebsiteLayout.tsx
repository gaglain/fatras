
import React from 'react';

interface WebsiteLayoutProps {
  children: React.ReactNode;
}

export const WebsiteLayout: React.FC<WebsiteLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-white">
      {children}
    </div>
  );
};
