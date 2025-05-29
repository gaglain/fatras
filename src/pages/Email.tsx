
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Mail, Send, Calendar, Phone } from 'lucide-react';

interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  category: string;
  content: string;
}

interface ScheduledEmail {
  id: string;
  to: string;
  subject: string;
  scheduledFor: string;
  status: 'scheduled' | 'sent' | 'failed';
}

const emailTemplates: EmailTemplate[] = [
  {
    id: '1',
    name: 'Contract Follow-up',
    subject: 'Following up on contract for {{event_name}}',
    category: 'Contract',
    content: 'Hi {{contact_name}},\n\nI hope this email finds you well. I wanted to follow up on the contract we sent for {{event_name}} on {{event_date}}...'
  },
  {
    id: '2',
    name: 'Show Confirmation',
    subject: 'Show confirmation - {{artist_name}} at {{venue}}',
    category: 'Booking',
    content: 'Dear {{contact_name}},\n\nWe are pleased to confirm the booking for {{artist_name}} at {{venue}} on {{event_date}}...'
  },
  {
    id: '3',
    name: 'Technical Requirements',
    subject: 'Technical rider and stage requirements',
    category: 'Technical',
    content: 'Hello {{contact_name}},\n\nPlease find attached the technical rider and stage requirements for {{artist_name}}...'
  }
];

const scheduledEmails: ScheduledEmail[] = [
  {
    id: '1',
    to: 'john.smith@venue.com',
    subject: 'Contract follow-up for Summer Festival',
    scheduledFor: '2024-06-15T10:00:00',
    status: 'scheduled'
  },
  {
    id: '2',
    to: 'sarah@festivalprods.com',
    subject: 'Technical requirements for Thunder Road',
    scheduledFor: '2024-06-16T14:30:00',
    status: 'scheduled'
  }
];

export const Email: React.FC = () => {
  const [showCompose, setShowCompose] = useState(false);
  const [showScheduled, setShowScheduled] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Email Management</h1>
          <p className="text-gray-600 mt-2">Send emails, schedule communications, and manage templates</p>
        </div>
        <div className="flex space-x-3">
          <Button onClick={() => setShowScheduled(!showScheduled)} variant="outline">
            <Calendar className="h-4 w-4 mr-2" />
            Scheduled ({scheduledEmails.length})
          </Button>
          <Button onClick={() => setShowCompose(true)} className="bg-purple-600 hover:bg-purple-700">
            <Plus className="h-4 w-4 mr-2" />
            Compose Email
          </Button>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="cursor-pointer hover:shadow-lg transition-shadow">
          <CardContent className="p-6 text-center">
            <Mail className="h-8 w-8 text-purple-600 mx-auto mb-3" />
            <h3 className="font-semibold text-gray-900">Send Email</h3>
            <p className="text-sm text-gray-600">Compose and send emails to contacts</p>
          </CardContent>
        </Card>
        
        <Card className="cursor-pointer hover:shadow-lg transition-shadow">
          <CardContent className="p-6 text-center">
            <Calendar className="h-8 w-8 text-purple-600 mx-auto mb-3" />
            <h3 className="font-semibold text-gray-900">Schedule Meeting</h3>
            <p className="text-sm text-gray-600">Set up calls and meetings</p>
          </CardContent>
        </Card>
        
        <Card className="cursor-pointer hover:shadow-lg transition-shadow">
          <CardContent className="p-6 text-center">
            <Phone className="h-8 w-8 text-purple-600 mx-auto mb-3" />
            <h3 className="font-semibold text-gray-900">Phone Call</h3>
            <p className="text-sm text-gray-600">Log and track phone communications</p>
          </CardContent>
        </Card>
      </div>

      {/* Scheduled Emails */}
      {showScheduled && (
        <Card>
          <CardHeader>
            <CardTitle>Scheduled Emails</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {scheduledEmails.map((email) => (
                <div key={email.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">{email.subject}</h4>
                    <p className="text-sm text-gray-600">To: {email.to}</p>
                    <p className="text-sm text-gray-500">
                      Scheduled for: {new Date(email.scheduledFor).toLocaleString()}
                    </p>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Badge variant={email.status === 'scheduled' ? 'default' : 'secondary'}>
                      {email.status}
                    </Badge>
                    <Button variant="outline" size="sm">Edit</Button>
                    <Button variant="outline" size="sm">Cancel</Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Email Templates */}
      <Card>
        <CardHeader>
          <CardTitle>Email Templates</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {emailTemplates.map((template) => (
              <Card key={template.id} className="cursor-pointer hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-medium text-gray-900">{template.name}</h3>
                    <Badge variant="outline">{template.category}</Badge>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">{template.subject}</p>
                  <p className="text-xs text-gray-500 mb-4 line-clamp-3">
                    {template.content.substring(0, 100)}...
                  </p>
                  <div className="flex space-x-2">
                    <Button size="sm" variant="outline" className="flex-1">
                      <Send className="h-3 w-3 mr-1" />
                      Use
                    </Button>
                    <Button size="sm" variant="outline">Edit</Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Compose Email Modal */}
      {showCompose && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <CardTitle>Compose Email</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Input placeholder="To" />
                <Input placeholder="CC (optional)" />
              </div>
              <Input placeholder="Subject" />
              <textarea 
                placeholder="Compose your email..."
                className="w-full p-3 border border-gray-300 rounded-md"
                rows={12}
              />
              <div className="flex items-center space-x-4">
                <label className="flex items-center space-x-2">
                  <input type="checkbox" className="rounded" />
                  <span className="text-sm">Schedule for later</span>
                </label>
                <Input type="datetime-local" className="w-auto" />
              </div>
              <div className="flex space-x-3 pt-4">
                <Button onClick={() => setShowCompose(false)} variant="outline" className="flex-1">
                  Cancel
                </Button>
                <Button variant="outline" className="flex-1">
                  Save as Draft
                </Button>
                <Button onClick={() => setShowCompose(false)} className="flex-1 bg-purple-600 hover:bg-purple-700">
                  <Send className="h-4 w-4 mr-2" />
                  Send
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};
