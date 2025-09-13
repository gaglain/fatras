import React, { useEffect } from 'react';
import { useWebsiteMenuSync } from '@/hooks/useWebsiteMenuSync';

// Mounts the website menu sync hook globally so that:
// - Menu loads from Supabase on app start and populates localStorage
// - Any `websiteMenuUpdated` events are mirrored to Supabase via upsert
// - Consumers listening to localStorage/events stay in sync
export const WebsiteMenuSyncBridge: React.FC = () => {
  const { loadMenu } = useWebsiteMenuSync();

  useEffect(() => {
    // Initial load to hydrate from Supabase -> localStorage -> event
    loadMenu();
  }, [loadMenu]);

  return null;
};
