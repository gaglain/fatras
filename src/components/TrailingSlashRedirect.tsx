import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

/**
 * Normalise les URLs publiques : supprime le slash final (ex: /boutique/ -> /boutique)
 * afin d'éviter les doublons d'indexation signalés par Google Search Console.
 */
export const TrailingSlashRedirect = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const { pathname, search, hash } = location;
    if (pathname !== '/' && pathname.endsWith('/')) {
      const cleaned = pathname.replace(/\/+$/, '') || '/';
      navigate(`${cleaned}${search}${hash}`, { replace: true });
    }
  }, [location, navigate]);

  return null;
};
