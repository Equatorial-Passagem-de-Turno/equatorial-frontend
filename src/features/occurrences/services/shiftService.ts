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