// ========================
// CENTRALIZED TYPES
// ========================


export type OccurrenceCriticality = "baixa" | "media" | "alta" | "critica";


export interface Operator {
  id: string;
  name: string;
  email: string;
  profile: OperatorProfile;
  shift: string;
  status: OperatorStatus;
  accountActive?: boolean;

  assumedOccurrences: number;
  resolvedOccurrences: number;
  inheritedOccurrences?: number;
  createdOccurrences?: number;

  averageResolutionTime: number;
  resolutionRate: number;

  time: string;
  table: string;
}

export interface Demand {
  id: string;
  title: string;
  status: DemandStatus;
  dateTime: string;
  resolutionTime?: number;
  severity: Severity;
}

export interface Shift {
  id: string;
  date: string;
  time: string;
  status: ShiftStatus;
}

export interface Pending {
  id: string;
  title: string;
  description: string;
  status: PendingStatus;
  time: string;

  equipment?: string;
  sector?: string;
  action?: string;
  responsible?: string;
}
export interface Occurrence {
  id: string;
  title: string;
  description: string;

  category: string; // Atendimento, Manobra, Incidente etc.

  criticality: OccurrenceCriticality;
  status: OccurrenceStatus;
  type: OccurrenceType;

  dateTime: string;
  timestamp: number;

  operator: string;
  operatorId: string;
  profile: OperatorProfile;

  table: string;

  geographicBase: string;
  feeder: string;
  substation: string;

  serviceOrder?: string; // Nº OS

  location: {
    city: string;
    district: string; // bairro
    zone?: string;
    address?: string;
    referencePoint?: string;
  };

  resolutionTime?: number;
  affectedConsumers?: number;

  attachments?: {
    photo: boolean;
    video: boolean;
    document: boolean;
    protocol: boolean;
  };
}

export type OperatorProfile = "BT" | "MT" | "AT" | "Eng. Pré-Op";

export type OperatorStatus = "Ativo" | "Pausa" | "Inativo";

export type DemandStatus = "Resolvida" | "Em Andamento" | "Crítica";

export type Severity = "Baixa" | "Média" | "Alta" | "Crítica";

export type ShiftStatus = "ativo" | "concluido" | "pendente";

export type PendingStatus = "CRÍTICA" | "EM ANDAMENTO" | "RESOLVIDA";

export type OccurrenceSeverity =
  | "baixa"
  | "media"
  | "alta"
  | "critica";

export type OccurrenceStatus =
  | "aberta"
  | "em_andamento"
  | "resolvida"
  | "transferida";

export type OccurrenceType =
  | "falha"
  | "manutencao"
  | "sobrecarga"
  | "emergencia";

// ========================
// INTERFACES
// ========================

export interface Operator {
  id: string;
  name: string;
  email: string;
  profile: OperatorProfile;
  shift: string;
  status: OperatorStatus;
  accountActive?: boolean;
  assumedOccurrences: number;
  resolvedOccurrences: number;
  inheritedOccurrences?: number;
  createdOccurrences?: number;
  averageResolutionTime: number;
  resolutionRate: number;
  time: string;
  table: string;
}

export interface Demand {
  id: string;
  title: string;
  status: DemandStatus;
  dateTime: string;
  resolutionTime?: number;
  severity: Severity;
}

export interface Shift {
  id: string;
  date: string;
  time: string;
  status: ShiftStatus;
}

export interface Pending {
  id: string;
  title: string;
  description: string;
  status: PendingStatus;
  time: string;
  equipment?: string;
  sector?: string;
  action?: string;
  responsible?: string;
}

export interface Occurrence {
  id: string;
  title: string;
  description: string;

  category: string; // Atendimento, Manobra, Incidente etc.

  criticality: OccurrenceCriticality;
  status: OccurrenceStatus;
  type: OccurrenceType;

  dateTime: string;
  timestamp: number;

  operator: string;
  operatorId: string;
  profile: OperatorProfile;

  table: string;

  geographicBase: string;
  feeder: string;
  substation: string;

  serviceOrder?: string; // Nº OS

  location: {
    city: string;
    district: string; // bairro
    zone?: string;
    address?: string;
    referencePoint?: string;
  };

  resolutionTime?: number;
  affectedConsumers?: number;

  attachments?: {
    photo: boolean;
    video: boolean;
    document: boolean;
    protocol: boolean;
  };
}

export interface Comment {
  id: string;
  type: "TÉCNICO" | "GERAL" | "CONTATO" | "ALERTA";
  text: string;
  author: string;
  dateTime: string;
  timestamp: number;
}

export interface TimelineAction {
  id: string;
  timestamp: Date;
  type: "inicio" | "acao" | "passagem_turno" | "encerramento";
  description: string;
  operator?: string;
  table?: string;
  shift?: string;
  details?: string;
}

export interface CriticalOccurrence {
  id: string;
  title: string;
  description: string;
  start: Date;
  end?: Date;
  status: "em_andamento" | "resolvido";
  location: string;
  impact: string;
  timeline: TimelineAction[];
}

// ========================
// TIPOS PARA TIMELINE
// ========================

export interface TimelineEvent {
  id: string;
  ocorrenciaId: string;
  dataHora: string;
  acao: string;
  operador: string;
  perfil: OperatorProfile;
  mesa: string;
  baseGeografica: string;
  alimentador: string;
  subestacao: string;
  status: OccurrenceStatus;
  anexos: {
    foto: boolean;
    video: boolean;
    documento: boolean;
    protocolo: boolean;
  };
  detalhes?: string;
  tipo: 'ocorrencia';
}

export interface AtividadeEvent {
  id: string;
  dataHora: string;
  acao: string;
  operador: string;
  tipo: 'atividade';
  criticidade: 'critical' | 'warning' | 'info' | 'success';
  detalhes: string;
}

export type CombinedEvent = TimelineEvent | AtividadeEvent;

export interface AtividadeRecente {
  id: string;
  type: 'critical' | 'warning' | 'info' | 'success';
  title: string;
  description: string;
  time: string;
  timestamp: string;
  author: string;
}
