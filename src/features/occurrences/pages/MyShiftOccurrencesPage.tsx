import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AlertTriangle,
  ArrowRight,
  CalendarClock,
  CircuitBoard,
  Clock,
  FileText,
  Filter,
  User,
  Wrench,
} from 'lucide-react';

import { useShiftOccurrences } from '../hooks/useShiftOccurrences';
import { ShiftFilters } from '../components/ShiftFilters';
import { ShiftOccurrenceItem } from '../components/ShiftOccurrenceItem';
import { StatCard } from '@/features/dashboard/components/StatCard';
import type { CircuitSwitchingRecord } from '@/features/circuit-switching/types';
import type { UnavailableEquipmentRecord } from '@/features/unavailable-equipment/types';

type EventType = 'circuit-switching' | 'unavailable-equipment';
type LocalEventRecord = (CircuitSwitchingRecord | UnavailableEquipmentRecord) & {
  eventType: EventType;
};

const getLocalRecords = <T,>(key: string): T[] => {
  try {
    const raw = localStorage.getItem(key);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const formatDateTime = (value: string) => {
  if (!value) return '--';
  return new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(new Date(value));
};

const EventHistoryItem = ({ event }: { event: LocalEventRecord }) => {
  const navigate = useNavigate();
  const isCircuit = event.eventType === 'circuit-switching';
  const Icon = isCircuit ? CircuitBoard : Wrench;
  const eventLabel = isCircuit ? 'Circuito manobrado' : 'Equipamento indisponível';
  const equipmentEvent = event as UnavailableEquipmentRecord;
  const title = isCircuit
    ? (event.description || `${event.feeder} - ${event.equipment}`)
    : (event.description || `${equipmentEvent.equipmentType} ${equipmentEvent.equipmentNumber}`);

  return (
    <div
      onClick={() => navigate(`/${event.eventType}/${encodeURIComponent(event.id)}`)}
      className={`
      rounded-xl p-4 sm:p-5 transition-all border shadow-sm relative overflow-hidden cursor-pointer group
      bg-white border-slate-200 dark:bg-slate-900/50 dark:border-slate-800
      ${isCircuit ? 'hover:border-blue-500/50 hover:shadow-blue-500/10' : 'hover:border-purple-500/50 hover:shadow-purple-500/10'} hover:shadow-lg
    `}
    >
      <div className={`absolute left-0 top-0 bottom-0 w-1 ${isCircuit ? 'bg-blue-500' : 'bg-purple-500'}`} />

      <div className="flex flex-col pl-3">
        <div className="flex justify-between items-start mb-2 gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-mono text-[10px] sm:text-xs font-bold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-700">
              {event.id}
            </span>
            <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] sm:text-xs border font-bold ${
              isCircuit
                ? 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800'
                : 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-900/20 dark:text-purple-400 dark:border-purple-800'
            }`}>
              <Icon className="w-3 h-3" />
              {eventLabel}
            </span>
          </div>
          <span className="px-2 py-0.5 rounded-full text-[10px] sm:text-xs border font-medium bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800">
            Prazo: {formatDateTime(event.currentDeadline)}
          </span>
        </div>

        <h3 className={`text-base sm:text-lg font-semibold text-slate-900 dark:text-white mb-1 leading-snug transition-colors ${isCircuit ? 'group-hover:text-blue-600 dark:group-hover:text-blue-400' : 'group-hover:text-purple-600 dark:group-hover:text-purple-400'}`}>
          {title || eventLabel}
        </h3>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 line-clamp-2 mb-3">
          {event.cause} {event.observations ? `- ${event.observations}` : ''}
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-400">
          <div className="flex items-center gap-1.5">
            <User className="w-3.5 h-3.5" />
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

export const MyShiftOccurrencesPage = () => {
  const navigate = useNavigate();
  const { user, filteredData, stats, filters } = useShiftOccurrences();
  const [localEvents, setLocalEvents] = useState<LocalEventRecord[]>([]);

  useEffect(() => {
    const currentAuthor = user?.name?.trim() || user?.email || 'Autor não informado';
    const circuits = getLocalRecords<CircuitSwitchingRecord>('circuit_switching_records_v1')
      .map((record) => ({
        ...record,
        createdBy: record.createdBy || currentAuthor,
        authorId: record.authorId || user?.id,
        eventType: 'circuit-switching' as const,
      }));
    const equipments = getLocalRecords<UnavailableEquipmentRecord>('unavailable_equipment_records_v1')
      .map((record) => ({
        ...record,
        createdBy: record.createdBy || currentAuthor,
        authorId: record.authorId || user?.id,
        eventType: 'unavailable-equipment' as const,
      }));

    setLocalEvents([...circuits, ...equipments]);
  }, [user?.email, user?.id, user?.name]);

  const filteredLocalEvents = useMemo(() => {
    const normalizedSearch = filters.searchTerm.toLowerCase().trim();

    return localEvents.filter((event) => {
      if (filters.eventType !== 'todos' && filters.eventType !== event.eventType) return false;

      const equipmentEvent = event as UnavailableEquipmentRecord;
      const searchable = [
        event.id,
        event.feeder,
        event.equipment,
        event.responsibleSector,
        event.cause,
        event.description,
        event.observations,
        event.createdBy,
        equipmentEvent.equipmentNumber,
        equipmentEvent.equipmentType,
      ].filter(Boolean).join(' ').toLowerCase();

      const matchesSearch = !normalizedSearch || searchable.includes(normalizedSearch);
      const matchesAuthor = !filters.author || (event.createdBy || '').toLowerCase().includes(filters.author.toLowerCase());
      const matchesStatus = filters.status === 'todas' || filters.status === 'Pendente';
      const matchesPriority = filters.priority === 'todas';
      const matchesMine = !filters.onlyMine || String(event.authorId || '') === String(user?.id || '');

      return matchesSearch && matchesAuthor && matchesStatus && matchesPriority && matchesMine;
    });
  }, [filters.author, filters.eventType, filters.onlyMine, filters.priority, filters.searchTerm, filters.status, localEvents, user?.id]);

  const totalEvents = filteredData.length + filteredLocalEvents.length;
  const pendingEvents = stats.pendentes + filteredLocalEvents.length;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
      <div className="p-4 md:p-8 max-w-7xl mx-auto animate-fade-in pb-20 md:pb-8">
        <div className="flex flex-row items-center justify-between gap-4 mb-6 w-full">
          <button
            onClick={() => navigate(-1)}
            className="flex-shrink-0 inline-flex items-center gap-2 px-4 py-2 sm:px-5 sm:py-2.5 rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white shadow-sm hover:shadow-md transition-all duration-300 group"
          >
            <ArrowRight className="w-4 h-4 rotate-180 group-hover:-translate-x-1 transition-transform" />
            <span className="font-medium text-sm">Voltar</span>
          </button>

          <div className="text-right min-w-0">
            <h1 className="text-lg sm:text-2xl md:text-3xl font-bold text-slate-900 dark:text-white tracking-tight leading-tight truncate">
              Histórico de Eventos
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 truncate">
              Visualize ocorrências, circuitos manobrados e equipamentos indisponíveis.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
          <StatCard icon={FileText} label="Total Encontrado" value={totalEvents} color="from-blue-500 to-cyan-500" />
          <StatCard icon={AlertTriangle} label="Críticas" value={stats.criticas} color="from-red-500 to-orange-500" />
          <StatCard icon={Clock} label="Pendentes" value={pendingEvents} color="from-amber-500 to-yellow-500" />
        </div>

        <ShiftFilters filters={filters} />

        <div className="space-y-3 relative z-0">
          {totalEvents === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 bg-white dark:bg-slate-900/50 rounded-2xl border border-slate-200 dark:border-slate-800 border-dashed">
              <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-full mb-3">
                <Filter className="w-6 h-6 text-slate-400" />
              </div>
              <p className="text-slate-500 dark:text-slate-400 font-medium text-sm">Nada encontrado.</p>
            </div>
          ) : (
            <>
              {filteredData.map((occ) => (
                <ShiftOccurrenceItem
                  key={occ.id}
                  occurrence={occ}
                  currentUser={user || undefined}
                />
              ))}
              {filteredLocalEvents.map((event) => (
                <EventHistoryItem key={event.id} event={event} />
              ))}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
