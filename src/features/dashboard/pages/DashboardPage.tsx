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

  const { navigate, isLoading, filteredOccurrences, selectedInheritedIds, createdThisShiftIds, currentShiftWorkedDuration, filters, handover } = useDashboard();
  const isFlowLocked = handover.isOpen;

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

    return ownedOpenByMe.filter((occ) => {
      const occurrenceId = String(occ.id);
      const categoryNormalized = normalizeText(String(occ.category || ''));
      const apiIsInherited = (occ as { is_inherited?: boolean }).is_inherited;
      const apiOrigin = normalizeText(String((occ as { origin?: string }).origin || ''));
      const isInherited = typeof apiIsInherited === 'boolean'
        ? apiIsInherited
        : apiOrigin === 'herdada' || categoryNormalized.includes('herdad');

      // Ocorrências herdadas abertas devem permanecer visíveis para o operador.
      if (isInherited) {
        return true;
      }

      if (selectedSet.has(occurrenceId) || createdSet.has(occurrenceId)) {
        return true;
      }

      // Fallback: exibe qualquer ocorrência própria aberta criada hoje,
      // independentemente do createdSet (cobre seeders e casos onde o ID
      // ainda não foi persistido no localStorage).
      const rawCreatedAt = (occ as { created_at?: string }).created_at;
      return isCreatedToday(rawCreatedAt);

      return false;
    }).sort((a, b) => {
      const dateA = new Date(
        (a as { created_at?: string }).created_at ?? a.createdAt ?? 0
      ).getTime();
      const dateB = new Date(
        (b as { created_at?: string }).created_at ?? b.createdAt ?? 0
      ).getTime();
      return dateB - dateA; // mais recente primeiro
    });
  }, [filteredOccurrences, selectedInheritedIds, createdThisShiftIds, user?.id]);

  const visibleStats = useMemo(() => ({
    total: myWorkload.length,
    criticas: myWorkload.filter(o => o.priority === 'crítica').length,
    pendentes: myWorkload.filter(o => o.status === 'Pendente' || o.status === 'Aberta').length,
    analise: myWorkload.filter(o => o.status === 'Em Análise').length,
  }), [myWorkload]);

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
             Mesa ativa: <span className="text-emerald-500 font-medium">{table?.code} - {table?.name}</span> • Total trabalhado: <span className="text-slate-700 dark:text-slate-300 font-semibold">{currentShiftWorkedDuration}</span>
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

      <div className="rounded-2xl overflow-hidden shadow-sm border border-[var(--border-color)]">
        <ShiftTimer shiftStartTime={new Date()} shiftDurationHours={8} workedDurationLabel={currentShiftWorkedDuration} />
      </div>
      
      {/* STATS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard icon={FileText} label="Total" value={visibleStats.total} color="from-blue-500 to-cyan-500" onClick={() => { filters.setPriority('todas'); filters.setStatus('todas'); }} />
        <StatCard icon={AlertTriangle} label="Críticas" value={visibleStats.criticas} color="from-red-500 to-orange-500" onClick={() => { filters.setPriority('crítica'); filters.setStatus('todas'); }} />
        <StatCard icon={Clock} label="Pendentes" value={visibleStats.pendentes} color="from-amber-500 to-orange-400" onClick={() => { filters.setPriority('todas'); filters.setStatus('Pendente'); }} />
        <StatCard icon={CheckCircle} label="Em Análise" value={visibleStats.analise} color="from-emerald-500 to-teal-500" onClick={() => { filters.setPriority('todas'); filters.setStatus('Em Análise'); }} />
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