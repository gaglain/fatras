import React from 'react';
import { Button } from '@/components/ui/button';
import { Plus, Mail, Users, UserCheck, UserX } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface ContactsHeaderProps {
  stats: { total: number; clients: number; prospects: number; inactifs: number };
  onNewContact: () => void;
}

export const ContactsHeader: React.FC<ContactsHeaderProps> = ({ stats, onNewContact }) => {
  const navigate = useNavigate();

  return (
    <>
      <div className="flex flex-col space-y-4 lg:flex-row lg:items-center lg:justify-between lg:space-y-0">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-foreground">Contacts & Listes</h1>
          <p className="text-sm lg:text-base text-muted-foreground mt-1">Gérez vos contacts et organisez-les en listes pour vos campagnes</p>
        </div>
        <div className="flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-2 w-full sm:w-auto">
          <Button onClick={() => navigate('/email-campaigns')} variant="outline" size="sm" className="w-full sm:w-auto">
            <Mail className="h-4 w-4 mr-2" /><span className="hidden sm:inline">Campagnes Email</span><span className="sm:hidden">Email</span>
          </Button>
          <Button onClick={onNewContact} size="sm" className="w-full sm:w-auto">
            <Plus className="h-4 w-4 mr-2" /><span className="hidden sm:inline">Nouveau contact</span><span className="sm:hidden">Nouveau</span>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        {[
          { icon: Users, label: 'Total', value: stats.total, color: 'text-primary' },
          { icon: UserCheck, label: 'Clients', value: stats.clients, color: 'text-green-600' },
          { icon: Users, label: 'Prospects', value: stats.prospects, color: 'text-blue-600' },
          { icon: UserX, label: 'Inactifs', value: stats.inactifs, color: 'text-gray-600' },
        ].map(({ icon: Icon, label, value, color }) => (
          <div key={label} className="bg-card p-3 md:p-4 rounded-lg border shadow-sm">
            <div className="flex items-center space-x-2">
              <Icon className={`h-4 w-4 md:h-5 md:w-5 ${color}`} />
              <div>
                <p className="text-xs md:text-sm text-muted-foreground">{label}</p>
                <p className={`text-lg md:text-2xl font-bold ${color}`}>{value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
};
