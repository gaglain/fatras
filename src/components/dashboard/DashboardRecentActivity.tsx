import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar } from 'lucide-react';
import { Link } from 'react-router-dom';

const cardStyle = {
  background: 'var(--custom-cardBg, #ffffff)',
  color: 'var(--custom-cardText, #18181b)',
  border: '1px solid rgba(0,0,0,0.1)'
};

const activities = [
  { color: 'bg-green-400', label: 'Nouveau contact ajouté', time: 'Il y a 2 heures' },
  { color: 'bg-blue-400', label: 'Événement planifié', time: 'Hier' },
  { color: 'bg-purple-400', label: 'Devis envoyé', time: 'Il y a 3 jours' },
];

export const DashboardRecentActivity: React.FC = () => (
  <div className="grid gap-3 sm:gap-4 md:gap-6 grid-cols-1 md:grid-cols-2">
    <Card style={cardStyle}>
      <CardHeader>
        <CardTitle style={{ color: 'var(--custom-cardText, #18181b)' }}>Activité Récente</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.map((a, i) => (
            <div key={i} className="flex items-center space-x-3">
              <div className={`w-2 h-2 ${a.color} rounded-full`} />
              <div>
                <p className="text-sm font-medium" style={{ color: 'var(--custom-cardText, #18181b)' }}>{a.label}</p>
                <p className="text-xs" style={{ color: 'var(--custom-text, #666666)' }}>{a.time}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>

    <Card style={cardStyle}>
      <CardHeader>
        <CardTitle style={{ color: 'var(--custom-cardText, #18181b)' }}>Prochains Événements</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="text-center py-4" style={{ color: 'var(--custom-text, #666666)' }}>
            <Calendar className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">Aucun événement planifié</p>
            <Link to="/events">
              <Button variant="outline" size="sm" className="mt-2 back-office-button">
                Créer un événement
              </Button>
            </Link>
          </div>
        </div>
      </CardContent>
    </Card>
  </div>
);
