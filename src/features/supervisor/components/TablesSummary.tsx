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
    <section className="eq-surface px-6 py-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Clock className="w-5 h-5 text-[var(--eq-text-muted)]" />
          <h2 className="eq-card-title">
            Status COI
          </h2>
        </div>
        <span className="eq-page-subtitle text-xs">
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
        <p className="eq-card-meta mb-3 text-xs font-medium uppercase tracking-wide">
          Prioridade de atenção
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          {tableAlerts.slice(0, 4).map((table, index) => {
            const config = statusConfig[table.status];
            const Icon = config.icon;

            return (
              <div
                key={table.table}
                className="eq-surface-soft flex items-center gap-3 p-3"
              >
                <div className="flex h-7 w-7 items-center justify-center rounded-full border border-[var(--eq-border)] text-xs font-bold text-[var(--eq-text-primary)]">
                  {index + 1}
                </div>

                <div className="flex-1">
                  <p className="text-sm font-medium text-[var(--eq-text-primary)]">
                    Mesa {table.table}
                  </p>
                  <p className="text-xs text-[var(--eq-text-muted)]">
                    {table.message}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <div className="text-right">
                    <p className="text-sm font-semibold text-[var(--eq-text-primary)]">
                      {table.pending}
                    </p>
                    <p className="text-xs text-[var(--eq-text-muted)]">
                      pend.
                    </p>
                  </div>

                  {table.critical > 0 && (
                    <div className="text-right">
                      <p className={`text-sm font-semibold ${config.text}`}>
                        {table.critical}
                      </p>
                      <p className="text-xs text-[var(--eq-text-muted)]">
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
    <div className="eq-surface-soft p-4 text-center">
      <p
        className={`text-2xl font-bold ${
          color ? color : "text-[var(--eq-text-primary)]"
        }`}
      >
        {value}
      </p>
      <p className="eq-card-meta mt-1 text-xs">
        {label}
      </p>
    </div>
  );
}
