import { 
  Zap,            // Para Baixa Tensão
  Activity,       // Para Média Tensão (Manobras/Fluxo)
  Radio,          // Para Alta Tensão (Torres/Transmissão)
  ClipboardList,  // Para Pré-Operação (Planejamento)
} from 'lucide-react';

import { type UserRole } from '../features/auth/types/index';
import { type LucideIcon } from 'lucide-react';

// Interface para garantir tipagem forte
interface RoleConfig {
  id: UserRole;
  label: string;
  description: string;
  icon: LucideIcon;
  gradient: string;
  borderColor: string;
}

export const ROLES_CONFIG: RoleConfig[] = [
  {
    id: 'bt',
    label: 'Baixa Tensão (BT)',
    description: 'Gestão de rede BT e consumidores',
    icon: Zap,
    gradient: 'from-yellow-400 to-orange-500',
    borderColor: 'group-hover:border-yellow-500',
  },
  {
    id: 'mt',
    label: 'Média Tensão (MT)',
    description: 'Operação de chaves e alimentadores',
    icon: Activity,
    gradient: 'from-blue-400 to-indigo-600',
    borderColor: 'group-hover:border-blue-500',
  },
  {
    id: 'at',
    label: 'Alta Tensão (AT)',
    description: 'Subestações e Linhas de Transmissão',
    icon: Radio,
    gradient: 'from-red-500 to-rose-700',
    borderColor: 'group-hover:border-red-500',
  },
  {
    id: 'pre_op',
    label: 'Eng. Pré-Operação',
    description: 'Planejamento e análise técnica',
    icon: ClipboardList,
    gradient: 'from-emerald-400 to-teal-600',
    borderColor: 'group-hover:border-emerald-500',
  }
];