import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Users, Calendar, FileText, Mail } from 'lucide-react';
import { Link } from 'react-router-dom';

const quickActions = [
  { to: '/contacts', icon: Users, label: 'Contacts', desc: 'Gérer vos contacts et prospects', color: 'var(--custom-buttonBg, #1632f4)' },
  { to: '/events', icon: Calendar, label: 'Événements', desc: 'Planifier et gérer vos événements', color: 'var(--custom-secondary, #ec5f65)' },
  { to: '/contracts', icon: FileText, label: 'Devis', desc: 'Créer et suivre vos devis', color: 'var(--custom-accent, #f5a623)' },
  { to: '/email-campaigns', icon: Mail, label: 'Marketing', desc: 'Campagnes et automatisation', color: 'var(--custom-buttonBg, #1632f4)' },
];

export const DashboardQuickActions: React.FC = () => (
  <div className="grid gap-3 sm:gap-4 md:gap-6 grid-cols-2 lg:grid-cols-4">
    {quickActions.map(({ to, icon: Icon, label, desc, color }) => (
      <Card key={to} className="hover:shadow-md hover:scale-105 transition-all cursor-pointer" style={{
        background: 'var(--custom-cardBg, #ffffff)',
        color: 'var(--custom-cardText, #18181b)',
        border: '1px solid rgba(0,0,0,0.1)'
      }}>
        <Link to={to}>
          <CardContent className="p-3 md:p-6 text-center">
            <Icon className="h-6 w-6 md:h-8 md:w-8 mx-auto mb-2 md:mb-3" style={{ color }} />
            <h3 className="text-sm md:text-base font-semibold truncate" style={{ color: 'var(--custom-cardText, #18181b)' }}>
              {label}
            </h3>
            <p className="text-xs md:text-sm mt-1 hidden md:block" style={{ color: 'var(--custom-text, #666666)' }}>
              {desc}
            </p>
          </CardContent>
        </Link>
      </Card>
    ))}
  </div>
);
