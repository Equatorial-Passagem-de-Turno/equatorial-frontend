"use client";

import { useState } from "react";
import {
  AlertTriangle,
  Clock,
  CheckCircle2,
  Users,
  ChevronDown,
  ChevronUp,
  Zap,
} from "lucide-react";

import { OCCURRENCES } from "../../mocks/mocks";
import type { Occurrence } from "../../types/index";

/* =========================
   FILTRO - SOMENTE CRÍTICAS
========================= */

const criticalOccurrences: Occurrence[] = OCCURRENCES.filter(
  (o) => o.criticality === "critica"
);

/* =========================
   CONFIG ICONES
========================= */

const statusIcons = {
  aberta: AlertTriangle,
  em_andamento: Zap,
  resolvida: CheckCircle2,
  transferida: Users,
};

const statusColors = {
  aberta: "text-red-500 bg-red-500/20 border-red-500/50",
  em_andamento: "text-orange-500 bg-orange-500/20 border-orange-500/50",
  resolvida: "text-green-500 bg-green-500/20 border-green-500/50",
  transferida: "text-purple-500 bg-purple-500/20 border-purple-500/50",
};

export function CriticalTimeline() {
  const [expandedId, setExpandedId] = useState<string | null>(
    criticalOccurrences[0]?.id ?? null
  );

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "short",
    });
  };

  return (
    <div className="bg-white dark:bg-[#1e293b]/50 rounded-lg border border-zinc-200 dark:border-[#334155] overflow-hidden">
      
      {/* HEADER */}
      <div className="p-6 border-b border-zinc-200 dark:border-[#334155]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-red-500/20 dark:bg-red-500/30 flex items-center justify-center">
            <Clock className="w-5 h-5 text-red-500" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-zinc-900 dark:text-white">
              Linha do Tempo - Ocorrências Críticas
            </h3>
            <p className="text-sm text-zinc-500 dark:text-[#94a3b8]">
              Baseado nas ocorrências reais do sistema
            </p>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-4">
        {criticalOccurrences.map((occurrence) => {
          const isExpanded = expandedId === occurrence.id;
          const StatusIcon = statusIcons[occurrence.status];
          const statusColor = statusColors[occurrence.status];

          return (
            <div
              key={occurrence.id}
              className="border border-zinc-200 dark:border-[#334155] rounded-lg overflow-hidden"
            >
              {/* HEADER */}
              <button
                onClick={() =>
                  setExpandedId(isExpanded ? null : occurrence.id)
                }
                className="w-full p-4 flex items-center justify-between hover:bg-zinc-50 dark:hover:bg-[#1e293b]/30 transition-colors"
              >
                <div className="flex items-start gap-3 flex-1 text-left">
                  
                  <div className={`w-10 h-10 rounded-full border-2 flex items-center justify-center ${statusColor}`}>
                    <StatusIcon className="w-4 h-4" />
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-bold text-zinc-900 dark:text-white">
                        {occurrence.title}
                      </h4>

                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          occurrence.status === "resolvida"
                            ? "bg-green-500 text-white"
                            : occurrence.status === "em_andamento"
                            ? "bg-orange-500 text-white"
                            : "bg-red-500 text-white"
                        }`}
                      >
                        {occurrence.status.toUpperCase()}
                      </span>
                    </div>

                    <p className="text-sm text-zinc-600 dark:text-[#94a3b8] mb-2">
                      {occurrence.description}
                    </p>

                    <div className="flex items-center gap-4 text-xs text-zinc-500 dark:text-[#64748b]">
                      <span className="font-mono">{occurrence.id}</span>
                      <span>•</span>
                      <span>{occurrence.geographicBase}</span>
                      <span>•</span>
                      <span>{formatDate(occurrence.dateTime)} {formatTime(occurrence.dateTime)}</span>
                    </div>
                  </div>
                </div>

                {isExpanded ? (
                  <ChevronUp className="w-5 h-5 text-zinc-400" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-zinc-400" />
                )}
              </button>

              {/* EXPANSÃO */}
              {isExpanded && (
                <div className="border-t border-zinc-200 dark:border-[#334155] p-6 bg-zinc-50 dark:bg-[#0f172a]/30 space-y-4">

                  {occurrence.affectedConsumers && (
                    <div className="p-3 rounded-lg bg-red-500/10 dark:bg-red-500/20 border border-red-500/30">
                      <div className="text-xs font-semibold text-red-700 dark:text-red-400 mb-1">
                        IMPACTO
                      </div>
                      <div className="text-sm text-zinc-900 dark:text-white">
                        {occurrence.affectedConsumers.toLocaleString()} consumidores afetados
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <div className="text-xs text-zinc-500">Subestação</div>
                      <div className="font-medium text-zinc-900 dark:text-white">
                        {occurrence.substation}
                      </div>
                    </div>

                    <div>
                      <div className="text-xs text-zinc-500">Alimentador</div>
                      <div className="font-medium text-zinc-900 dark:text-white">
                        {occurrence.feeder}
                      </div>
                    </div>

                    <div>
                      <div className="text-xs text-zinc-500">Operador</div>
                      <div className="font-medium text-zinc-900 dark:text-white">
                        {occurrence.operator}
                      </div>
                    </div>

                    <div>
                      <div className="text-xs text-zinc-500">Perfil</div>
                      <div className="font-medium text-zinc-900 dark:text-white">
                        {occurrence.profile}
                      </div>
                    </div>
                  </div>

                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* FOOTER */}
      <div className="p-4 border-t border-zinc-200 dark:border-[#334155] bg-zinc-50 dark:bg-[#0f172a]/50 text-xs text-zinc-500 dark:text-[#64748b]">
        {criticalOccurrences.length} ocorrências críticas registradas
      </div>
    </div>
  );
}