import { api } from '@/services/api';
import type { Occurrence, Operator } from '../types/index.ts';
import type { AtividadeRecente } from '../types/index.ts';

const ENABLE_ACTIVE_OPERATORS_ENDPOINT = import.meta.env.VITE_ENABLE_SUPERVISOR_ACTIVE_OPERATORS_ENDPOINT === 'true';

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
  table?: string;
  operation_desk_name?: string;
};

type ApiUser = {
  id: string;
  name: string;
  email: string;
  role?: string;
  voltage_level?: string;
  operation_desk_name?: string;
  active?: boolean;
};

type ApiActiveOperator = {
  id: string;
  name: string;
  email: string;
  profile?: string;
  table?: string;
  status?: string;
  inherited_occurrences?: number;
  created_occurrences?: number;
  resolved_occurrences?: number;
  assumed_occurrences?: number;
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

const mapOccurrence = (
  occ: ApiOccurrence,
  usersById: Map<string, ApiUser>,
  activeStatsById: Map<string, ApiActiveOperator>
): Occurrence => {
  const user = occ.user_id ? usersById.get(String(occ.user_id)) : undefined;
  const stat = occ.user_id ? activeStatsById.get(String(occ.user_id)) : undefined;
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
    table: String(occ.table || occ.operation_desk_name || stat?.table || location.table || location.desk || 'N/A'),
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

const normalizeProfile = (value?: string): Operator['profile'] => {
  const v = String(value || '').toUpperCase();
  if (v.includes('MT')) return 'MT';
  if (v.includes('AT')) return 'AT';
  if (v.includes('ENG')) return 'Eng. Pré-Op';
  return 'BT';
};

const mapOperator = (
  user: ApiUser,
  occurrences: Occurrence[],
  activeStatsById: Map<string, ApiActiveOperator>
): Operator => {
  const mine = occurrences.filter((o) => o.operatorId === String(user.id));
  const stat = activeStatsById.get(String(user.id));

  const inherited = Number(stat?.inherited_occurrences ?? 0);
  const created = Number(stat?.created_occurrences ?? mine.length);
  const resolved = Number(stat?.resolved_occurrences ?? mine.filter((o) => o.status === 'resolvida').length);
  const assumed = Number(stat?.assumed_occurrences ?? Math.max(inherited + created, mine.length));

  const hasOpenOccurrence = mine.some((o) => o.status === 'aberta' || o.status === 'em_andamento');
  const hasRecentActivity = mine.some((o) => Date.now() - o.timestamp <= 12 * 60 * 60 * 1000);
  const derivedStatus: Operator['status'] = hasOpenOccurrence || hasRecentActivity ? 'Ativo' : 'Inativo';

  const avgResolution = mine.length > 0 ? 45 : 0;

  return {
    id: String(user.id),
    name: user.name,
    email: user.email,
    profile: normalizeProfile(stat?.profile || user.voltage_level || user.role),
    shift: 'Atual',
    status: (stat?.status as Operator['status']) || derivedStatus,
    accountActive: Boolean(user.active),
    assumedOccurrences: assumed,
    resolvedOccurrences: resolved,
    inheritedOccurrences: inherited,
    createdOccurrences: created,
    averageResolutionTime: avgResolution,
    resolutionRate: assumed ? Number(((resolved / assumed) * 100).toFixed(1)) : 0,
    time: '--:--',
    table: stat?.table || user.operation_desk_name || mine[0]?.table || 'N/A',
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
  const activeOperatorsRequest = ENABLE_ACTIVE_OPERATORS_ENDPOINT
    ? api.get<ApiActiveOperator[]>('/shifts/operators/active')
    : Promise.resolve({ data: [] as ApiActiveOperator[] });

  const [occRes, usersRes, activeOperatorsRes] = await Promise.allSettled([
    api.get<ApiOccurrence[]>('/occurrences'),
    api.get<ApiUser[]>('/users', { params: { include_inactive: true } }),
    activeOperatorsRequest,
  ]);

  if (occRes.status === 'rejected' || usersRes.status === 'rejected') {
    throw new Error('Falha ao carregar dados reais do supervisor. Verifique os endpoints /occurrences e /users.');
  }

  const users: ApiUser[] = usersRes.value.data || [];
  const occurrencesPayload: ApiOccurrence[] = occRes.value.data || [];
  const activeOperatorsPayload: ApiActiveOperator[] =
    activeOperatorsRes.status === 'fulfilled' ? (activeOperatorsRes.value.data || []) : [];

  const usersById = new Map<string, ApiUser>(users.map((u: ApiUser) => [String(u.id), u]));
  const activeStatsById = new Map<string, ApiActiveOperator>(
    activeOperatorsPayload.map((item: ApiActiveOperator) => [String(item.id), item])
  );

  const occurrences = occurrencesPayload.map((o: ApiOccurrence) => mapOccurrence(o, usersById, activeStatsById));
  const operators = users
    .filter((u: ApiUser) => String(u.role || '').toLowerCase() === 'operador')
    .map((u: ApiUser) => mapOperator(u, occurrences, activeStatsById));
  const activities = mapActivities(occurrences);

  return {
    operators,
    occurrences,
    activities,
  };
}
