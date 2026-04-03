import React from 'react';
import {
  Type, Mail, Phone, FileText, ListOrdered, CheckSquare, Circle,
  Hash, Calendar, Clock, Link, Star, Upload, Heading, AlignLeft,
} from 'lucide-react';
import { FieldType } from './types';

export const FIELD_TYPES: { type: FieldType; label: string; icon: React.ReactNode }[] = [
  { type: 'text', label: 'Texte court', icon: React.createElement(Type, { className: 'h-4 w-4' }) },
  { type: 'textarea', label: 'Texte long', icon: React.createElement(FileText, { className: 'h-4 w-4' }) },
  { type: 'email', label: 'Email', icon: React.createElement(Mail, { className: 'h-4 w-4' }) },
  { type: 'tel', label: 'Téléphone', icon: React.createElement(Phone, { className: 'h-4 w-4' }) },
  { type: 'number', label: 'Nombre', icon: React.createElement(Hash, { className: 'h-4 w-4' }) },
  { type: 'select', label: 'Liste déroulante', icon: React.createElement(ListOrdered, { className: 'h-4 w-4' }) },
  { type: 'radio', label: 'Choix unique', icon: React.createElement(Circle, { className: 'h-4 w-4' }) },
  { type: 'checkbox', label: 'Cases à cocher', icon: React.createElement(CheckSquare, { className: 'h-4 w-4' }) },
  { type: 'date', label: 'Date', icon: React.createElement(Calendar, { className: 'h-4 w-4' }) },
  { type: 'time', label: 'Heure', icon: React.createElement(Clock, { className: 'h-4 w-4' }) },
  { type: 'url', label: 'URL', icon: React.createElement(Link, { className: 'h-4 w-4' }) },
  { type: 'rating', label: 'Évaluation', icon: React.createElement(Star, { className: 'h-4 w-4' }) },
  { type: 'file', label: 'Fichier', icon: React.createElement(Upload, { className: 'h-4 w-4' }) },
  { type: 'heading', label: 'Titre', icon: React.createElement(Heading, { className: 'h-4 w-4' }) },
  { type: 'paragraph', label: 'Paragraphe', icon: React.createElement(AlignLeft, { className: 'h-4 w-4' }) },
];

export const FIELD_WITH_OPTIONS: FieldType[] = ['select', 'radio', 'checkbox'];
