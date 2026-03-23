import { Activity, History, PaperclipIcon, Plus, UserCog, type LucideIcon } from 'lucide-react';

export interface NavItem {
  label: string;
  path: string;
  icon: LucideIcon;
  roles?: ('operator' | 'supervisor')[];
}

export const SIDEBAR_ITEMS: NavItem[] = [
  { 
    label: 'Dashboard', 
    path: '/', 
    icon: Activity 
  },
  { 
    label: 'Nova Ocorrência', 
    path: '/occurrences/new', 
    icon: Plus 
  },
  { 
    label: 'Controle de Turnos', 
    path: '/shifts/control', 
    icon: UserCog 
  },
  { 
    label: 'Historico de Ocorrências', 
    path: '/occurrences/my-shift', 
    icon: History 
  },
  {
    label: 'Turno Anterior',
    path: '/shifts/previous',
    icon: PaperclipIcon,
  }
];