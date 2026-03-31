import React from 'react';
import { Button } from '@/components/ui/button';
import { EmailInbox } from '@/components/EmailInbox';
import { EmailSender } from '@/components/EmailSender';
import { EmailAnalytics } from '@/components/EmailAnalytics';
import { UnifiedEmailManager } from '@/components/UnifiedEmailManager';

interface EmailSubViewProps {
  title: string;
  subtitle: string;
  onBack: () => void;
  children: React.ReactNode;
  maxWidth?: string;
}

const EmailSubView: React.FC<EmailSubViewProps> = ({ title, subtitle, onBack, children, maxWidth = 'max-w-4xl' }) => (
  <div className="h-full">
    <div className="bg-background/80 backdrop-blur-sm border-b border-border/50 p-6 sticky top-0 z-10">
      <div className="flex items-center gap-4 max-w-7xl mx-auto">
        <Button variant="outline" onClick={onBack}>← Retour</Button>
        <div>
          <h1 className="text-3xl font-bold">{title}</h1>
          <p className="text-muted-foreground">{subtitle}</p>
        </div>
      </div>
    </div>
    <div className={`${maxWidth} mx-auto p-6`}>{children}</div>
  </div>
);

export const EmailInboxView: React.FC<{ onBack: () => void }> = ({ onBack }) => (
  <EmailSubView title="Boîte de réception" subtitle="Consultez vos emails reçus" onBack={onBack}>
    <EmailInbox />
  </EmailSubView>
);

export const EmailSenderView: React.FC<{ onBack: () => void }> = ({ onBack }) => (
  <EmailSubView title="Envoi d'Email Rapide" subtitle="Composez et envoyez un email directement" onBack={onBack}>
    <EmailSender />
  </EmailSubView>
);

export const EmailAnalyticsView: React.FC<{ onBack: () => void }> = ({ onBack }) => (
  <EmailSubView title="Analytics Email" subtitle="Statistiques et performances des campagnes" onBack={onBack} maxWidth="max-w-7xl">
    <EmailAnalytics />
  </EmailSubView>
);

export const EmailUnifiedView: React.FC<{ onBack: () => void }> = ({ onBack }) => (
  <EmailSubView title="Centralisation Email" subtitle="Tous vos emails reçus et envoyés par adresse" onBack={onBack} maxWidth="max-w-6xl">
    <UnifiedEmailManager />
  </EmailSubView>
);
