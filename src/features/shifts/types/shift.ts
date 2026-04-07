export interface Occurrence {
  id: string;
  descricao: string;
  prioridade: 'baixa' | 'média' | 'alta' | 'crítica';
  status: 'pendente' | 'em andamento' | 'resolvido';
}

export interface Shift {
  shiftId?: number;
  id: string;
  operador: string;
  funcao: 'BT' | 'MT' | 'AT' | 'Eng. Pré-Op';
  inicio: string;
  fim?: string;
  data: string;
  start_utc?: string | null;
  tempo_trabalhado?: string;
  tempo_trabalhado_minutos?: number;
  workedDuration?: string;
  workedMinutes?: number;
  briefing: string;
  pendenciasHerdadas: Occurrence[];
  pendenciasDeixadas: Occurrence[];
}