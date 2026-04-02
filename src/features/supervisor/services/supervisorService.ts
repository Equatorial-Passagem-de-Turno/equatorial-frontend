import { api } from '@/services/api';
import type { Occurrence, Operator } from '../types/index.ts';
import type { AtividadeRecente } from '../mocks/mocks.ts';

type ApiOccurrence = {
  id: string;
  title: string;
  category?: string;
  priority?: string;
  status?: string;
  description?: string;
  user_id?: string;
  created_at?: string;
  updated_at?: string;
  createdBy?: string;
  location?: Record<string, unknown> | null;
};

type ApiUser = {
  id: string;
  name: string;
  email: string;
  role?: string;
};

const normalizeCriticality = (priority?: string): Occurrence['criticality'] => {
  const p = String(priority || '').toLowerCase();
  if (p.includes('crit')) return 'critica';
  if (p.includes('alt')) return 'alta';
  if (p.includes('med')) return 'media';
  return 'baixa';
};

const normalizeStatus = (status?: string): Occurrence['status'] => {
  const s = String(status || '').toLowerCase();
  if (s.includes('andamento') || s.includes('progress')) return 'em_andamento';
  if (s.includes('resol') || s.includes('finish')) return 'resolvida';
  if (s.includes('transfer')) return 'transferida';
  return 'aberta';
};

const mapOccurrence = (occ: ApiOccurrence, usersById: Map<string, ApiUser>): Occurrence => {
  const user = occ.user_id ? usersById.get(String(occ.user_id)) : undefined;
  const location = (occ.location ?? {}) as Record<string, unknown>;
  const createdAt = occ.created_at ? new Date(occ.created_at) : new Date();

  return {
    id: String(occ.id),
    title: String(occ.title || 'Sem título'),
    description: String(occ.description || ''),
    category: String(occ.category || 'Operação'),
    criticality: normalizeCriticality(occ.priority),
    status: normalizeStatus(occ.status),
    type: 'falha',
    dateTime: createdAt.toLocaleString('pt-BR'),
    timestamp: createdAt.getTime(),
    operator: user?.name || String(occ.createdBy || 'Sistema'),
    operatorId: String(occ.user_id || ''),
    profile: ((user?.role as Operator['profile']) || 'AT'),
    table: String(location.table || location.desk || 'N/A'),
    geographicBase: String(location.zone || location.city || 'N/A'),
    feeder: String(location.feeder || 'N/A'),
    substation: String(location.substation || location.city || 'N/A'),
    serviceOrder: undefined,
    location: {
      city: String(location.city || 'N/A'),
      district: String(location.district || 'N/A'),
      zone: location.zone ? String(location.zone) : undefined,
      address: location.address ? String(location.address) : undefined,
      referencePoint: location.referencePoint ? String(location.referencePoint) : undefined,
    },
    affectedConsumers: undefined,
    attachments: {
      photo: false,
      video: false,
      document: false,
      protocol: false,
    },
  };
};

const mapOperator = (user: ApiUser, occurrences: Occurrence[]): Operator => {
  const mine = occurrences.filter((o) => o.operatorId === String(user.id));
  const resolved = mine.filter((o) => o.status === 'resolvida').length;
  const avgResolution = 45;

  return {
    id: String(user.id),
    name: user.name,
    email: user.email,
    profile: ((user.role as Operator['profile']) || 'AT'),
    shift: 'Atual',
    status: 'Ativo',
    assumedOccurrences: mine.length,
    resolvedOccurrences: resolved,
    averageResolutionTime: avgResolution,
    resolutionRate: mine.length ? Number(((resolved / mine.length) * 100).toFixed(1)) : 0,
    time: '--:--',
    table: mine[0]?.table || 'N/A',
  };
};

const mapActivities = (occurrences: Occurrence[]): AtividadeRecente[] => {
  return occurrences
    .slice()
    .sort((a, b) => b.timestamp - a.timestamp)
    .slice(0, 15)
    .map((o) => ({
      id: `ATV-${o.id}`,
      type:
        o.criticality === 'critica'
          ? 'critical'
          : o.status === 'resolvida'
            ? 'success'
            : 'warning',
      title: `${o.title}`,
      description: `${o.category} • ${o.status}`,
      time: new Date(o.timestamp).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      timestamp: new Date(o.timestamp).toLocaleString('pt-BR'),
      author: o.operator,
    }));
};

export async function fetchSupervisorData() {
  const [occRes, usersRes] = await Promise.all([
    api.get<ApiOccurrence[]>('/occurrences'),
    api.get<ApiUser[]>('/users'),
  ]);

  const users: ApiUser[] = usersRes.data || [];
  const occurrencesPayload: ApiOccurrence[] = occRes.data || [];
  const usersById = new Map<string, ApiUser>(users.map((u: ApiUser) => [String(u.id), u]));
  const occurrences = occurrencesPayload.map((o: ApiOccurrence) => mapOccurrence(o, usersById));
  const operators = users.map((u: ApiUser) => mapOperator(u, occurrences));
  const activities = mapActivities(occurrences);

  return {
    operators,
    occurrences,
    activities,
  };
}
