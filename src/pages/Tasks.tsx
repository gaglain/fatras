
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Mail, Phone, Calendar, User, Bell, Clock, Users } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Task {
  id: string;
  title: string;
  type: 'email' | 'phone' | 'meeting' | 'other';
  priority: 'high' | 'medium' | 'low';
  owner: string;
  dueDate: string;
  status: 'todo' | 'in-progress' | 'done';
  contact?: string;
  event?: string;
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
    status: 'todo',
    contact: 'John Smith - MSG',
    event: 'Summer Concert Series',
    description: 'Send finalized contract for July concert'
  },
  {
    id: '2',
    title: 'Call venue about sound requirements',
    type: 'phone',
    priority: 'medium',
    owner: 'Bob Miller',
    dueDate: '2024-06-12',
    status: 'in-progress',
    contact: 'Sarah Williams',
    event: 'Acoustic Night',
    description: 'Discuss audio setup for acoustic show'
  },
  {
    id: '3',
    title: 'Schedule meeting with artist management',
    type: 'meeting',
    priority: 'high',
    owner: 'Alice Johnson',
    dueDate: '2024-06-14',
    status: 'done',
    contact: 'Mike Producer',
    event: 'World Tour 2024',
    description: 'Discuss tour logistics and requirements'
  },
  {
    id: '4',
    title: 'Follow up on venue availability',
    type: 'email',
    priority: 'medium',
    owner: 'Carol Davis',
    dueDate: '2024-06-10',
    status: 'todo',
    contact: 'Venue Manager',
    event: 'Festival Booking'
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

const isOverdue = (dueDate: string) => {
  return new Date(dueDate) < new Date();
};

const isDueSoon = (dueDate: string) => {
  const due = new Date(dueDate);
  const today = new Date();
  const diffTime = due.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays <= 2 && diffDays >= 0;
};

export const Tasks: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>(sampleTasks);
  const [showAddForm, setShowAddForm] = useState(false);
  const [view, setView] = useState<'kanban' | 'list'>('kanban');
  const { toast } = useToast();

  const moveTask = (taskId: string, newStatus: 'todo' | 'in-progress' | 'done') => {
    setTasks(tasks.map(task => 
      task.id === taskId ? { ...task, status: newStatus } : task
    ));
    toast({
      title: "Task Updated",
      description: "Task status has been updated successfully.",
    });
  };

  const todoTasks = tasks.filter(task => task.status === 'todo');
  const inProgressTasks = tasks.filter(task => task.status === 'in-progress');
  const doneTasks = tasks.filter(task => task.status === 'done');

  const overdueTasks = tasks.filter(task => isOverdue(task.dueDate) && task.status !== 'done');
  const dueSoonTasks = tasks.filter(task => isDueSoon(task.dueDate) && task.status !== 'done');

  // Show notifications for overdue and due soon tasks
  React.useEffect(() => {
    if (overdueTasks.length > 0) {
      toast({
        title: "Overdue Tasks",
        description: `You have ${overdueTasks.length} overdue tasks that need attention.`,
        variant: "destructive"
      });
    }
    if (dueSoonTasks.length > 0) {
      toast({
        title: "Tasks Due Soon",
        description: `You have ${dueSoonTasks.length} tasks due within 2 days.`,
      });
    }
  }, []);

  const TaskCard = ({ task }: { task: Task }) => {
    const TypeIcon = getTypeIcon(task.type);
    const isTaskOverdue = isOverdue(task.dueDate);
    const isTaskDueSoon = isDueSoon(task.dueDate);

    return (
      <Card className={`mb-3 hover:shadow-md transition-shadow cursor-pointer ${
        isTaskOverdue ? 'border-red-300 bg-red-50' : 
        isTaskDueSoon ? 'border-yellow-300 bg-yellow-50' : ''
      }`}>
        <CardContent className="p-4">
          <div className="space-y-3">
            <div className="flex items-start justify-between">
              <h3 className="font-medium text-sm">{task.title}</h3>
              {(isTaskOverdue || isTaskDueSoon) && (
                <Bell className={`h-4 w-4 ${isTaskOverdue ? 'text-red-500' : 'text-yellow-500'}`} />
              )}
            </div>
            
            <div className="flex items-center space-x-2">
              <TypeIcon className="h-3 w-3 text-purple-600" />
              <Badge className={`${getPriorityColor(task.priority)} text-xs`}>
                {task.priority}
              </Badge>
            </div>

            <div className="space-y-2 text-xs text-gray-600">
              <div className="flex items-center space-x-1">
                <Clock className="h-3 w-3" />
                <span className={isTaskOverdue ? 'text-red-600 font-medium' : ''}>
                  Due: {new Date(task.dueDate).toLocaleDateString()}
                </span>
              </div>
              
              {task.contact && (
                <div className="flex items-center space-x-1">
                  <User className="h-3 w-3" />
                  <span>Contact: {task.contact}</span>
                </div>
              )}
              
              {task.event && (
                <div className="flex items-center space-x-1">
                  <Calendar className="h-3 w-3" />
                  <span>Event: {task.event}</span>
                </div>
              )}
              
              <div className="flex items-center space-x-1">
                <Users className="h-3 w-3" />
                <span>Owner: {task.owner}</span>
              </div>
            </div>

            <div className="flex space-x-1 pt-2">
              {task.status !== 'todo' && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="text-xs h-6 px-2"
                  onClick={() => moveTask(task.id, 'todo')}
                >
                  To Do
                </Button>
              )}
              {task.status !== 'in-progress' && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="text-xs h-6 px-2"
                  onClick={() => moveTask(task.id, 'in-progress')}
                >
                  In Progress
                </Button>
              )}
              {task.status !== 'done' && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="text-xs h-6 px-2"
                  onClick={() => moveTask(task.id, 'done')}
                >
                  Done
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Task Management</h1>
          <p className="text-gray-600 mt-2">Track emails, calls, meetings, and other important tasks</p>
        </div>
        <div className="flex space-x-3">
          <Select value={view} onValueChange={(value: 'kanban' | 'list') => setView(value)}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="kanban">Kanban</SelectItem>
              <SelectItem value="list">List</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={() => setShowAddForm(true)} className="bg-purple-600 hover:bg-purple-700">
            <Plus className="h-4 w-4 mr-2" />
            Add Task
          </Button>
        </div>
      </div>

      {/* Notifications Summary */}
      {(overdueTasks.length > 0 || dueSoonTasks.length > 0) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {overdueTasks.length > 0 && (
            <Card className="border-red-200 bg-red-50">
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <Bell className="h-5 w-5 text-red-600" />
                  <div>
                    <div className="font-medium text-red-900">Overdue Tasks</div>
                    <div className="text-sm text-red-700">{overdueTasks.length} tasks need immediate attention</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
          
          {dueSoonTasks.length > 0 && (
            <Card className="border-yellow-200 bg-yellow-50">
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <Clock className="h-5 w-5 text-yellow-600" />
                  <div>
                    <div className="font-medium text-yellow-900">Due Soon</div>
                    <div className="text-sm text-yellow-700">{dueSoonTasks.length} tasks due within 2 days</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6 text-center">
            <div className="text-3xl font-bold text-blue-600">{todoTasks.length}</div>
            <div className="text-sm text-gray-600">To Do</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 text-center">
            <div className="text-3xl font-bold text-yellow-600">{inProgressTasks.length}</div>
            <div className="text-sm text-gray-600">In Progress</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 text-center">
            <div className="text-3xl font-bold text-green-600">{doneTasks.length}</div>
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

      {/* Kanban Board */}
      {view === 'kanban' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* To Do Column */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">To Do</h3>
              <Badge variant="outline">{todoTasks.length}</Badge>
            </div>
            <div className="min-h-96 bg-gray-50 rounded-lg p-4">
              {todoTasks.map(task => (
                <TaskCard key={task.id} task={task} />
              ))}
            </div>
          </div>

          {/* In Progress Column */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">In Progress</h3>
              <Badge variant="outline">{inProgressTasks.length}</Badge>
            </div>
            <div className="min-h-96 bg-yellow-50 rounded-lg p-4">
              {inProgressTasks.map(task => (
                <TaskCard key={task.id} task={task} />
              ))}
            </div>
          </div>

          {/* Done Column */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Done</h3>
              <Badge variant="outline">{doneTasks.length}</Badge>
            </div>
            <div className="min-h-96 bg-green-50 rounded-lg p-4">
              {doneTasks.map(task => (
                <TaskCard key={task.id} task={task} />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Add Task Form Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-lg mx-4">
            <CardHeader>
              <CardTitle>Add New Task</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input placeholder="Task Title" />
              
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select Task Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="email">Email</SelectItem>
                  <SelectItem value="phone">Phone Call</SelectItem>
                  <SelectItem value="meeting">Meeting</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
              
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select Priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
              
              <Input placeholder="Owner" />
              <Input placeholder="Contact Name" />
              <Input placeholder="Event Name" />
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
