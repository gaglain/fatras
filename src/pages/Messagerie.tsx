import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Mail, Globe } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useIsMobile } from '@/hooks/use-mobile';
import { AdminPublicChatFeed } from '@/components/AdminPublicChatFeed';
import { UnifiedEmailManager } from '@/components/UnifiedEmailManager';

export const Messagerie: React.FC = () => {
  const { user } = useAuth();
  const location = useLocation();
  const isMobile = useIsMobile();
  
  const navigationState = location.state as { tab?: string; visitorId?: string } | null;
  const [activeTab, setActiveTab] = useState(navigationState?.tab === 'public' ? 'public' : 'emails');
  const [initialVisitorId, setInitialVisitorId] = useState<string | undefined>(navigationState?.visitorId);

  useEffect(() => {
    if (navigationState?.tab === 'public') {
      setActiveTab('public');
    }
    if (navigationState?.visitorId) {
      setInitialVisitorId(navigationState.visitorId);
    }
  }, [navigationState]);

  if (isMobile) {
    return (
      <div className="p-4 space-y-4">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="w-full">
            <TabsTrigger value="emails" className="flex-1 flex items-center gap-1.5 text-sm">
              <Mail className="h-4 w-4" />
              Emails
            </TabsTrigger>
            <TabsTrigger value="public" className="flex-1 flex items-center gap-1.5 text-sm">
              <Globe className="h-4 w-4" />
              Chat Public
            </TabsTrigger>
          </TabsList>

          <TabsContent value="emails" className="mt-4">
            <UnifiedEmailManager />
          </TabsContent>

          <TabsContent value="public" className="mt-4">
            <AdminPublicChatFeed initialVisitorId={initialVisitorId} />
          </TabsContent>
        </Tabs>
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-6 space-y-4">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <div className="overflow-x-auto -mx-4 px-4 md:mx-0 md:px-0 mb-4">
          <TabsList className="inline-flex w-auto min-w-full md:w-auto">
            <TabsTrigger value="emails" className="flex items-center gap-1.5 px-3 shrink-0 text-sm">
              <Mail className="h-4 w-4" />
              <span className="hidden sm:inline">Emails</span>
              <span className="sm:hidden">Emails</span>
            </TabsTrigger>
            <TabsTrigger value="public" className="flex items-center gap-1.5 px-3 shrink-0 text-sm">
              <Globe className="h-4 w-4" />
              <span className="hidden sm:inline">Chat Public (Site Web)</span>
              <span className="sm:hidden">Chat Public</span>
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="emails" className="mt-0">
          <UnifiedEmailManager />
        </TabsContent>

        <TabsContent value="public" className="mt-0">
          <AdminPublicChatFeed initialVisitorId={initialVisitorId} />
        </TabsContent>
      </Tabs>
    </div>
  );
};
