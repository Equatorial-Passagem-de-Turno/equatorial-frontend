export interface Occurrence {
  id: string;
  descricao: string;
  prioridade: 'baixa' | 'média' | 'alta' | 'crítica';
  status: 'pendente' | 'em andamento' | 'resolvido';
}

export interface Shift {
  id: string;
  operador: string;
  funcao: 'BT' | 'MT' | 'AT' | 'Eng. Pré-Op';
  inicio: string;
  fim?: string;
  data: string;
  briefing: string;
  pendenciasHerdadas: Occurrence[];
  pendenciasDeixadas: Occurrence[];
}