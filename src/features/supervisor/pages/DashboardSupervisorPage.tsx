import { useEffect, useState } from "react";
import { ActivityFeed } from "@/features/supervisor/components/ActivityFeed";
import { OperatorsTable } from "@/features/supervisor/components/analytics/OperatorsTable";
import { TablesSummary } from "@/features/supervisor/components/TablesSummary";
import { OccurrencesList } from "@/features/supervisor/components/OccurrencesList";
import { fetchSupervisorData } from "../services/supervisorService";
import { hydrateSupervisorData } from "../mocks/mocks.ts";


// import { CriticalTimeline } from "@/app/components/analytics/critical-timeline";

export function DashboardSupervisorPage() {
  const [version, setVersion] = useState(0);

  useEffect(() => {
    const load = async () => {
      try {
        const payload = await fetchSupervisorData();
        hydrateSupervisorData(payload);
        setVersion((prev) => prev + 1);
      } catch {
        // Fallback para dados mock locais.
      }
    };

    void load();
  }, []);

  return (
    <div key={version}>

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