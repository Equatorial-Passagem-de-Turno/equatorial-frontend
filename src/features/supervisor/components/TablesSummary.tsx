import { AlertTriangle, TrendingUp, Clock, AlertCircle } from "lucide-react";
import type { Occurrence, Operator } from "../types/index";
import { useSupervisorStore } from "../stores/useSupervisorStore";

interface TableAlert {
  table: string;
  pending: number;
  critical: number;
  status: "critical" | "warning" | "normal";
  message: string;
}

const statusConfig = {
  critical: {
    text: "text-red-500",
    icon: AlertCircle,
  },
  warning: {
    text: "text-yellow-500",
    icon: AlertTriangle,
  },
  normal: {
    text: "text-green-500",
    icon: TrendingUp,
  },
};

export function TablesSummary() {
  const occurrencesState = useSupervisorStore((state) => state.occurrences);
  const operatorsState = useSupervisorStore((state) => state.operators);

  // =========================
  // FILTRAR OCORRÊNCIAS ABERTAS
  // =========================
  const openOccurrences: Occurrence[] = occurrencesState.filter(
    (o) => o.status === "aberta" || o.status === "em_andamento",
  );

  const totalPending = openOccurrences.length;

  const totalCritical = openOccurrences.filter(
    (o) => o.criticality === "critica",
  ).length;

  // =========================
  // OPERATORS ATIVOS
  // =========================
  const activeOperators: number = operatorsState.filter(
    (op: Operator) => op.status === "Ativo" || op.status === "Pausa",
  ).length;

  // =========================
  // AGRUPAR POR MESA
  // =========================
  const occurrencesByTable: Record<
    string,
    { pending: number; critical: number }
  > = {};

  openOccurrences.forEach((occurrence) => {
    const table = occurrence.table;

    if (!occurrencesByTable[table]) {
      occurrencesByTable[table] = {
        pending: 0,
        critical: 0,
      };
    }

    occurrencesByTable[table].pending++;

    if (occurrence.criticality === "critica") {
      occurrencesByTable[table].critical++;
    }
  });

  // =========================
  // GERAR ALERTAS POR MESA
  // =========================
  const tableAlerts: TableAlert[] = Object.entries(occurrencesByTable)
    .map(([table, data]) => {
      let status: TableAlert["status"] = "normal";
      let message = "Operação estável";

      if (data.critical >= 2) {
        status = "critical";
        message = "Requer atenção imediata";
      } else if (data.critical === 1 || data.pending >= 3) {
        status = "warning";
        message = "Acúmulo de ocorrências";
      } else if (data.pending > 0) {
        message = "Situação sob controle";
      }

      return {
        table,
        pending: data.pending,
        critical: data.critical,
        status,
        message,
      };
    })
    .sort((a, b) => {
      const statusOrder = {
        critical: 0,
        warning: 1,
        normal: 2,
      };

      if (statusOrder[a.status] !== statusOrder[b.status]) {
        return statusOrder[a.status] - statusOrder[b.status];
      }

      return b.pending - a.pending;
    });

  const tablesInCritical = tableAlerts.filter(
    (t) => t.status === "critical",
  ).length;

  // =========================
  // RENDER
  // =========================
  return (
    <section className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-lg px-6 py-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Clock className="w-5 h-5 text-gray-500 dark:text-gray-400" />
          <h2 className="font-semibold text-gray-900 dark:text-white">
            Status COI
          </h2>
        </div>
        <span className="text-xs text-gray-500 dark:text-gray-400">
          Atualizado agora
        </span>
      </div>

      {/* Resumo */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <SummaryItem label="Ocorrências abertas" value={totalPending} />

        <SummaryItem
          label="Turnos ativos"
          value={activeOperators}
          color="text-emerald-400"
        />

        <SummaryItem
          label="Ocorrências críticas"
          value={totalCritical}
          color="text-red-500"
        />

        <SummaryItem
          label="Mesas em alerta"
          value={tablesInCritical}
          color="text-red-500"
        />
      </div>

      {/* Prioridade */}
      <div>
        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3">
          Prioridade de atenção
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          {tableAlerts.slice(0, 4).map((table, index) => {
            const config = statusConfig[table.status];
            const Icon = config.icon;

            return (
              <div
                key={table.table}
                className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 dark:border-slate-600 bg-gray-50 dark:bg-slate-700/40"
              >
                <div className="w-7 h-7 rounded-full border border-gray-300 dark:border-slate-600 flex items-center justify-center text-xs font-bold text-gray-900 dark:text-white">
                  {index + 1}
                </div>

                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    Mesa {table.table}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {table.message}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <div className="text-right">
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">
                      {table.pending}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      pend.
                    </p>
                  </div>

                  {table.critical > 0 && (
                    <div className="text-right">
                      <p className={`text-sm font-semibold ${config.text}`}>
                        {table.critical}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        crít.
                      </p>
                    </div>
                  )}

                  <Icon className={`w-5 h-5 ${config.text}`} />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* -----------------------
   Subcomponent
----------------------- */
function SummaryItem({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color?: string;
}) {
  return (
    <div className="bg-gray-100 dark:bg-slate-800 rounded-lg p-4 text-center">
      <p
        className={`text-2xl font-bold ${
          color ? color : "text-slate-200"
        }`}
      >
        {value}
      </p>
      <p className="text-xs text-slate-400 mt-1">
        {label}
      </p>
    </div>
  );
}
