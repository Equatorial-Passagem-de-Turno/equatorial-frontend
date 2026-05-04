"use client";

import {
  Users,
  CheckCircle2,
  Clock,
  Activity,
} from "lucide-react";

import type { OperatorProfile } from "../../types/index";
import { useSupervisorStore } from "../../stores/useSupervisorStore";

/* =========================
   PROFILE COLOR MAP
========================= */

const profileStyleMap: Record<
  OperatorProfile,
  {
    bg: string;
    text: string;
    border: string;
  }
> = {
  BT: {
    bg: "bg-blue-500/20 dark:bg-blue-500/30",
    text: "text-blue-600 dark:text-blue-400",
    border: "border-blue-500/50",
  },
  MT: {
    bg: "bg-purple-500/20 dark:bg-purple-500/30",
    text: "text-purple-600 dark:text-purple-400",
    border: "border-purple-500/50",
  },
  AT: {
    bg: "bg-orange-500/20 dark:bg-orange-500/30",
    text: "text-orange-600 dark:text-orange-400",
    border: "border-orange-500/50",
  },
  "Eng. Pré-Op": {
    bg: "bg-teal-500/20 dark:bg-teal-500/30",
    text: "text-teal-600 dark:text-teal-400",
    border: "border-teal-500/50",
  },
};

/* =========================
   COMPONENT
========================= */

export function OperatorsOverview() {
  const operatorsState = useSupervisorStore((state) => state.operators);

  const activeOperators = operatorsState.filter(
    (operator) => operator.status === "Ativo" || operator.status === "Pausa"
  );

  const totalAssigned = activeOperators.reduce(
    (acc, operator) => acc + operator.assumedOccurrences,
    0
  );

  const totalResolved = activeOperators.reduce(
    (acc, operator) => acc + operator.resolvedOccurrences,
    0
  );

  const averageResolutionTime = activeOperators.length > 0
    ? (
        activeOperators.reduce(
          (acc, operator) => acc + operator.averageResolutionTime,
          0
        ) / activeOperators.length
      ).toFixed(0)
    : "0";

  return (
    <div className="eq-surface overflow-hidden">
      
      {/* HEADER */}
      <div className="border-b border-[var(--eq-border)] p-6">
        <div className="flex items-center justify-between">
          
          <div className="flex items-center gap-3">
            <div className="eq-status-success flex h-10 w-10 items-center justify-center rounded-lg">
              <Users className="h-5 w-5" />
            </div>
            <div>
              <h3 className="eq-card-title text-lg">
                Desempenho dos Operadores
              </h3>
            </div>
          </div>

          {/* KPI SUMMARY */}
          <div className="flex items-center gap-6">
            <div className="text-right">
              <div className="eq-card-meta">
                Total Assumidas
              </div>
              <div className="text-xl font-bold text-[var(--eq-text-primary)]">
                {totalAssigned}
              </div>
            </div>

            <div className="text-right">
              <div className="eq-card-meta">
                Total Resolvidas
              </div>
              <div className="text-xl font-bold text-[#10b981]">
                {totalResolved}
              </div>
            </div>

            <div className="text-right">
              <div className="eq-card-meta">
                Tempo Médio
              </div>
              <div className="text-xl font-bold text-[var(--eq-text-primary)]">
                {averageResolutionTime}min
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* OPERATORS TABLE */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[var(--eq-border)] bg-[var(--eq-bg-surface-soft)]">
              <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-[var(--eq-text-muted)]">
                Operador
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-[var(--eq-text-muted)]">
                profile
              </th>
              <th className="px-6 py-3 text-center text-xs font-semibold uppercase tracking-wider text-[var(--eq-text-muted)]">
                Assumidas
              </th>
              <th className="px-6 py-3 text-center text-xs font-semibold uppercase tracking-wider text-[var(--eq-text-muted)]">
                Resolvidas
              </th>
              <th className="px-6 py-3 text-center text-xs font-semibold uppercase tracking-wider text-[var(--eq-text-muted)]">
                Tempo Médio
              </th>
              <th className="px-6 py-3 text-center text-xs font-semibold uppercase tracking-wider text-[var(--eq-text-muted)]">
                Taxa Resolução
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-[var(--eq-border)]">
            {activeOperators.map((operator) => {
              const profileStyle = profileStyleMap[operator.profile];
              const inProgress =
                operator.assumedOccurrences -
                operator.resolvedOccurrences;

              return (
                <tr
                  key={operator.id}
                  className="transition-colors hover:bg-[var(--eq-bg-surface-soft)]"
                >
                  {/* NAME */}
                  <td className="px-6 py-4">
                    <div>
                      <div className="font-medium text-[var(--eq-text-primary)]">
                        {operator.name}
                      </div>
                      <div className="text-xs text-[var(--eq-text-muted)]">
                        {operator.table} • {operator.shift}
                      </div>
                    </div>
                  </td>

                  {/* PROFILE */}
                  <td className="px-6 py-4">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${profileStyle.bg} ${profileStyle.text}`}
                    >
                      {operator.profile}
                    </span>
                  </td>

                  {/* ASSIGNED */}
                  <td className="px-6 py-4 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <Activity className="h-4 w-4 text-[var(--eq-text-muted)]" />
                      <span className="font-semibold text-[var(--eq-text-primary)]">
                        {operator.assumedOccurrences}
                      </span>
                    </div>
                  </td>

                  {/* RESOLVED */}
                  <td className="px-6 py-4 text-center">
                    <div className="flex flex-col items-center gap-1">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-[#10b981]" />
                        <span className="font-semibold text-[#10b981]">
                          {operator.resolvedOccurrences}
                        </span>
                      </div>

                      {inProgress > 0 && (
                        <span className="text-[10px] text-orange-500 font-medium">
                          {inProgress} em andamento
                        </span>
                      )}
                    </div>
                  </td>

                  {/* AVG TIME */}
                  <td className="px-6 py-4 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <Clock className="w-4 h-4 text-blue-500" />
                      <span className="font-semibold text-[var(--eq-text-primary)]">
                        {operator.averageResolutionTime}
                        <span className="ml-1 text-xs text-[var(--eq-text-muted)]">
                          min
                        </span>
                      </span>
                    </div>
                  </td>

                  {/* RESOLUTION RATE */}
                  <td className="px-6 py-4 text-center">
                    <div className="flex flex-col items-center">
                      <span className="font-bold text-[var(--eq-text-primary)]">
                        {operator.resolutionRate.toFixed(1)}%
                      </span>

                      <div className="mt-1 h-1.5 w-24 overflow-hidden rounded-full bg-[var(--eq-bg-muted)]">
                        <div
                          className="h-full bg-gradient-to-r from-[#10b981] to-[#14b8a6] rounded-full"
                          style={{
                            width: `${operator.resolutionRate}%`,
                          }}
                        />
                      </div>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* FOOTER */}
      <div className="border-t border-[var(--eq-border)] bg-[var(--eq-bg-surface-soft)] p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 text-xs">
            <span className="text-[var(--eq-text-muted)]">
              Perfis:
            </span>

            {Object.entries(profileStyleMap).map(
              ([profile, style]) => (
                <div key={profile} className="flex items-center gap-1.5">
                  <div className={`w-3 h-3 rounded ${style.bg}`} />
                  <span className="text-[var(--eq-text-secondary)]">
                    {profile}
                  </span>
                </div>
              )
            )}
          </div>

          <span className="text-xs text-[var(--eq-text-muted)]">
            {activeOperators.length} turnos ativos
          </span>
        </div>
      </div>
    </div>
  );
}
