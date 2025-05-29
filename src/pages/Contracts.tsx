
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, FileText, Download, Edit, Eye } from 'lucide-react';

interface Contract {
  id: string;
  title: string;
  artist: string;
  venue: string;
  eventDate: string;
  amount: string;
  status: 'draft' | 'sent' | 'signed' | 'executed';
  createdDate: string;
  signedDate?: string;
}

const sampleContracts: Contract[] = [
  {
    id: '1',
    title: 'Summer Festival 2024 - The Midnight Express',
    artist: 'The Midnight Express',
    venue: 'Central Park',
    eventDate: '2024-07-15',
    amount: '$50,000',
    status: 'signed',
    createdDate: '2024-05-20',
    signedDate: '2024-05-25'
  },
  {
    id: '2',
    title: 'Acoustic Night - Sarah Mitchell',
    artist: 'Sarah Mitchell',
    venue: 'Blue Note Jazz Club',
    eventDate: '2024-06-20',
    amount: '$8,500',
    status: 'sent',
    createdDate: '2024-06-01'
  },
  {
    id: '3',
    title: 'Rock Legends Tour - Thunder Road',
    artist: 'Thunder Road',
    venue: 'Madison Square Garden',
    eventDate: '2024-08-10',
    amount: '$75,000',
    status: 'draft',
    createdDate: '2024-06-10'
  }
];

const getStatusColor = (status: string) => {
  switch (status) {
    case 'signed':
      return 'bg-green-100 text-green-800';
    case 'sent':
      return 'bg-blue-100 text-blue-800';
    case 'executed':
      return 'bg-purple-100 text-purple-800';
    case 'draft':
      return 'bg-gray-100 text-gray-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

export const Contracts: React.FC = () => {
  const [contracts, setContracts] = useState<Contract[]>(sampleContracts);
  const [showCreateForm, setShowCreateForm] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Contract Management</h1>
          <p className="text-gray-600 mt-2">Create, manage, and track performance contracts</p>
        </div>
        <Button onClick={() => setShowCreateForm(true)} className="bg-purple-600 hover:bg-purple-700">
          <Plus className="h-4 w-4 mr-2" />
          Create Contract
        </Button>
      </div>

      {/* Contract Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6 text-center">
            <div className="text-2xl font-bold text-gray-900">
              {contracts.filter(c => c.status === 'draft').length}
            </div>
            <div className="text-sm text-gray-600">Draft</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 text-center">
            <div className="text-2xl font-bold text-blue-600">
              {contracts.filter(c => c.status === 'sent').length}
            </div>
            <div className="text-sm text-gray-600">Sent</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 text-center">
            <div className="text-2xl font-bold text-green-600">
              {contracts.filter(c => c.status === 'signed').length}
            </div>
            <div className="text-sm text-gray-600">Signed</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 text-center">
            <div className="text-2xl font-bold text-purple-600">
              {contracts.filter(c => c.status === 'executed').length}
            </div>
            <div className="text-sm text-gray-600">Executed</div>
          </CardContent>
        </Card>
      </div>

      {/* Contracts List */}
      <div className="space-y-4">
        {contracts.map((contract) => (
          <Card key={contract.id} className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <FileText className="h-5 w-5 text-purple-600" />
                    <h3 className="text-lg font-semibold text-gray-900">{contract.title}</h3>
                    <Badge className={getStatusColor(contract.status)}>
                      {contract.status.charAt(0).toUpperCase() + contract.status.slice(1)}
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4">
                    <div>
                      <p className="text-sm text-gray-500">Artist</p>
                      <p className="font-medium">{contract.artist}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Venue</p>
                      <p className="font-medium">{contract.venue}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Event Date</p>
                      <p className="font-medium">{new Date(contract.eventDate).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Amount</p>
                      <p className="font-medium text-green-600">{contract.amount}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-6 mt-4 text-sm text-gray-500">
                    <span>Created: {new Date(contract.createdDate).toLocaleDateString()}</span>
                    {contract.signedDate && (
                      <span>Signed: {new Date(contract.signedDate).toLocaleDateString()}</span>
                    )}
                  </div>
                </div>
                
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm">
                    <Eye className="h-3 w-3 mr-1" />
                    View
                  </Button>
                  <Button variant="outline" size="sm">
                    <Edit className="h-3 w-3 mr-1" />
                    Edit
                  </Button>
                  <Button variant="outline" size="sm">
                    <Download className="h-3 w-3 mr-1" />
                    Download
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Create Contract Form Modal */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <CardTitle>Create New Contract</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input placeholder="Contract Title" />
              <div className="grid grid-cols-2 gap-4">
                <Input placeholder="Artist Name" />
                <Input placeholder="Venue" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Input type="date" placeholder="Event Date" />
                <Input placeholder="Performance Fee" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Input placeholder="Show Time" />
                <Input placeholder="Sound Check Time" />
              </div>
              <textarea 
                placeholder="Special Requirements / Notes"
                className="w-full p-3 border border-gray-300 rounded-md"
                rows={4}
              />
              <div className="grid grid-cols-2 gap-4">
                <Input placeholder="Merchandise Split %" />
                <Input placeholder="Hospitality Requirements" />
              </div>
              <div className="flex space-x-3 pt-4">
                <Button onClick={() => setShowCreateForm(false)} variant="outline" className="flex-1">
                  Cancel
                </Button>
                <Button variant="outline" className="flex-1">
                  Save as Draft
                </Button>
                <Button onClick={() => setShowCreateForm(false)} className="flex-1 bg-purple-600 hover:bg-purple-700">
                  Create Contract
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};
