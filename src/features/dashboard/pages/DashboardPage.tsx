import { useMemo } from 'react';
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
  const { user, role, table } = useAuth();
  const currentRoleConfig = ROLES_CONFIG.find(r => r.id === role);
  const RoleIcon = currentRoleConfig?.icon || FileText;

  const { navigate, isLoading, filteredOccurrences, stats, filters, handover } = useDashboard();

  const myWorkload = useMemo(() => {
    const ownedByMe = filteredOccurrences.filter(occ => 
      occ.authorId === user?.id || occ.user_id === user?.id
    );
    return ownedByMe.length > 0 ? ownedByMe : filteredOccurrences;
  }, [filteredOccurrences, user?.id]);

  return (
    <div className="w-full bg-transparent p-4 md:p-8 space-y-6 lg:space-y-8 animate-fade-in relative transition-colors duration-300">
      
      {/* HEADER */}
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
             Mesa ativa: <span className="text-emerald-500 font-medium">{table?.code} - {table?.name}</span>
           </p>
        </div>

        <button 
          onClick={() => navigate('/occurrences/new')} 
          className="flex items-center justify-center gap-2 px-5 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-semibold rounded-xl hover:shadow-lg transition-all active:scale-95"
        >
          <Plus className="w-5 h-5" /> 
          <span>Nova Ocorrência</span>
        </button>
      </div>

      <div className="rounded-2xl overflow-hidden shadow-sm border border-[var(--border-color)]">
         <ShiftTimer shiftStartTime={new Date()} shiftDurationHours={8} />
      </div>
      
      {/* STATS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard icon={FileText} label="Total" value={stats.total} color="from-blue-500 to-cyan-500" onClick={() => { filters.setPriority('todas'); filters.setStatus('todas'); }} />
        <StatCard icon={AlertTriangle} label="Críticas" value={stats.criticas} color="from-red-500 to-orange-500" onClick={() => { filters.setPriority('crítica'); filters.setStatus('todas'); }} />
        <StatCard icon={Clock} label="Pendentes" value={stats.pendentes} color="from-amber-500 to-orange-400" onClick={() => { filters.setPriority('todas'); filters.setStatus('Pendente'); }} />
        <StatCard icon={CheckCircle} label="Em Análise" value={stats.analise} color="from-emerald-500 to-teal-500" onClick={() => { filters.setPriority('todas'); filters.setStatus('Em Análise'); }} />
      </div>

      <DashboardFilters 
        searchTerm={filters.searchTerm} onSearchChange={filters.setSearchTerm}
        priority={filters.priority} onPriorityChange={filters.setPriority}
        status={filters.status} onStatusChange={filters.setStatus}
      />

      {/* LISTA */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 bg-[var(--bg-panel)] rounded-xl border border-[var(--border-color)]">
              <Loader2 className="w-10 h-10 text-emerald-500 animate-spin mb-4" />
              <p className="text-[var(--text-muted)]">Sincronizando banco de dados...</p>
          </div>
        ) : myWorkload.length === 0 ? (
           <div className="text-center py-12 bg-[var(--bg-panel)] border border-[var(--border-color)] border-dashed rounded-xl">
              <p className="text-[var(--text-muted)]">Nenhuma ocorrência vinculada à sua mesa.</p>
           </div>
        ) : (
          myWorkload.map((occ) => <OccurrenceListItem key={occ.id} occurrence={occ} />)
        )}
      </div>

      {/* MODAL DE HERANÇA */}
      {handover.data && (
        <InheritedOccurrencesModal 
          isOpen={handover.isOpen}
          data={handover.data}
          onAcknowledge={(obs, ids) => handover.handleAcknowledge(obs, ids)}
        />
      )}
    </div>
  );
};