
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Plus, Mail, Phone, Calendar, User } from 'lucide-react';

interface Task {
  id: string;
  title: string;
  type: 'email' | 'phone' | 'meeting' | 'contract' | 'other';
  priority: 'high' | 'medium' | 'low';
  owner: string;
  dueDate: string;
  completed: boolean;
  description?: string;
}

const sampleTasks: Task[] = [
  {
    id: '1',
    title: 'Send contract to Madison Square Garden',
    type: 'email',
    priority: 'high',
    owner: 'Alice Johnson',
    dueDate: '2024-06-15',
    completed: false,
    description: 'Send finalized contract for July concert'
  },
  {
    id: '2',
    title: 'Call venue about sound requirements',
    type: 'phone',
    priority: 'medium',
    owner: 'Bob Miller',
    dueDate: '2024-06-12',
    completed: true,
    description: 'Discuss audio setup for acoustic show'
  },
  {
    id: '3',
    title: 'Schedule meeting with artist management',
    type: 'meeting',
    priority: 'high',
    owner: 'Alice Johnson',
    dueDate: '2024-06-14',
    completed: false,
    description: 'Discuss tour logistics and requirements'
  }
];

const getTypeIcon = (type: string) => {
  switch (type) {
    case 'email':
      return Mail;
    case 'phone':
      return Phone;
    case 'meeting':
      return Calendar;
    default:
      return User;
  }
};

const getPriorityColor = (priority: string) => {
  switch (priority) {
    case 'high':
      return 'bg-red-100 text-red-800';
    case 'medium':
      return 'bg-yellow-100 text-yellow-800';
    case 'low':
      return 'bg-green-100 text-green-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

export const Tasks: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>(sampleTasks);
  const [showAddForm, setShowAddForm] = useState(false);

  const toggleTaskCompletion = (taskId: string) => {
    setTasks(tasks.map(task => 
      task.id === taskId ? { ...task, completed: !task.completed } : task
    ));
  };

  const completedTasks = tasks.filter(task => task.completed);
  const pendingTasks = tasks.filter(task => !task.completed);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Task Management</h1>
          <p className="text-gray-600 mt-2">Track emails, calls, meetings, and other important tasks</p>
        </div>
        <Button onClick={() => setShowAddForm(true)} className="bg-purple-600 hover:bg-purple-700">
          <Plus className="h-4 w-4 mr-2" />
          Add Task
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardContent className="p-6 text-center">
            <div className="text-3xl font-bold text-purple-600">{pendingTasks.length}</div>
            <div className="text-sm text-gray-600">Pending Tasks</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 text-center">
            <div className="text-3xl font-bold text-green-600">{completedTasks.length}</div>
            <div className="text-sm text-gray-600">Completed</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 text-center">
            <div className="text-3xl font-bold text-gray-600">{tasks.length}</div>
            <div className="text-sm text-gray-600">Total Tasks</div>
          </CardContent>
        </Card>
      </div>

      {/* Pending Tasks */}
      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Pending Tasks</h2>
          <div className="space-y-3">
            {pendingTasks.map((task) => {
              const TypeIcon = getTypeIcon(task.type);
              return (
                <Card key={task.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-4">
                      <Checkbox
                        checked={task.completed}
                        onCheckedChange={() => toggleTaskCompletion(task.id)}
                      />
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <TypeIcon className="h-4 w-4 text-purple-600" />
                          <h3 className="font-medium text-gray-900">{task.title}</h3>
                          <Badge className={getPriorityColor(task.priority)}>
                            {task.priority}
                          </Badge>
                        </div>
                        {task.description && (
                          <p className="text-sm text-gray-600 mb-2">{task.description}</p>
                        )}
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <span>Due: {new Date(task.dueDate).toLocaleDateString()}</span>
                          <span>Owner: {task.owner}</span>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm">Edit</Button>
                        <Button variant="outline" size="sm">Complete</Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Completed Tasks */}
        {completedTasks.length > 0 && (
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Completed Tasks</h2>
            <div className="space-y-3">
              {completedTasks.map((task) => {
                const TypeIcon = getTypeIcon(task.type);
                return (
                  <Card key={task.id} className="opacity-75">
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-4">
                        <Checkbox
                          checked={task.completed}
                          onCheckedChange={() => toggleTaskCompletion(task.id)}
                        />
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <TypeIcon className="h-4 w-4 text-gray-400" />
                            <h3 className="font-medium text-gray-600 line-through">{task.title}</h3>
                          </div>
                          <div className="flex items-center space-x-4 text-sm text-gray-400">
                            <span>Completed</span>
                            <span>Owner: {task.owner}</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Add Task Form Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-lg mx-4">
            <CardHeader>
              <CardTitle>Add New Task</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input placeholder="Task Title" />
              <select className="w-full p-2 border border-gray-300 rounded-md">
                <option value="">Select Task Type</option>
                <option value="email">Email</option>
                <option value="phone">Phone Call</option>
                <option value="meeting">Meeting</option>
                <option value="contract">Contract</option>
                <option value="other">Other</option>
              </select>
              <select className="w-full p-2 border border-gray-300 rounded-md">
                <option value="">Select Priority</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
              <Input placeholder="Owner" />
              <Input type="date" placeholder="Due Date" />
              <textarea 
                placeholder="Description (optional)"
                className="w-full p-2 border border-gray-300 rounded-md"
                rows={3}
              />
              <div className="flex space-x-3 pt-4">
                <Button onClick={() => setShowAddForm(false)} variant="outline" className="flex-1">
                  Cancel
                </Button>
                <Button onClick={() => setShowAddForm(false)} className="flex-1 bg-purple-600 hover:bg-purple-700">
                  Save Task
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};
