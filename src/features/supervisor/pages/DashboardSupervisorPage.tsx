import { ActivityFeed } from "@/features/supervisor/components/ActivityFeed";
import { OperatorsTable } from "@/features/supervisor/components/analytics/OperatorsTable";
import { TablesSummary } from "@/features/supervisor/components/TablesSummary";
import { OccurrencesList } from "@/features/supervisor/components/OccurrencesList";


// import { CriticalTimeline } from "@/app/components/analytics/critical-timeline";

export function DashboardSupervisorPage() {
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