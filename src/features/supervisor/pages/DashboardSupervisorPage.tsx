import { useEffect, useState } from "react";
import { AlertTriangle, Calendar } from "lucide-react";
import { ActivityFeed } from "@/features/supervisor/components/ActivityFeed";
import { OperatorsTable } from "@/features/supervisor/components/analytics/OperatorsTable";
import { TablesSummary } from "@/features/supervisor/components/TablesSummary";
import { OccurrencesList } from "@/features/supervisor/components/OccurrencesList";
import { ShiftHistoryModal } from "@/features/supervisor/components/ShiftHistoryModal";
import { useSupervisorStore } from "../stores/useSupervisorStore";


// import { CriticalTimeline } from "@/app/components/analytics/critical-timeline";

export function DashboardSupervisorPage() {
  const [showShiftHistoryModal, setShowShiftHistoryModal] = useState(false);
  const loadData = useSupervisorStore((state) => state.loadData);
  const isLoading = useSupervisorStore((state) => state.isLoading);
  const loadError = useSupervisorStore((state) => state.loadError);
  const hydratedAt = useSupervisorStore((state) => state.hydratedAt);
  const isUsingCachedData = useSupervisorStore((state) => state.isUsingCachedData);

  useEffect(() => {
    if (!hydratedAt) {
      void loadData();
    }
  }, [hydratedAt, loadData]);

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="rounded-lg border border-slate-700 bg-slate-900 p-6 text-slate-300">
          Carregando dados do supervisor...
        </div>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="p-6">
        <div className="rounded-lg border border-red-700/40 bg-red-900/10 p-6 text-red-300">
          {loadError}
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="p-6 space-y-6">
        {isUsingCachedData && (
          <div className="rounded-lg border border-amber-500/40 bg-amber-900/10 px-4 py-3 text-amber-300 text-sm flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" />
            Exibindo ultimo snapshot salvo devido a instabilidade temporaria da API.
          </div>
        )}

        <div className="flex items-center justify-end">
          <button
            onClick={() => setShowShiftHistoryModal(true)}
            className="px-4 py-2 bg-theme-accent hover:bg-emerald-400 rounded-lg text-sm text-white transition-all flex items-center gap-2 shadow-lg shadow-blue-600/20"
          >
            <Calendar className="w-4 h-4" />
            Ver Historico de Turnos
          </button>
        </div>

        {/* Stats Cards */}
        <TablesSummary />

        {/* Chart and Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            {/* Linha do Tempo de Ocorrências Críticas */}

            <OccurrencesList />
          </div>
          <div>
            <ActivityFeed />
          </div>
        </div>

        {/* Operators and Occurrences */}
        <div className="grid grid-cols-1  gap-6">
          <OperatorsTable />
        </div>
      </div>

      <ShiftHistoryModal
        isOpen={showShiftHistoryModal}
        onClose={() => setShowShiftHistoryModal(false)}
      />
    </div>
  );
}