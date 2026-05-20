import React, { useCallback, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { SidebarProvider } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/AppSidebar';
import { BackOfficeHeader } from '@/components/BackOfficeHeader';
import { ChatWidget } from '@/components/ChatWidget';
import { TaskNotificationBanner } from '@/components/TaskNotificationBanner';
import { useIsMobile } from '@/hooks/use-mobile';
import { MobileBottomNav } from '@/components/mobile/MobileBottomNav';

import { MobileTopBar } from '@/components/mobile/MobileTopBar';
import { useNotifications } from '@/hooks/useNotifications';
import { useEmailNotifications } from '@/hooks/useEmailNotifications';
import { usePWABadge } from '@/hooks/usePWABadge';
import { useUnreadBadgeCount } from '@/hooks/useUnreadBadgeCount';
import { PushNotificationPrompt } from '@/components/notifications/PushNotificationPrompt';
import { OnboardingTour } from '@/components/onboarding/OnboardingTour';
import { OfflineBanner } from '@/components/OfflineBanner';
import { usePullToRefresh } from '@/hooks/usePullToRefresh';
import { PullToRefreshIndicator } from '@/components/mobile/PullToRefreshIndicator';
import { useQueryClient } from '@tanstack/react-query';
import { logger } from '@/lib/logger';
import { openChatWithChannel, openChatWithChannelId, openChatWithRoadshowStop } from '@/lib/chatWidgetEvents';

const adminRoutes = [
  '/admin', '/dashboard', '/artists', '/events', '/agenda', '/contacts',
  '/contact-lists', '/contact-types', '/contracts', '/tasks', '/roadshow', '/road-show', '/email', '/email-campaigns',
  '/messagerie', '/forms', '/merchandise', '/show-bible', '/opportunities', '/event-types',
  '/user-management', '/preferences', '/application', '/publication-calendar', '/website', '/website-editor', '/assignments'
];

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const queryClient = useQueryClient();
  // Keep these hooks alive so the notification center still works
  useNotifications();
  useEmailNotifications();

  // Lightweight DB-count for the PWA system badge (icon dot)
  const badgeCount = useUnreadBadgeCount();
  usePWABadge(badgeCount);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('openChat') !== '1') return;

    const channelId = params.get('channelId');
    const roadshowStopId = params.get('roadshowStopId');
    const channelName = params.get('channelName');

    if (channelId) {
      openChatWithChannelId(channelId);
    } else if (roadshowStopId) {
      openChatWithRoadshowStop(roadshowStopId);
    } else if (channelName) {
      openChatWithChannel(channelName);
    }

    ['openChat', 'channelId', 'roadshowStopId', 'channelName', 'messageId'].forEach((key) => params.delete(key));
    const nextSearch = params.toString();
    navigate(`${location.pathname}${nextSearch ? `?${nextSearch}` : ''}`, { replace: true });
  }, [location.pathname, location.search, navigate]);

  const handleRefresh = useCallback(async () => {
    await queryClient.invalidateQueries();
  }, [queryClient]);

  const { containerRef, isRefreshing, pullDistance, pullProgress } = usePullToRefresh({
    onRefresh: handleRefresh,
    disabled: !isMobile,
  });
  
  const isAdminRoute = adminRoutes.some(route =>
    location.pathname === route || location.pathname.startsWith(route + '/')
  );
  
  logger.log('🏗️ Layout - Path:', location.pathname, 'isAdmin:', isAdminRoute, 'isMobile:', isMobile);
  
  if (!isAdminRoute) {
    return (
      <>
        <OfflineBanner />
        {children}
        <ChatWidget />
        <PushNotificationPrompt />
      </>
    );
  }

  // Mobile Admin Layout
  if (isMobile) {
    return (
      <div
        className="h-screen h-[100dvh] w-full max-w-full overflow-hidden bg-background"
      >
        <OfflineBanner />
        <MobileTopBar />
        
        <main 
          ref={containerRef}
          className="fixed left-0 right-0 overflow-y-auto overflow-x-hidden p-3 pb-6 bg-background"
          style={{
            top: 'calc(3.5rem + env(safe-area-inset-top))',
            bottom: 'calc(4rem + env(safe-area-inset-bottom))',
            WebkitOverflowScrolling: 'touch'
          }}
        >
          <PullToRefreshIndicator
            pullDistance={pullDistance}
            pullProgress={pullProgress}
            isRefreshing={isRefreshing}
          />
          <TaskNotificationBanner className="mb-3" />
          {children}
        </main>

        <MobileBottomNav />
        <ChatWidget />
        <PushNotificationPrompt />
        <OnboardingTour />
      </div>
    );
  }

  // Desktop Admin Layout
  return (
    <SidebarProvider>
      <OfflineBanner />
      <div className="flex h-screen w-full">
        <div className="hidden lg:block">
          <AppSidebar />
        </div>

        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="border-b">
            <BackOfficeHeader />
          </div>
          
          <main className="flex-1 overflow-auto p-2 sm:p-4 lg:p-6">
            <TaskNotificationBanner className="mb-2 sm:mb-4" />
            {children}
          </main>
        </div>
      </div>
      <ChatWidget />
      <PushNotificationPrompt />
      <OnboardingTour />
    </SidebarProvider>
  );
};
