
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Search, Phone, Mail, User } from 'lucide-react';

interface Contact {
  id: string;
  name: string;
  phone: string;
  email: string;
  owner: string;
  company?: string;
  role?: string;
}

const sampleContacts: Contact[] = [
  {
    id: '1',
    name: 'John Smith',
    phone: '+1 (555) 123-4567',
    email: 'john.smith@venue.com',
    owner: 'Alice Johnson',
    company: 'Madison Square Garden',
    role: 'Venue Manager'
  },
  {
    id: '2',
    name: 'Sarah Wilson',
    phone: '+1 (555) 987-6543',
    email: 'sarah@festivalprods.com',
    owner: 'Bob Miller',
    company: 'Festival Productions',
    role: 'Event Coordinator'
  },
  {
    id: '3',
    name: 'Mike Rodriguez',
    phone: '+1 (555) 456-7890',
    email: 'mike.r@soundtech.com',
    owner: 'Alice Johnson',
    company: 'Sound Tech Solutions',
    role: 'Audio Engineer'
  }
];

export const Contacts: React.FC = () => {
  const [contacts, setContacts] = useState<Contact[]>(sampleContacts);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);

  const filteredContacts = contacts.filter(contact =>
    contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    contact.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    contact.company?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Contacts</h1>
          <p className="text-gray-600 mt-2">Manage your venue managers, promoters, and industry contacts</p>
        </div>
        <Button onClick={() => setShowAddForm(true)} className="bg-purple-600 hover:bg-purple-700">
          <Plus className="h-4 w-4 mr-2" />
          Add Contact
        </Button>
      </div>

      {/* Search and Filters */}
      <div className="flex items-center space-x-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search contacts..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button variant="outline">Import Contacts</Button>
        <Button variant="outline">Export</Button>
      </div>

      {/* Contacts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredContacts.map((contact) => (
          <Card key={contact.id} className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader className="pb-3">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                  <User className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <CardTitle className="text-lg">{contact.name}</CardTitle>
                  <p className="text-sm text-gray-500">{contact.role}</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center text-sm text-gray-600">
                <Mail className="h-4 w-4 mr-2" />
                {contact.email}
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <Phone className="h-4 w-4 mr-2" />
                {contact.phone}
              </div>
              {contact.company && (
                <div className="text-sm text-gray-600">
                  <strong>Company:</strong> {contact.company}
                </div>
              )}
              <div className="text-sm text-gray-600">
                <strong>Owner:</strong> {contact.owner}
              </div>
              <div className="flex space-x-2 pt-3">
                <Button size="sm" variant="outline" className="flex-1">
                  <Mail className="h-3 w-3 mr-1" />
                  Email
                </Button>
                <Button size="sm" variant="outline" className="flex-1">
                  <Phone className="h-3 w-3 mr-1" />
                  Call
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Add Contact Form Modal would go here */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md mx-4">
            <CardHeader>
              <CardTitle>Add New Contact</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input placeholder="Full Name" />
              <Input placeholder="Email Address" />
              <Input placeholder="Phone Number" />
              <Input placeholder="Company" />
              <Input placeholder="Role/Title" />
              <Input placeholder="Owner" />
              <div className="flex space-x-3 pt-4">
                <Button onClick={() => setShowAddForm(false)} variant="outline" className="flex-1">
                  Cancel
                </Button>
                <Button onClick={() => setShowAddForm(false)} className="flex-1 bg-purple-600 hover:bg-purple-700">
                  Save Contact
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};
