import { useState } from "react";
import { X, AlertCircle, CheckCircle2, Clock } from "lucide-react";
import { OCCURRENCES, BASE_PENDINGS,  } from "../mocks/mocks.ts";
import type { Occurrence } from "../types/index.ts";
import { OccurrenceDetailsModal } from "./OccurrenceDetailsModal";

/* =========================
   TYPES
========================= */

interface ShiftPendingItem {
  id: string;
  title: string;
  description: string;
  status: "Resolvida" | "Em Andamento" | "Pendente";
  priority: "Baixa" | "Média" | "Alta" | "Crítica";
  time: string;
  resolutionTime?: number;
}

interface ShiftPendingItemsModalProps {
  isOpen: boolean;
  onClose: () => void;
  operator: string;
  shiftId: string;
  date: string;
}

/* =========================
   COMPONENT
========================= */

export function ShiftPendingItemsModal({
  isOpen,
  onClose,
  operator,
  shiftId,
  date,
}: ShiftPendingItemsModalProps) {
  const [selectedOccurrence, setSelectedOccurrence] =
    useState<Occurrence | null>(null);

  if (!isOpen) return null;

  const pendingItems: ShiftPendingItem[] = BASE_PENDINGS.map((item) => ({
    id: item.id,
    title: item.title,
    description: item.description,
    status: item.status === "CRÍTICA" ? "Pendente" : "Em Andamento",
    priority: "Crítica",
    time: item.time,
  }));

  const relatedOccurrences = OCCURRENCES.slice(0, pendingItems.length);

  /* =========================
     CORES PURAS TAILWIND
  ========================= */

  const getStatusBadgeClass = (status: ShiftPendingItem["status"]) => {
    switch (status) {
      case "Resolvida":
        return "bg-emerald-500/10 text-emerald-400";
      case "Em Andamento":
        return "bg-amber-500/10 text-amber-400";
      case "Pendente":
        return "bg-red-500/10 text-red-400";
      default:
        return "bg-slate-500/10 text-slate-400";
    }
  };

  const getPriorityTextClass = (priority: ShiftPendingItem["priority"]) => {
    switch (priority) {
      case "Crítica":
        return "text-red-400";
      case "Alta":
        return "text-amber-400";
      case "Média":
        return "text-sky-400";
      case "Baixa":
        return "text-slate-400";
      default:
        return "text-slate-400";
    }
  };

  const resolvedCount = pendingItems.filter(
    (item) => item.status === "Resolvida"
  ).length;

  const inProgressCount = pendingItems.filter(
    (item) => item.status === "Em Andamento"
  ).length;

  const criticalCount = pendingItems.filter(
    (item) => item.status === "Pendente"
  ).length;

  return (
    <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
      <div className="bg-theme-panel   border border-slate-700 rounded-lg w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">

        {/* Header */}
        <div className="p-6 border-b border-slate-700">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-lg bg-slate-700 flex items-center justify-center">
                  <Clock className="w-5 h-5 text-slate-200" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-100">
                    Pendências do Turno
                  </h2>
                  <p className="text-sm text-slate-400">
                    {shiftId} • {operator}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4 text-xs text-slate-400 pl-[52px]">
                <span>{date}</span>
                <span>•</span>
                <span>{pendingItems.length} itens</span>
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg bg-slate-700 hover:bg-slate-600 flex items-center justify-center transition-colors"
            >
              <X className="w-5 h-5 text-slate-400" />
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="p-4 border-b border-slate-700 bg-theme-card">
          <div className="grid grid-cols-4 gap-4">
            <StatCard
              icon={<AlertCircle className="w-4 h-4 text-sky-400" />}
              value={pendingItems.length}
              label="Total"
            />

            <StatCard
              icon={<CheckCircle2 className="w-4 h-4 text-emerald-400" />}
              value={resolvedCount}
              label="Resolvidas"
              valueClass="text-emerald-400"
            />

            <StatCard
              icon={<Clock className="w-4 h-4 text-amber-400" />}
              value={inProgressCount}
              label="Em Andamento"
              valueClass="text-amber-400"
            />

            <StatCard
              icon={<AlertCircle className="w-4 h-4 text-red-400" />}
              value={criticalCount}
              label="Críticas"
              valueClass="text-red-400"
            />
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {pendingItems.length > 0 ? (
            <div className="space-y-3">
              {pendingItems.map((item, index) => {
                const relatedOccurrence = relatedOccurrences[index];

                return (
                  <div
                    key={item.id}
                    onClick={() =>
                      relatedOccurrence &&
                      setSelectedOccurrence(relatedOccurrence)
                    }
                    className={`bg-slate-700 border rounded-lg p-4 transition-colors cursor-pointer
                      ${
                        item.status === "Pendente"
                          ? "border-red-500/40 hover:border-red-500"
                          : "border-slate-600 hover:border-slate-400"
                      }
                    `}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-xs font-mono text-slate-400">
                            {item.id}
                          </span>

                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-semibold ${getStatusBadgeClass(
                              item.status
                            )}`}
                          >
                            {item.status}
                          </span>

                          <span
                            className={`text-xs font-medium ${getPriorityTextClass(
                              item.priority
                            )}`}
                          >
                            {item.priority}
                          </span>
                        </div>

                        <h4 className="font-semibold text-slate-100 mb-1">
                          {item.title}
                        </h4>

                        <p className="text-sm text-slate-400 mb-2">
                          {item.description}
                        </p>

                        <div className="flex items-center gap-3 text-xs text-slate-400">
                          <Clock className="w-3 h-3" />
                          <span>{item.time}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="p-12 text-center">
              <AlertCircle className="w-12 h-12 text-slate-500 mx-auto mb-3 opacity-50" />
              <p className="text-slate-400">
                Nenhuma pendência para este turno
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-700 bg-slate-900">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>
              {resolvedCount} resolvidas de {pendingItems.length}
            </span>
            {pendingItems.length > 0 && (
              <span>
                Taxa de resolução:{" "}
                {((resolvedCount / pendingItems.length) * 100).toFixed(1)}%
              </span>
            )}
          </div>
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

/* =========================
   STAT CARD
========================= */

function StatCard({
  icon,
  value,
  label,
  valueClass = "text-slate-100",
}: {
  icon: React.ReactNode;
  value: number;
  label: string;
  valueClass?: string;
}) {
  return (
    <div className="flex items-center gap-2">
      <div className="w-8 h-8 rounded bg-slate-700 flex items-center justify-center">
        {icon}
      </div>
      <div>
        <div className={`text-lg font-bold ${valueClass}`}>{value}</div>
        <div className="text-xs text-slate-400">{label}</div>
      </div>
    </div>
  );
}