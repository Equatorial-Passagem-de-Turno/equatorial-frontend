import { useEffect } from "react";
import { ActivityFeed } from "@/features/supervisor/components/ActivityFeed";
import { OperatorsTable } from "@/features/supervisor/components/analytics/OperatorsTable";
import { TablesSummary } from "@/features/supervisor/components/TablesSummary";
import { OccurrencesList } from "@/features/supervisor/components/OccurrencesList";
import { useSupervisorStore } from "../stores/useSupervisorStore";


// import { CriticalTimeline } from "@/app/components/analytics/critical-timeline";

export function DashboardSupervisorPage() {
  const loadData = useSupervisorStore((state) => state.loadData);
  const isLoading = useSupervisorStore((state) => state.isLoading);
  const loadError = useSupervisorStore((state) => state.loadError);

  useEffect(() => {
    void loadData();
  }, [loadData]);

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
    </div>
  );
}