import React from 'react';

// Provider vide pour compatibilité - utilisez maintenant useCentralizedData hook directement
export const CentralizedDataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <>{children}</>;
};