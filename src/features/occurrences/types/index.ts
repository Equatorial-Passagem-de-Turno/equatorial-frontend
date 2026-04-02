// Define as prioridades possíveis para reutilizar em Badges e Filtros
export type OccurrencePriority = 'baixa' | 'média' | 'alta' | 'crítica';

// Define os status possíveis para garantir consistência no fluxo de trabalho
export type OccurrenceStatus = 
  | 'Aberta' 
  | 'Pendente' 
  | 'Em Análise' 
  | 'Em Andamento' 
  | 'Resolvida' 
  | 'Transferida' 
  | 'Cancelada';

// Interface Principal
export interface Occurrence {
  id: string;
  title: string;
  category: string;
  priority: OccurrencePriority;
  status: OccurrenceStatus;
  createdAt: string;
  createdBy: string;
  authorId?: string; 
  user_id?: string | number;
  shift_id?: string | number;
  created_at?: string;
  updated_at?: string;
  is_inherited?: boolean;
  is_open?: boolean;
  origin?: 'Herdada' | 'Atual' | string;
  
  description: string;
  location?: string | OccurrenceLocation;
  linkType?: 'OS' | 'External';
  linkValue?: string;
  attachments?: string[];
  comments?: Comment[]; // <-- novo campo opcional para comentários
  reminders?: Reminder[];
}

export interface OccurrenceLocation {
  address?: string;
  neighborhood?: string;
  city?: string;
  zone?: string;
  state?: string;
  alimentador?: string;
  subestacao?: string;
  reference?: string;
}

// Lembrete agendado para uma ocorrência
export interface Reminder {
  id: string;
  minutes: number; // minutos a partir do agendamento
  seconds: number; // segundos a partir do agendamento
  remindAt: string; // ISO timestamp
  createdBy: string;
  acknowledged?: boolean;
}

// Tipo utilitário para o formulário de criação (sem id/createdAt/createdBy)
export type NewOccurrencePayload = Omit<Occurrence, 'id' | 'createdAt' | 'createdBy'>;

export interface Shift {
  id: string;
  operador: string;
  funcao: 'BT' | 'MT' | 'AT' | 'Eng. Pré-Op';
  inicio: string;
  fim?: string;
  briefing: string;
  pendenciasHerdadas: Occurrence[];
  pendenciasDeixadas: Occurrence[];
}

export interface InheritedOccurrence {
  id: string;
  title: string;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  description: string;
  reportedBy: string;
  timestamp: string;
}

export interface InheritedOccurrencesModalProps {
  isOpen: boolean;
  occurrences: InheritedOccurrence[];
  onAcknowledge: () => void;
}

// Comentário associado a uma ocorrência
export interface Comment {
  id: string;
  type: string;
  author: string;
  text: string;
  createdAt: string;
}

export interface StatusConfigItem {
  label: string;
  color: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  bg: string;
  border: string;
}

export type MediaViewerState = {
  isOpen: boolean;
  url: string;
  type: 'image' | 'video' | 'pdf';
} | null;