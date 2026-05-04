import { useState } from "react";
import {
  AlertTriangle,
  Clock,
  Zap,
  ArrowUp,
  ArrowDown,
  ArrowRightLeft,
  CheckCircle2,
  PlayCircle,
  AlertCircle,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";
import type {
   Occurrence,
   OccurrenceCriticality,
   OccurrenceStatus,
} from "../types/index";
import { OccurrenceDetailsModal } from "@/features/supervisor/components/OccurrenceDetailsModal";
import { useSupervisorStore } from "../stores/useSupervisorStore";

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
    color: "eq-criticality-critical",
    textColor: "text-red-600 dark:text-red-400",
    badgeColor: "eq-criticality-bar-critical",
    icon: AlertTriangle,
    order: 4,
  },
  alta: {
    label: "ALTA",
    color: "eq-criticality-high",
    textColor: "text-orange-600 dark:text-orange-400",
    badgeColor: "eq-criticality-bar-high",
    icon: Zap,
    order: 3,
  },
  media: {
    label: "MÉDIA",
    color: "eq-criticality-medium",
    textColor: "text-yellow-600 dark:text-yellow-400",
    badgeColor: "eq-criticality-bar-medium",
    icon: Clock,
    order: 2,
  },
  baixa: {
    label: "BAIXA",
    color: "eq-criticality-low",
    textColor: "text-green-600 dark:text-green-400",
    badgeColor: "eq-criticality-bar-low",
    icon: Clock,
    order: 1,
  },
};

// ==========================
// CONFIGURAÇÃO DE STATUS
// ==========================
const statusConfig: Record<
  OccurrenceStatus,
  { label: string; color: string; badge: string; icon: LucideIcon }
> = {
  aberta: {
    label: "Aberta",
    color: "text-slate-700 dark:text-slate-300",
    badge: "eq-status-open border",
    icon: AlertCircle,
  },
  em_andamento: {
    label: "Em Andamento",
    color: "text-blue-700 dark:text-blue-400",
    badge: "eq-status-progress border",
    icon: PlayCircle,
  },
  resolvida: {
    label: "Resolvida",
    color: "text-emerald-700 dark:text-emerald-400",
    badge: "eq-status-success border",
    icon: CheckCircle2,
  },
  transferida: {
    label: "Transferida",
    color: "text-violet-700 dark:text-violet-400",
    badge: "eq-status-transfer border",
    icon: ArrowRightLeft,
  },
};

export function OccurrencesList() {
  const [sortMode, setSortMode] = useState<SortMode>("priority");
  const [selectedOccurrence, setSelectedOccurrence] =
    useState<Occurrence | null>(null);
  const occurrencesState = useSupervisorStore((state) => state.occurrences);

  // 🔹 Mantendo filtro do código novo
  const ocorrenciasAbertas = occurrencesState.filter(
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
    <div className="eq-surface overflow-hidden">
      {/* HEADER ORIGINAL */}
      <div className="flex items-center justify-between border-b border-[var(--eq-border)] p-4">
        <div className="flex items-center gap-3">
          <div className="eq-criticality-high flex h-8 w-8 items-center justify-center rounded-lg">
            <AlertTriangle className="w-4 h-4 text-orange-600 dark:text-orange-400" />
          </div>
          <div>
            <h3 className="eq-card-title">
              Ocorrências Pendentes
            </h3>
            <p className="eq-page-subtitle text-xs">
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
                : "eq-control hover:bg-[var(--eq-bg-surface-soft)]"
            }`}
          >
            Prioridade
          </button>

          <button
            onClick={() => setSortMode("recent")}
            className={`px-3 py-1.5 rounded text-xs font-medium transition-all flex items-center gap-1 ${
              sortMode === "recent"
                ? "bg-[#10b981] text-white"
                : "eq-control hover:bg-[var(--eq-bg-surface-soft)]"
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
                : "eq-control hover:bg-[var(--eq-bg-surface-soft)]"
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
              onClick={() => navigate(`/occurrences/${occurrence.id}`)}
              className={`cursor-pointer rounded-lg border-l-4 p-4 transition-all hover:shadow-md ${config.color}`}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-start gap-3 flex-1">
                  <div className={`mt-0.5 ${config.textColor}`}>
                    <Icon className="w-5 h-5" />
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="text-sm font-semibold text-[var(--eq-text-primary)]">
                        {occurrence.title}
                      </h4>
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold text-white ${config.badgeColor}`}
                      >
                        {config.label}
                      </span>

                      {/* 🔹 Status integrado sem quebrar layout */}
                      <div
                        className={`ml-2 flex items-center gap-1 rounded px-2 py-0.5 text-[10px] font-medium ${status.badge}`}
                      >
                        <StatusIcon className="w-3 h-3" />
                        {status.label}
                      </div>
                    </div>

                    <p className="mb-2 text-xs text-[var(--eq-text-secondary)]">
                      {occurrence.description}
                    </p>

                    <div className="flex flex-wrap items-center gap-3 text-[11px]">
                      <div className="flex items-center gap-1.5 text-[var(--eq-text-muted)]">
                        <span className="font-medium">ID:</span>
                        <span className="font-mono">{occurrence.id}</span>
                      </div>

                      <div className="h-1 w-1 rounded-full bg-[var(--eq-border-strong)]" />

                      <div className="flex items-center gap-1.5 text-[var(--eq-text-muted)]">
                        <span className="font-medium">Local:</span>
                        <span>{occurrence.substation}</span>
                      </div>

                      <div className="h-1 w-1 rounded-full bg-[var(--eq-border-strong)]" />

                      <div className="flex items-center gap-1.5 text-[var(--eq-text-muted)]">
                        <Clock className="w-3 h-3" />
                        <span>{formatTimeAgo(occurrence.timestamp)}</span>
                      </div>
                    </div>

                    <div className="mt-2 flex items-center gap-2 border-t border-[var(--eq-border)] pt-2 text-[11px]">
                      <span className="text-[var(--eq-text-muted)]">
                        Registrado por:
                      </span>
                      <span className="font-medium text-[var(--eq-text-secondary)]">
                        {occurrence.operator}
                      </span>
                      <span className="text-[var(--eq-text-muted)]">
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
      <div className="border-t border-[var(--eq-border)] bg-[var(--eq-bg-surface-soft)] p-3">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-red-500"></div>
              <span className="text-[var(--eq-text-secondary)]">
                {
                  ocorrenciasAbertas.filter((o) => o.criticality === "critica")
                    .length
                }{" "}
                Crítica
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-orange-500"></div>
              <span className="text-[var(--eq-text-secondary)]">
                {
                  ocorrenciasAbertas.filter((o) => o.criticality === "alta")
                    .length
                }{" "}
                Alta
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
              <span className="text-[var(--eq-text-secondary)]">
                {
                  ocorrenciasAbertas.filter((o) => o.criticality === "media")
                    .length
                }{" "}
                Média
              </span>
            </div>
          </div>

          <span className="text-[var(--eq-text-muted)]">
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
