import { Activity, BarChart3, History, LayoutDashboard, PaperclipIcon, Plus, Settings, UserCog, type LucideIcon } from 'lucide-react';

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
    icon: Activity,
    roles: ['operator'],
  },
  {
    label: 'Novo Evento',
    path: '/events/new',
    icon: Plus,
    roles: ['operator'],
  },
  {
    label: 'Controle de Turnos',
    path: '/shifts/control',
    icon: UserCog,
    roles: ['operator'],
  },
  {
    label: 'Historico de Ocorrencias',
    path: '/occurrences/my-shift',
    icon: History,
    roles: ['operator'],
  },
  {
    label: 'Turno Anterior',
    path: '/shifts/previous',
    icon: PaperclipIcon,
    roles: ['operator'],
  },
  {
    label: 'Dashboard',
    path: '/supervisor',
    icon: LayoutDashboard,
    roles: ['supervisor'],
  },
  {
    label: 'Novo Evento',
    path: '/events/new',
    icon: Plus,
    roles: ['supervisor'],
  },
  {
    label: 'Linha do Tempo',
    path: '/supervisor/timeline',
    icon: History,
    roles: ['supervisor'],
  },
  {
    label: 'Analytics',
    path: '/supervisor/analytics',
    icon: BarChart3,
    roles: ['supervisor'],
  },
  {
    label: 'Gestao',
    path: '/supervisor/management',
    icon: Settings,
    roles: ['supervisor'],
  },
];
