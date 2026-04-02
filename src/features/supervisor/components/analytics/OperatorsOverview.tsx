"use client";

import {
  Users,
  CheckCircle2,
  Clock,
  Activity,
} from "lucide-react";

import { OPERATORS } from "../../mocks/mocks";
import type { OperatorProfile } from "../../types/index";

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
  const activeOperators = OPERATORS.filter(
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

  const averageResolutionTime = (
    activeOperators.reduce(
      (acc, operator) => acc + operator.resolutionRate,
      0
    ) / activeOperators.length
  ).toFixed(0);

  return (
    <div className="bg-white dark:bg-theme-panel rounded-lg border border-zinc-200 dark:border-[#334155] overflow-hidden">
      
      {/* HEADER */}
      <div className="p-6 border-b border-zinc-200 dark:border-[#334155]">
        <div className="flex items-center justify-between">
          
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[#10b981]/20 dark:bg-[#10b981]/30 flex items-center justify-center">
              <Users className="w-5 h-5 text-[#10b981]" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-zinc-900 dark:text-white">
                Desempenho dos Operadores
              </h3>
            </div>
          </div>

          {/* KPI SUMMARY */}
          <div className="flex items-center gap-6">
            <div className="text-right">
              <div className="text-xs text-zinc-500 dark:text-[#64748b]">
                Total Assumidas
              </div>
              <div className="text-xl font-bold text-zinc-900 dark:text-white">
                {totalAssigned}
              </div>
            </div>

            <div className="text-right">
              <div className="text-xs text-zinc-500 dark:text-[#64748b]">
                Total Resolvidas
              </div>
              <div className="text-xl font-bold text-[#10b981]">
                {totalResolved}
              </div>
            </div>

            <div className="text-right">
              <div className="text-xs text-zinc-500 dark:text-[#64748b]">
                Tempo Médio
              </div>
              <div className="text-xl font-bold text-zinc-900 dark:text-white">
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
            <tr className="bg-zinc-50 dark:bg-[#0f172a]/50 border-b border-zinc-200 dark:border-[#334155]">
              <th className="px-6 py-3 text-left text-xs font-semibold text-zinc-600 dark:text-[#94a3b8] uppercase tracking-wider">
                Operador
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-zinc-600 dark:text-[#94a3b8] uppercase tracking-wider">
                profile
              </th>
              <th className="px-6 py-3 text-center text-xs font-semibold text-zinc-600 dark:text-[#94a3b8] uppercase tracking-wider">
                Assumidas
              </th>
              <th className="px-6 py-3 text-center text-xs font-semibold text-zinc-600 dark:text-[#94a3b8] uppercase tracking-wider">
                Resolvidas
              </th>
              <th className="px-6 py-3 text-center text-xs font-semibold text-zinc-600 dark:text-[#94a3b8] uppercase tracking-wider">
                Tempo Médio
              </th>
              <th className="px-6 py-3 text-center text-xs font-semibold text-zinc-600 dark:text-[#94a3b8] uppercase tracking-wider">
                Taxa Resolução
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-zinc-200 dark:divide-[#334155]">
            {activeOperators.map((operator) => {
              const profileStyle = profileStyleMap[operator.profile];
              const inProgress =
                operator.assumedOccurrences -
                operator.resolvedOccurrences;

              return (
                <tr
                  key={operator.id}
                  className="hover:bg-zinc-50 dark:hover:bg-[#1e293b]/30 transition-colors"
                >
                  {/* NAME */}
                  <td className="px-6 py-4">
                    <div>
                      <div className="font-medium text-zinc-900 dark:text-white">
                        {operator.name}
                      </div>
                      <div className="text-xs text-zinc-500 dark:text-[#64748b]">
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
                      <Activity className="w-4 h-4 text-zinc-400" />
                      <span className="font-semibold text-zinc-900 dark:text-white">
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
                      <span className="font-semibold text-zinc-900 dark:text-white">
                        {operator.resolutionRate}
                        <span className="text-xs text-zinc-500 dark:text-[#64748b] ml-1">
                          min
                        </span>
                      </span>
                    </div>
                  </td>

                  {/* RESOLUTION RATE */}
                  <td className="px-6 py-4 text-center">
                    <div className="flex flex-col items-center">
                      <span className="font-bold text-zinc-900 dark:text-white">
                        {operator.resolutionRate.toFixed(1)}%
                      </span>

                      <div className="w-24 h-1.5 bg-zinc-200 dark:bg-[#334155] rounded-full mt-1 overflow-hidden">
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
      <div className="p-4 border-t border-zinc-200 dark:border-[#334155] bg-zinc-50 dark:bg-[#0f172a]/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 text-xs">
            <span className="text-zinc-500 dark:text-[#64748b]">
              Perfis:
            </span>

            {Object.entries(profileStyleMap).map(
              ([profile, style]) => (
                <div key={profile} className="flex items-center gap-1.5">
                  <div className={`w-3 h-3 rounded ${style.bg}`} />
                  <span className="text-zinc-600 dark:text-[#94a3b8]">
                    {profile}
                  </span>
                </div>
              )
            )}
          </div>

          <span className="text-xs text-zinc-500 dark:text-[#64748b]">
            {activeOperators.length} operadores ativos
          </span>
        </div>
      </div>
    </div>
  );
}