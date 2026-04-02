import { useState } from "react";
import {
  AlertTriangle,
  Clock,
  Zap,
  ArrowUp,
  ArrowDown,
  CheckCircle,
  RefreshCw,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";
import type {
   Occurrence,
   OccurrenceCriticality,
   OccurrenceStatus,
} from "../types/index";
import { OCCURRENCES } from "../mocks/mocks.ts";
import { OccurrenceDetailsModal } from "@/features/supervisor/components/OccurrenceDetailsModal";

type SortMode = "priority" | "recent" | "oldest";

// ==========================
// CONFIGURAÇÃO DE CRITICIDADE
// ==========================
const priorityConfig: Record<
  OccurrenceCriticality,
  {
    label: string;
    color: string;
    textColor: string;
    badgeColor: string;
    icon: LucideIcon;
    order: number;
  }
> = {
  critica: {
    label: "CRÍTICA",
    color:
      "bg-red-500/10 border-red-500/30 dark:bg-red-500/20 dark:border-red-500/50",
    textColor: "text-red-600 dark:text-red-400",
    badgeColor: "bg-red-500",
    icon: AlertTriangle,
    order: 4,
  },
  alta: {
    label: "ALTA",
    color:
      "bg-orange-500/10 border-orange-500/30 dark:bg-orange-500/20 dark:border-orange-500/50",
    textColor: "text-orange-600 dark:text-orange-400",
    badgeColor: "bg-orange-500",
    icon: Zap,
    order: 3,
  },
  media: {
    label: "MÉDIA",
    color:
      "bg-yellow-500/10 border-yellow-500/30 dark:bg-yellow-500/20 dark:border-yellow-500/50",
    textColor: "text-yellow-600 dark:text-yellow-400",
    badgeColor: "bg-yellow-500",
    icon: Clock,
    order: 2,
  },
  baixa: {
    label: "BAIXA",
    color:
      "bg-blue-500/10 border-blue-500/30 dark:bg-blue-500/20 dark:border-blue-500/50",
    textColor: "text-blue-600 dark:text-blue-400",
    badgeColor: "bg-blue-500",
    icon: Clock,
    order: 1,
  },
};

// ==========================
// CONFIGURAÇÃO DE STATUS
// ==========================
const statusConfig: Record<
  OccurrenceStatus,
  { label: string; color: string; icon: LucideIcon }
> = {
  aberta: {
    label: "Aberta",
    color: "text-red-500",
    icon: AlertTriangle,
  },
  em_andamento: {
    label: "Em Andamento",
    color: "text-yellow-500",
    icon: RefreshCw,
  },
  resolvida: {
    label: "Resolvida",
    color: "text-green-500",
    icon: CheckCircle,
  },
  transferida: {
    label: "Transferida",
    color: "text-blue-500",
    icon: ArrowUp,
  },
};

export function OccurrencesList() {
  const [sortMode, setSortMode] = useState<SortMode>("priority");
  const [selectedOccurrence, setSelectedOccurrence] =
    useState<Occurrence | null>(null);
  // 🔹 Mantendo filtro do código novo
  const ocorrenciasAbertas = OCCURRENCES.filter(
    (o) => o.status === "aberta" || o.status === "em_andamento",
  );

  const sortedOccurrences = [...ocorrenciasAbertas].sort((a, b) => {
    if (sortMode === "priority") {
      return (
        priorityConfig[b.criticality].order -
        priorityConfig[a.criticality].order
      );
    } else if (sortMode === "recent") {
      return b.timestamp - a.timestamp;
    } else {
      return a.timestamp - b.timestamp;
    }
  });

  const formatTimeAgo = (timestamp: number) => {
    const diff = new Date().getTime() - timestamp;
    const minutes = Math.floor(diff / 60000);

    if (minutes < 60) return `${minutes}m atrás`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h atrás`;
    return `${Math.floor(hours / 24)}d atrás`;
  };
  const navigate = useNavigate();

  return (
    <div className="bg-white dark:bg-[#1e293b]/50 rounded-lg border border-zinc-200 dark:border-[#334155] overflow-hidden">
      {/* HEADER ORIGINAL */}
      <div className="p-4 border-b border-zinc-200 dark:border-[#334155] flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-orange-500/20 dark:bg-orange-500/30 flex items-center justify-center">
            <AlertTriangle className="w-4 h-4 text-orange-600 dark:text-orange-400" />
          </div>
          <div>
            <h3 className="font-semibold text-zinc-900 dark:text-white">
              Ocorrências Pendentes
            </h3>
            <p className="text-xs text-zinc-500 dark:text-[#94a3b8]">
              {ocorrenciasAbertas.length} ocorrências ativas
            </p>
          </div>
        </div>

        {/* SORT ORIGINAL */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setSortMode("priority")}
            className={`px-3 py-1.5 rounded text-xs font-medium transition-all ${
              sortMode === "priority"
                ? "bg-[#10b981] text-white"
                : "bg-zinc-100 dark:bg-[#1e293b] text-zinc-600 dark:text-[#94a3b8] hover:bg-zinc-200 dark:hover:bg-[#334155]"
            }`}
          >
            Prioridade
          </button>

          <button
            onClick={() => setSortMode("recent")}
            className={`px-3 py-1.5 rounded text-xs font-medium transition-all flex items-center gap-1 ${
              sortMode === "recent"
                ? "bg-[#10b981] text-white"
                : "bg-zinc-100 dark:bg-[#1e293b] text-zinc-600 dark:text-[#94a3b8] hover:bg-zinc-200 dark:hover:bg-[#334155]"
            }`}
          >
            <ArrowDown className="w-3 h-3" />
            Recente
          </button>

          <button
            onClick={() => setSortMode("oldest")}
            className={`px-3 py-1.5 rounded text-xs font-medium transition-all flex items-center gap-1 ${
              sortMode === "oldest"
                ? "bg-[#10b981] text-white"
                : "bg-zinc-100 dark:bg-[#1e293b] text-zinc-600 dark:text-[#94a3b8] hover:bg-zinc-200 dark:hover:bg-[#334155]"
            }`}
          >
            <ArrowUp className="w-3 h-3" />
            Antiga
          </button>
        </div>
      </div>

      {/* LISTA ORIGINAL */}
      <div className="p-4 space-y-3 max-h-[600px] overflow-y-auto">
        {sortedOccurrences.map((occurrence) => {
          const config = priorityConfig[occurrence.criticality];
          const status = statusConfig[occurrence.status];
          const Icon = config.icon;
          const StatusIcon = status.icon;

          return (
            <div
              key={occurrence.id}
              onClick={() => navigate(`/supervisor/occurrences/${occurrence.id}`)}
              className={`p-4 rounded-lg border-l-4 ${config.color} transition-all hover:shadow-md cursor-pointer`}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-start gap-3 flex-1">
                  <div className={`mt-0.5 ${config.textColor}`}>
                    <Icon className="w-5 h-5" />
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-semibold text-sm text-zinc-900 dark:text-white">
                        {occurrence.title}
                      </h4>
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold text-white ${config.badgeColor}`}
                      >
                        {config.label}
                      </span>

                      {/* 🔹 Status integrado sem quebrar layout */}
                      <div
                        className={`ml-2 flex items-center gap-1 text-[10px] ${status.color}`}
                      >
                        <StatusIcon className="w-3 h-3" />
                        {status.label}
                      </div>
                    </div>

                    <p className="text-xs text-zinc-600 dark:text-[#94a3b8] mb-2">
                      {occurrence.description}
                    </p>

                    <div className="flex flex-wrap items-center gap-3 text-[11px]">
                      <div className="flex items-center gap-1.5 text-zinc-500 dark:text-[#64748b]">
                        <span className="font-medium">ID:</span>
                        <span className="font-mono">{occurrence.id}</span>
                      </div>

                      <div className="w-1 h-1 rounded-full bg-zinc-300 dark:bg-[#475569]" />

                      <div className="flex items-center gap-1.5 text-zinc-500 dark:text-[#64748b]">
                        <span className="font-medium">Local:</span>
                        <span>{occurrence.substation}</span>
                      </div>

                      <div className="w-1 h-1 rounded-full bg-zinc-300 dark:bg-[#475569]" />

                      <div className="flex items-center gap-1.5 text-zinc-500 dark:text-[#64748b]">
                        <Clock className="w-3 h-3" />
                        <span>{formatTimeAgo(occurrence.timestamp)}</span>
                      </div>
                    </div>

                    <div className="mt-2 pt-2 border-t border-zinc-200 dark:border-[#334155]/50 flex items-center gap-2 text-[11px]">
                      <span className="text-zinc-500 dark:text-[#64748b]">
                        Registrado por:
                      </span>
                      <span className="font-medium text-zinc-700 dark:text-[#94a3b8]">
                        {occurrence.operator}
                      </span>
                      <span className="text-zinc-400 dark:text-[#64748b]">
                        •
                      </span>
                      <span className="text-[#10b981] font-medium">
                        {occurrence.table}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* FOOTER ORIGINAL */}
      <div className="p-3 border-t border-zinc-200 dark:border-[#334155] bg-zinc-50 dark:bg-[#0f172a]/50">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-red-500"></div>
              <span className="text-zinc-600 dark:text-[#94a3b8]">
                {
                  ocorrenciasAbertas.filter((o) => o.criticality === "critica")
                    .length
                }{" "}
                Crítica
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-orange-500"></div>
              <span className="text-zinc-600 dark:text-[#94a3b8]">
                {
                  ocorrenciasAbertas.filter((o) => o.criticality === "alta")
                    .length
                }{" "}
                Alta
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
              <span className="text-zinc-600 dark:text-[#94a3b8]">
                {
                  ocorrenciasAbertas.filter((o) => o.criticality === "media")
                    .length
                }{" "}
                Média
              </span>
            </div>
          </div>

          <span className="text-zinc-500 dark:text-[#64748b]">
            Atualizado agora
          </span>
        </div>
      </div>
      {selectedOccurrence && (
        <OccurrenceDetailsModal
          occurrence={selectedOccurrence}
          onClose={() => setSelectedOccurrence(null)}
        />
      )}
    </div>
  );
}
