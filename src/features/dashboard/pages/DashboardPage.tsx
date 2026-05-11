import { useEffect, useMemo, useState } from 'react';
import {
  Plus,
  FileText,
  AlertTriangle,
  Clock,
  CheckCircle,
  Loader2,
  CircuitBoard,
  Wrench,
  CalendarClock,
  Users,
  type LucideIcon,
} from 'lucide-react';
import { ShiftTimer } from '../components/ShiftTimer';
import { InheritedOccurrencesModal } from '@/features/occurrences/components/InheritedOccurrencesModal';
import { useDashboard } from '../hooks/useDashboard';
import { StatCard } from '../components/StatCard';
import { DashboardFilters } from '../components/DashboardFilters';
import { OccurrenceListItem } from '../components/OccurrenceListItem';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { ROLES_CONFIG } from '@/config/roles';
import { api } from '@/services/api';
import type { EventType } from '@/features/events/components/EventTypeSelector';

type DashboardOperationalEvent = {
  id: string | number;
  eventType: Exclude<EventType, 'occurrence'>;
  title: string;
  description: string;
  cause?: string;
  responsibleSector?: string;
  affectedCustomers?: string | number;
  currentDeadline?: string;
  createdAt?: string;
  authorId?: string | number;
  createdBy?: string;
};

type ApiCircuitSwitching = {
  id: string | number;
  user_id?: string | number;
  user?: { name?: string };
  feeder?: string;
  equipment?: string;
  affected_clients?: string | number;
  responsible_sector?: string;
  reason?: string;
  observations?: string;
  deadline?: string;
  created_at?: string;
};

type ApiUnavailableEquipment = {
  id: string | number;
  user_id?: string | number;
  user?: { name?: string };
  equipment_number?: string;
  equipment_type?: string;
  feeder?: string;
  responsible_sector?: string;
  observations?: string;
  deadline?: string;
  created_at?: string;
};

type EventTypeOption = {
  value: EventType;
  label: string;
  description: string;
  icon: LucideIcon;
  iconTone: string;
  activeTone: string;
};

const eventTypeOptions: EventTypeOption[] = [
  {
    value: 'occurrence',
    label: 'Ocorrência',
    description: 'Registros operacionais da sua mesa.',
    icon: FileText,
    iconTone: 'eq-tone-occurrence',
    activeTone: 'eq-card-occurrence-active',
  },
  {
    value: 'circuit-switching',
    label: 'Circuito manobrado',
    description: 'Manobras registradas com prazo ativo.',
    icon: CircuitBoard,
    iconTone: 'eq-tone-circuit',
    activeTone: 'eq-card-circuit-active',
  },
  {
    value: 'unavailable-equipment',
    label: 'Equipamento indisponível',
    description: 'Equipamentos aguardando normalização.',
    icon: Wrench,
    iconTone: 'eq-tone-equipment',
    activeTone: 'eq-card-equipment-active',
  },
];

const formatDateTime = (value?: string) => {
  if (!value) return '--';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '--';

  return new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(date);
};

const EventTypeFilter = ({
  value,
  onChange,
}: {
  value: EventType;
  onChange: (value: EventType) => void;
}) => (
  <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
    {eventTypeOptions.map((option) => {
      const Icon = option.icon;
      const isActive = value === option.value;

      return (
        <button
          key={option.value}
          type="button"
          onClick={() => onChange(option.value)}
          className={`eq-surface-soft text-left p-4 transition-all hover:border-[var(--eq-border-strong)] ${
            isActive ? option.activeTone : ''
          }`}
        >
          <div className="flex items-start gap-3">
            <div className={`shrink-0 p-2.5 rounded-lg border ${option.iconTone}`}>
              <Icon className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="eq-card-title font-bold">{option.label}</div>
              <div className="eq-card-description mt-1 leading-relaxed">
                {option.description}
              </div>
            </div>
          </div>
        </button>
      );
    })}
  </div>
);

const OperationalEventListItem = ({ event }: { event: DashboardOperationalEvent }) => {
  const isCircuit = event.eventType === 'circuit-switching';
  const Icon = isCircuit ? CircuitBoard : Wrench;
  const eventLabel = isCircuit ? 'Circuito manobrado' : 'Equipamento indisponível';

  return (
    <div
      className={`eq-event-card group active:scale-[0.99] ${
        isCircuit ? 'eq-card-circuit' : 'eq-card-equipment'
      }`}
    >
      <div className={`absolute left-0 top-0 bottom-0 w-1 ${isCircuit ? 'eq-event-bar-circuit' : 'eq-event-bar-equipment'}`} />

      <div className="flex flex-col pl-3">
        <div className="flex justify-between items-start mb-2 gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="eq-id-chip">{event.id}</span>
            <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] sm:text-xs border font-bold ${
              isCircuit ? 'eq-tone-circuit' : 'eq-tone-equipment'
            }`}>
              <Icon className="w-3 h-3" />
              {eventLabel}
            </span>
          </div>
          <span className="px-2 py-0.5 rounded-full text-[10px] sm:text-xs border font-medium eq-status-warning">
            Prazo: {formatDateTime(event.currentDeadline)}
          </span>
        </div>

        <h3 className={`eq-card-title text-base sm:text-lg mb-1 ${isCircuit ? 'group-hover:text-blue-600 dark:group-hover:text-blue-400' : 'group-hover:text-purple-600 dark:group-hover:text-purple-400'}`}>
          {event.title}
        </h3>
        <p className="eq-card-description mb-3">
          {event.description}
        </p>

        <div className="eq-card-meta grid grid-cols-1 sm:grid-cols-3 gap-2 pt-3 border-t">
          <div className="flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5" />
            <span className="font-medium truncate">{event.createdBy || 'Autor não informado'}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>{event.affectedCustomers || '0'} clientes</span>
          </div>
          <div className="flex items-center gap-1.5 sm:justify-end">
            <CalendarClock className="w-3.5 h-3.5" />
            <span>{formatDateTime(event.createdAt)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export const DashboardPage = () => {
  const { user, role, table } = useAuth();
  const currentRoleConfig = ROLES_CONFIG.find(r => r.id === role);
  const RoleIcon = currentRoleConfig?.icon || FileText;
  const [selectedEventType, setSelectedEventType] = useState<EventType>('occurrence');
  const [operationalEvents, setOperationalEvents] = useState<DashboardOperationalEvent[]>([]);
  const [isLoadingOperationalEvents, setIsLoadingOperationalEvents] = useState(false);

  const {
    navigate,
    isLoading,
    filteredOccurrences,
    selectedInheritedIds,
    createdThisShiftIds,
    currentShiftWorkedDuration,
    baseStats,
    filters,
    handover,
  } = useDashboard();

  const isFlowLocked = handover.isOpen;

  useEffect(() => {
    let isCancelled = false;

    const fetchOperationalEvents = async () => {
      setIsLoadingOperationalEvents(true);

      try {
        const [circuitsResponse, equipmentsResponse] = await Promise.all([
          api.get<ApiCircuitSwitching[]>('/circuit-switchings'),
          api.get<ApiUnavailableEquipment[]>('/unavailable-equipments'),
        ]);

        if (isCancelled) return;

        const circuits = (circuitsResponse.data || []).map((item) => ({
          id: item.id,
          eventType: 'circuit-switching' as const,
          title: [item.feeder, item.equipment].filter(Boolean).join(' - ') || 'Circuito manobrado',
          description: item.reason || item.observations || 'Sem observação adicional.',
          cause: item.reason,
          responsibleSector: item.responsible_sector,
          affectedCustomers: item.affected_clients,
          currentDeadline: item.deadline,
          createdAt: item.created_at,
          authorId: item.user_id,
          createdBy: item.user?.name,
        }));

        const equipments = (equipmentsResponse.data || []).map((item) => ({
          id: item.id,
          eventType: 'unavailable-equipment' as const,
          title: [item.equipment_type, item.equipment_number].filter(Boolean).join(' ') || 'Equipamento indisponível',
          description: item.observations || [item.feeder, item.responsible_sector].filter(Boolean).join(' - ') || 'Sem observação adicional.',
          responsibleSector: item.responsible_sector,
          currentDeadline: item.deadline,
          createdAt: item.created_at,
          authorId: item.user_id,
          createdBy: item.user?.name,
        }));

        setOperationalEvents([...circuits, ...equipments]);
      } catch (error) {
        if (!isCancelled) {
          setOperationalEvents([]);
          console.error('Erro ao carregar eventos operacionais:', error);
        }
      } finally {
        if (!isCancelled) setIsLoadingOperationalEvents(false);
      }
    };

    void fetchOperationalEvents();

    return () => {
      isCancelled = true;
    };
  }, []);

  // Lista visível na tela: aplica as regras de propriedade/herança/criação sobre
  // as ocorrências já filtradas por search/priority/status
  const myWorkload = useMemo(() => {
    const normalizeText = (value: string) =>
      value
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .trim();

    const closedStatuses = new Set(['resolvida', 'finalizada', 'cancelada', 'fechada', 'encerrada']);
    const selectedSet = new Set(selectedInheritedIds.map((id) => String(id)));
    const createdSet = new Set(createdThisShiftIds.map((id) => String(id)));
    const currentUserId = user?.id ? String(user.id) : '';

    const isCreatedToday = (createdAtRaw?: string) => {
      if (!createdAtRaw) return false;
      const createdDate = new Date(createdAtRaw);
      if (Number.isNaN(createdDate.getTime())) return false;
      const now = new Date();
      return (
        createdDate.getDate() === now.getDate() &&
        createdDate.getMonth() === now.getMonth() &&
        createdDate.getFullYear() === now.getFullYear()
      );
    };

    const ownedOpenByMe = filteredOccurrences.filter((occ) => {
      const authorId = occ.authorId != null ? String(occ.authorId) : '';
      const userId = occ.user_id != null ? String(occ.user_id) : '';
      const isMine = Boolean(currentUserId) && (authorId === currentUserId || userId === currentUserId);
      const normalizedStatus = normalizeText(String(occ.status || ''));
      const apiIsOpen = (occ as { is_open?: boolean }).is_open;
      const isOpen = typeof apiIsOpen === 'boolean'
        ? apiIsOpen
        : normalizedStatus.length === 0 || !closedStatuses.has(normalizedStatus);
      return isMine && isOpen;
    });

    const filtered = ownedOpenByMe.filter((occ) => {
      const occurrenceId = String(occ.id);
      const categoryNormalized = normalizeText(String(occ.category || ''));
      const apiIsInherited = (occ as { is_inherited?: boolean }).is_inherited;
      const apiOrigin = normalizeText(String((occ as { origin?: string }).origin || ''));
      const isInherited = typeof apiIsInherited === 'boolean'
        ? apiIsInherited
        : apiOrigin === 'herdada' || categoryNormalized.includes('herdad');

      if (isInherited) return true;
      if (selectedSet.has(occurrenceId) || createdSet.has(occurrenceId)) return true;

      // Fallback: exibe qualquer ocorrência própria aberta criada hoje
      // (cobre seeders e casos onde o ID ainda não foi persistido no localStorage)
      const rawCreatedAt = (occ as { created_at?: string }).created_at;
      return isCreatedToday(rawCreatedAt);
    });

    // Mais recente primeiro
    return filtered.sort((a, b) => {
      const dateA = new Date(
        (a as { created_at?: string }).created_at ?? a.createdAt ?? 0
      ).getTime();
      const dateB = new Date(
        (b as { created_at?: string }).created_at ?? b.createdAt ?? 0
      ).getTime();
      return dateB - dateA;
    });
  }, [filteredOccurrences, selectedInheritedIds, createdThisShiftIds, user?.id]);

  const myOperationalEvents = useMemo(() => {
    const currentUserId = user?.id ? String(user.id) : '';
    const normalizedSearch = filters.searchTerm.toLowerCase().trim();

    return operationalEvents
      .filter((event) => {
        if (event.eventType !== selectedEventType) return false;
        if (!currentUserId) return true;
        if (String(event.authorId || '') !== currentUserId) return false;

        const searchable = [
          event.id,
          event.title,
          event.description,
          event.cause,
          event.responsibleSector,
          event.createdBy,
        ].filter(Boolean).join(' ').toLowerCase();

        return !normalizedSearch || searchable.includes(normalizedSearch);
      })
      .sort((a, b) => {
        const dateA = new Date(a.currentDeadline ?? a.createdAt ?? 0).getTime();
        const dateB = new Date(b.currentDeadline ?? b.createdAt ?? 0).getTime();
        return dateA - dateB;
      });
  }, [filters.searchTerm, operationalEvents, selectedEventType, user?.id]);

  const isOccurrenceFilterActive = selectedEventType === 'occurrence';

  return (
    <div className="eq-page-content w-full bg-transparent space-y-6 lg:space-y-8 relative transition-colors duration-300">

      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className={`p-2 rounded-lg bg-gradient-to-br ${currentRoleConfig?.gradient || 'from-slate-700 to-slate-900'} shadow-lg`}>
              <RoleIcon className="w-6 h-6 text-white" />
            </div>
            <h1 className="eq-page-title text-2xl lg:text-3xl">
              Dashboard {currentRoleConfig?.label || 'Operacional'}
            </h1>
          </div>
          <p className="eq-page-subtitle text-sm lg:text-base ml-1">
            Olá, <span className="font-medium text-[var(--eq-text-primary)]">{user?.name}</span>.{' '}
            Mesa ativa:{' '}
            <span className="text-emerald-500 font-medium">{table?.code} - {table?.name}</span>{' '}
            • Total trabalhado:{' '}
            <span className="text-[var(--eq-text-secondary)] font-semibold">{currentShiftWorkedDuration}</span>
          </p>
        </div>

        <button
          onClick={() => navigate('/occurrences/new')}
          disabled={isFlowLocked}
          className={`flex items-center justify-center gap-2 px-5 py-3 text-white font-semibold rounded-xl transition-all active:scale-95 ${
            isFlowLocked
              ? 'bg-slate-500 cursor-not-allowed opacity-70'
              : 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:shadow-lg'
          }`}
        >
          <Plus className="w-5 h-5" />
          <span>Nova Ocorrência</span>
        </button>
      </div>

      {isFlowLocked && (
        <div className="border border-amber-400/50 bg-amber-100/60 dark:bg-amber-900/20 rounded-xl px-4 py-3 text-sm text-amber-800 dark:text-amber-300">
          Fluxo obrigatório: conclua a seleção das ocorrências herdadas para liberar as demais funcionalidades do sistema.
        </div>
      )}

      <div className="rounded-2xl overflow-hidden shadow-sm border border-[var(--eq-border)]">
        <ShiftTimer shiftStartTime={new Date()} shiftDurationHours={8} workedDurationLabel={currentShiftWorkedDuration} />
      </div>

      {/* STATS — sempre mostram o total real, independente dos filtros ativos */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard
          icon={FileText}
          label="Total"
          value={baseStats.total}
          color="from-blue-500 to-cyan-500"
          onClick={() => { setSelectedEventType('occurrence'); filters.setPriority('todas'); filters.setStatus('todas'); }}
        />
        <StatCard
          icon={AlertTriangle}
          label="Críticas"
          value={baseStats.criticas}
          color="from-red-500 to-orange-500"
          onClick={() => { setSelectedEventType('occurrence'); filters.setPriority('crítica'); filters.setStatus('todas'); }}
        />
        <StatCard
          icon={Clock}
          label="Pendentes"
          value={baseStats.pendentes}
          color="from-amber-500 to-orange-400"
          onClick={() => { setSelectedEventType('occurrence'); filters.setPriority('todas'); filters.setStatus('Pendente'); }}
        />
        <StatCard
          icon={CheckCircle}
          label="Em Análise"
          value={baseStats.analise}
          color="from-emerald-500 to-teal-500"
          onClick={() => { setSelectedEventType('occurrence'); filters.setPriority('todas'); filters.setStatus('Em Análise'); }}
        />
      </div>

      <EventTypeFilter value={selectedEventType} onChange={setSelectedEventType} />

      <DashboardFilters
        searchTerm={filters.searchTerm} onSearchChange={filters.setSearchTerm}
        priority={filters.priority} onPriorityChange={filters.setPriority}
        status={filters.status} onStatusChange={filters.setStatus}
      />

      {/* LISTA */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="eq-empty-state py-20">
            <Loader2 className="w-10 h-10 text-emerald-500 animate-spin mb-4" />
            <p className="eq-page-subtitle">Sincronizando banco de dados...</p>
          </div>
        ) : isLoadingOperationalEvents && !isOccurrenceFilterActive ? (
          <div className="eq-empty-state py-20">
            <Loader2 className="w-10 h-10 text-emerald-500 animate-spin mb-4" />
            <p className="eq-page-subtitle">Carregando eventos operacionais...</p>
          </div>
        ) : isOccurrenceFilterActive && myWorkload.length === 0 ? (
          <div className="eq-empty-state py-12 text-center">
            <p className="eq-page-subtitle">Nenhuma ocorrência vinculada à sua mesa.</p>
          </div>
        ) : !isOccurrenceFilterActive && myOperationalEvents.length === 0 ? (
          <div className="eq-empty-state py-12 text-center">
            <p className="eq-page-subtitle">Nenhum evento desse tipo vinculado ao seu usuário.</p>
          </div>
        ) : isOccurrenceFilterActive ? (
          myWorkload.map((occ) => <OccurrenceListItem key={occ.id} occurrence={occ} />)
        ) : (
          myOperationalEvents.map((event) => (
            <OperationalEventListItem key={`${event.eventType}-${event.id}`} event={event} />
          ))
        )}
      </div>

      {/* MODAL DE HERANÇA */}
      {handover.data && (
        <InheritedOccurrencesModal
          isOpen={handover.isOpen}
          isSubmitting={handover.isSubmitting}
          data={handover.data}
          onAcknowledge={(obs, ids) => handover.handleAcknowledge(obs, ids)}
        />
      )}
    </div>
  );
};

