import { api } from '@/services/api';

export interface FinishShiftPayload {
  briefing: string;
  proximoOperador: string | null;
  pendenciasResolvidas: string[];
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