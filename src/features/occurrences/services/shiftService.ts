import { api } from '@/services/api';

export interface FinishShiftPayload {
  briefing: string;
  proximoOperador: string | null;
  pendenciasResolvidas: string[];
}

export interface SystemUser {
  id: number;
  name: string;
  email: string;
  role?: string;
}

export interface ShiftDetailComment {
  id?: string;
  type?: string;
  author?: string;
  text?: string;
  createdAt?: string;
}

export interface ShiftDetailOccurrence {
  id: string;
  title: string;
  description: string;
  category: string;
  priority: string;
  status: string;
  location: string;
  linkType?: string | null;
  linkValue?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
  commentsCount: number;
  comments?: ShiftDetailComment[];
  origin: 'Herdada' | 'Atual';
  isOpen: boolean;
}

export interface ShiftDetailResponse {
  id: number;
  displayId: string;
  operador: string;
  email?: string | null;
  funcao: string;
  funcaoLabel: string;
  mesa: string;
  mesaCode?: string | null;
  start?: string | null;
  end?: string | null;
  status: string;
  briefing: string;
  totalOccurrences: number;
  openOccurrences: number;
  resolvedOccurrences: number;
  tempo_trabalhado?: string;
  tempo_trabalhado_minutos?: number;
  workedDuration?: string;
  workedMinutes?: number;
  occurrences: ShiftDetailOccurrence[];
}

export const startShiftApi = async (deskId: string, role: string) => {
  const response = await api.post('/shifts/start', {
    operation_desk_id: deskId,
    role: role,
  });
  return response.data;
};

export const finishShiftApi = async (data: {
  briefing: string;
  proximoOperador: string | null;
  pendenciasResolvidas: string[];
}) => {
  const response = await api.post('/shifts/finish', data);
  return response.data;
};

export const reopenShiftApi = async () => {
  const response = await api.post('/shifts/reopen');
  return response.data;
};

export const getShiftHandoverData = async () => {
  const response = await api.get('/shifts/handover/previous');
  return response.data;
};

export const getOperationDesksApi = async () => {
  const response = await api.get('/operation-desks');
  return response.data;
};

export const getRolesApi = async () => {
  const response = await api.get('/roles');
  return response.data;
};

export const getSystemUsersApi = async (): Promise<SystemUser[]> => {
  const response = await api.get<SystemUser[]>('/users');
  return response.data;
};

export const sendShiftFinishEmailApi = async (
  shiftId: number | string,
  payload: {
    recipientIds: number[];
    summary?: {
      resolvedCount?: number;
      handoverCount?: number;
      briefing?: string;
    };
  }
) => {
  const response = await api.post(`/shifts/${shiftId}/notify`, payload);
  return response.data;
};

export const getShiftDetailsApi = async (shiftId: number | string): Promise<ShiftDetailResponse> => {
  const response = await api.get<ShiftDetailResponse>(`/shifts/${shiftId}`);
  return response.data;
};