
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export const Website: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Rediriger automatiquement vers la gestion du site
    navigate('/website/backoffice', { replace: true });
  }, [navigate]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <h2 className="text-lg font-semibold text-gray-900">Redirection...</h2>
        <p className="text-gray-600">Vous êtes redirigé vers la gestion du site web.</p>
      </div>
    </div>
  );
};
