import { useState, useEffect } from 'react';
import { Plus, FileText, AlertTriangle, Clock, CheckCircle, Loader2 } from 'lucide-react';
import { ShiftTimer } from '../components/ShiftTimer';
import { InheritedOccurrencesModal } from '@/features/occurrences/components/InheritedOccurrencesModal';
import { useDashboard } from '../hooks/useDashboard';
import { StatCard } from '../components/StatCard';
import { DashboardFilters } from '../components/DashboardFilters';
import { OccurrenceListItem } from '../components/OccurrenceListItem';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { ROLES_CONFIG } from '@/config/roles';

export const DashboardPage = () => {
  const { user, role } = useAuth();
  const currentRoleConfig = ROLES_CONFIG.find(r => r.id === role);
  const RoleIcon = currentRoleConfig?.icon || FileText;

  const { 
    navigate, isLoading, filteredOccurrences, stats, filters, handover 
  } = useDashboard();

  const [assumedOccurrenceIds, setAssumedOccurrenceIds] = useState<string[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('my_shift_occurrences');
      return saved ? JSON.parse(saved) : [];
    }
    return [];
  });

  useEffect(() => {
    localStorage.setItem('my_shift_occurrences', JSON.stringify(assumedOccurrenceIds));
  }, [assumedOccurrenceIds]);

  const handleHandoverAcknowledge = (observation: string, ids: string[]) => {
    setAssumedOccurrenceIds(ids);

    if (handover.handleAcknowledge) {
      handover.handleAcknowledge(observation);
    }
  };

  const myWorkload = assumedOccurrenceIds.length > 0
    ? filteredOccurrences.filter(occ => assumedOccurrenceIds.includes(occ.id))
    : filteredOccurrences;

  return (
    <div className="w-full bg-transparent p-4 md:p-8 space-y-6 lg:space-y-8 animate-fade-in relative transition-colors duration-300">
      
      {/* --- CABEÇALHO --- */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
           <div className="flex items-center gap-3 mb-1">
             <div className={`p-2 rounded-lg bg-gradient-to-br ${currentRoleConfig?.gradient || 'from-slate-700 to-slate-900'} shadow-lg`}>
                 <RoleIcon className="w-6 h-6 text-white" />
             </div>
             
             <h1 className="text-2xl lg:text-3xl font-bold text-[var(--text-main)] tracking-tight">
               Dashboard {currentRoleConfig?.label || 'Operacional'}
             </h1>
           </div>
           
           <p className="text-[var(--text-muted)] text-sm lg:text-base ml-1">
             Olá, <span className="font-medium text-[var(--text-main)]">{user?.name}</span>. 
             Setor ativo: <span className="text-emerald-500 font-medium">{currentRoleConfig?.description}</span>
           </p>
        </div>

        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/occurrences/new')} className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-emerald-500/30 hover:brightness-110 active:scale-95 transition-all">
            <Plus className="w-5 h-5" /> 
            <span>Nova Ocorrência</span>
          </button>
        </div>
      </div>

      {/* Timer do turno */}
      <div className="rounded-2xl overflow-hidden shadow-sm border border-[var(--border-color)]">
         <ShiftTimer shiftStartTime={new Date()} shiftDurationHours={8} />
      </div>
      
      {/* Cartões de Estatísticas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard 
          icon={FileText} label="Total" value={stats.total} color="from-blue-500 to-cyan-500"
          onClick={() => { filters.setPriority('todas'); filters.setStatus('todas'); }}
        />
        <StatCard 
          icon={AlertTriangle} label="Críticas" value={stats.criticas} color="from-red-500 to-orange-500"
          onClick={() => { filters.setPriority('crítica'); filters.setStatus('todas'); }}
        />
        <StatCard 
          icon={Clock} label="Pendentes" value={stats.pendentes} color="from-amber-500 to-orange-400"
          onClick={() => { filters.setPriority('todas'); filters.setStatus('Pendente'); }}
        />
        <StatCard 
          icon={CheckCircle} label="Em Análise" value={stats.analise} color="from-emerald-500 to-teal-500"
          onClick={() => { filters.setPriority('todas'); filters.setStatus('Em Análise'); }}
        />
      </div>

      {/* Filtros da Dashboard */}
      <DashboardFilters 
        searchTerm={filters.searchTerm} onSearchChange={filters.setSearchTerm}
        priority={filters.priority} onPriorityChange={filters.setPriority}
        status={filters.status} onStatusChange={filters.setStatus}
      />

      {/* Lista de Ocorrências (MEUS EVENTOS) */}
      <div className="space-y-4 relative z-0">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 bg-[var(--bg-panel)] rounded-xl border border-[var(--border-color)]">
              <Loader2 className="w-10 h-10 text-emerald-500 animate-spin mb-4" />
              <p className="text-[var(--text-muted)]">Sincronizando dados de {currentRoleConfig?.label}...</p>
          </div>
        ) : myWorkload.length === 0 ? (
           <div className="text-center py-12 bg-[var(--bg-panel)] border border-[var(--border-color)] border-dashed rounded-xl">
              <div className="text-[var(--text-muted)]">
                {assumedOccurrenceIds.length > 0 
                  ? 'Você não possui ocorrências pendentes na sua lista assumida.' 
                  : `Nenhuma ocorrência encontrada para ${currentRoleConfig?.label}.`}
              </div>
           </div>
        ) : (
          /* Renderiza APENAS a carga de trabalho do utilizador */
          myWorkload.map((occ) => (
            <OccurrenceListItem key={occ.id} occurrence={occ} />
          ))
        )}
      </div>

      {/* Modal de Passagem de Turno */}
      <InheritedOccurrencesModal 
        isOpen={handover.isOpen}
        data={handover.data}
        onAcknowledge={handleHandoverAcknowledge}
      />
    </div>
  );
};