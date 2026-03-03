import { useNavigate } from 'react-router-dom';
import { ArrowRight, AlertTriangle, Clock, FileText, Filter } from 'lucide-react';

import { useShiftOccurrences } from '../hooks/useShiftOccurrences';
import { ShiftFilters } from '../components/ShiftFilters';
import { ShiftOccurrenceItem } from '../components/ShiftOccurrenceItem';
import { StatCard } from '@/features/dashboard/components/StatCard';

export const MyShiftOccurrencesPage = () => {
  const navigate = useNavigate();
  // O hook agora retorna os novos filtros dentro do objeto 'filters'
  const { user, filteredData, stats, filters } = useShiftOccurrences();

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
      <div className="p-4 md:p-8 max-w-7xl mx-auto animate-fade-in pb-20 md:pb-8">
        
        {/* Header */}
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
                Verificar Pendências
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 truncate">
                Visualize as pendências abertas da sua mesa de operação.
              </p>
            </div>
        </div>

        {/* Estatísticas */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
           <StatCard icon={FileText} label="Total Encontrado" value={stats.total} color="from-blue-500 to-cyan-500" />
           <StatCard icon={AlertTriangle} label="Críticas" value={stats.criticas} color="from-red-500 to-orange-500" />
           <StatCard icon={Clock} label="Pendentes" value={stats.pendentes} color="from-amber-500 to-yellow-500" />
        </div>

        {/* Filtros Atualizados com Mesa e Base */}
        <ShiftFilters filters={filters} />

        {/* Lista de Ocorrências */}
        <div className="space-y-3 relative z-0">
          {filteredData.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 bg-white dark:bg-slate-900/50 rounded-2xl border border-slate-200 dark:border-slate-800 border-dashed">
                <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-full mb-3">
                    <Filter className="w-6 h-6 text-slate-400" />
                </div>
                <p className="text-slate-500 dark:text-slate-400 font-medium text-sm">Nada encontrado.</p>
              </div>
          ) : (
              filteredData.map((occ) => (
                <ShiftOccurrenceItem 
                  key={occ.id} 
                  occurrence={occ} 
                  currentUser={user || undefined} 
                />
              ))
          )}
        </div>
      </div>
    </div>
  );
};