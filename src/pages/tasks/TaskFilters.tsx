import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Filter, ChevronDown, ChevronUp } from 'lucide-react';

interface User {
  id: string;
  name: string;
  isActive: boolean;
}

interface TaskFiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  selectedUser: string;
  onUserChange: (value: string) => void;
  selectedCategory: string;
  onCategoryChange: (value: string) => void;
  selectedDate: string;
  onDateChange: (value: string) => void;
  sortBy: string;
  onSortByChange: (value: any) => void;
  sortOrder: string;
  onSortOrderChange: (value: any) => void;
  showFilters: boolean;
  onToggleFilters: () => void;
  users: User[];
}

export const TaskFilters: React.FC<TaskFiltersProps> = ({
  searchTerm, onSearchChange,
  selectedUser, onUserChange,
  selectedCategory, onCategoryChange,
  selectedDate, onDateChange,
  sortBy, onSortByChange,
  sortOrder, onSortOrderChange,
  showFilters, onToggleFilters,
  users,
}) => {
  return (
    <>
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Rechercher des tâches..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10 text-sm"
          />
        </div>
        <Button variant="outline" size="sm" onClick={onToggleFilters} className="sm:hidden flex items-center gap-1">
          <Filter className="h-4 w-4" />
          {showFilters ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
        </Button>
      </div>

      <div className={`${showFilters ? 'block' : 'hidden'} sm:block`}>
        <div className="grid grid-cols-2 sm:flex sm:flex-row gap-2">
          <Select value={selectedUser} onValueChange={onUserChange}>
            <SelectTrigger className="text-xs sm:text-sm sm:w-44">
              <SelectValue placeholder="Utilisateur" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous</SelectItem>
              {users.filter(user => user.isActive && user.id).map((user) => (
                <SelectItem key={user.id} value={user.id}>{user.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={selectedCategory} onValueChange={onCategoryChange}>
            <SelectTrigger className="text-xs sm:text-sm sm:w-44">
              <SelectValue placeholder="Catégorie" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Toutes</SelectItem>
              <SelectItem value="follow_up">Suivi Client</SelectItem>
              <SelectItem value="contract">Contrat</SelectItem>
              <SelectItem value="event_prep">Préparation</SelectItem>
              <SelectItem value="marketing">Marketing</SelectItem>
              <SelectItem value="admin">Admin</SelectItem>
            </SelectContent>
          </Select>
          <Select value={selectedDate} onValueChange={onDateChange}>
            <SelectTrigger className="text-xs sm:text-sm sm:w-40">
              <SelectValue placeholder="Échéance" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Toutes</SelectItem>
              <SelectItem value="overdue">En retard</SelectItem>
              <SelectItem value="today">Aujourd'hui</SelectItem>
              <SelectItem value="tomorrow">Demain</SelectItem>
              <SelectItem value="this_week">Semaine</SelectItem>
              <SelectItem value="no_date">Sans date</SelectItem>
            </SelectContent>
          </Select>
          <Select value={sortBy} onValueChange={onSortByChange}>
            <SelectTrigger className="text-xs sm:text-sm sm:w-40">
              <SelectValue placeholder="Trier" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="dueDate">Échéance</SelectItem>
              <SelectItem value="priority">Priorité</SelectItem>
              <SelectItem value="status">Statut</SelectItem>
              <SelectItem value="createdAt">Création</SelectItem>
            </SelectContent>
          </Select>
          <Select value={sortOrder} onValueChange={onSortOrderChange}>
            <SelectTrigger className="text-xs sm:text-sm sm:w-28 col-span-2 sm:col-span-1">
              <SelectValue placeholder="Ordre" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="asc">↑ Croissant</SelectItem>
              <SelectItem value="desc">↓ Décroissant</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </>
  );
};
