// Importe a instância da sua API configurada (ajuste o caminho se necessário)
import { api } from '@/services/api'; 

export interface OccurrenceLocation {
  alimentador?: string;
  subestacao?: string;
  city?: string;
  neighborhood?: string;
  zone?: string;
  address?: string;
  reference?: string;
}

export interface InheritedOccurrence {
  id: string;
  title: string;
  category: string;
  priority: 'crítica' | 'alta' | 'média' | 'baixa';
  status: 'Aberta' | 'Em Andamento' | 'Resolvida' | 'Finalizada' | 'Pendente' | 'Em Análise' | 'Cancelada';
  description: string;
  location: OccurrenceLocation;
  osNumero?: string;
  reportedBy: string;
  createdAt: string;
  timestamp: string;
  attachments?: string[];
  comments?: string[];
  linkType?: string;
  linkValue?: string;
  reminders?: string[];
}

export interface ShiftHandoverData {
  previousOperator: string;
  shiftTime: string;
  date: string;
  reportText: string;
  criticalCount: number;
  occurrences: InheritedOccurrence[];
}

export const getShiftHandoverData = async (): Promise<ShiftHandoverData> => {
  try {
    // A mágica acontece aqui: o Axios já coloca a URL base, os cabeçalhos JSON e o Token do Zustand!
    const response = await api.get<ShiftHandoverData>('/shifts/handover/previous');
    
    // O Axios coloca a resposta dentro da propriedade '.data'
    return response.data;
    
  } catch (error) {
    console.error("Erro ao buscar dados da passagem de turno:", error);
    throw error;
  }
};