
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Calendar, CheckSquare, Music, TrendingUp, Clock } from 'lucide-react';

const stats = [
  { name: 'Total Contacts', value: '2,847', icon: Users, change: '+12%', changeType: 'positive' },
  { name: 'Upcoming Events', value: '23', icon: Calendar, change: '+5%', changeType: 'positive' },
  { name: 'Pending Tasks', value: '47', icon: CheckSquare, change: '-8%', changeType: 'negative' },
  { name: 'Active Artists', value: '12', icon: Music, change: '+2%', changeType: 'positive' },
];

const recentActivities = [
  { type: 'contact', message: 'New contact added: John Smith - Venue Manager', time: '2 minutes ago' },
  { type: 'event', message: 'Summer Festival 2024 updated', time: '15 minutes ago' },
  { type: 'task', message: 'Contract review completed for Madison Square Garden', time: '1 hour ago' },
  { type: 'artist', message: 'Tour dates added for The Midnight Express', time: '2 hours ago' },
];

export const Dashboard: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-2">Welcome back! Here's what's happening with your bookings.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.name}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                    <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                    <p className={`text-sm ${stat.changeType === 'positive' ? 'text-green-600' : 'text-red-600'}`}>
                      {stat.change} from last month
                    </p>
                  </div>
                  <div className="bg-purple-100 p-3 rounded-lg">
                    <Icon className="h-6 w-6 text-purple-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Clock className="h-5 w-5 mr-2" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivities.map((activity, index) => (
                <div key={index} className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-purple-600 rounded-full mt-2"></div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-900">{activity.message}</p>
                    <p className="text-xs text-gray-500">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left">
                <Users className="h-6 w-6 text-purple-600 mb-2" />
                <p className="font-medium">Add Contact</p>
                <p className="text-sm text-gray-500">Create new contact</p>
              </button>
              <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left">
                <Calendar className="h-6 w-6 text-purple-600 mb-2" />
                <p className="font-medium">Schedule Event</p>
                <p className="text-sm text-gray-500">Plan new show</p>
              </button>
              <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left">
                <CheckSquare className="h-6 w-6 text-purple-600 mb-2" />
                <p className="font-medium">Create Task</p>
                <p className="text-sm text-gray-500">Add to-do item</p>
              </button>
              <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left">
                <Music className="h-6 w-6 text-purple-600 mb-2" />
                <p className="font-medium">Add Artist</p>
                <p className="text-sm text-gray-500">Manage talent</p>
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
