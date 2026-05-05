import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ActivityDetailsModal } from "./ActivityDetailsModal";
import type { AtividadeRecente } from "../types/index";
import { useSupervisorStore } from "../stores/useSupervisorStore";

const typeStyles: Record<AtividadeRecente["type"], string> = {
  critical: "bg-red-500/10 border-red-500",
  warning: "bg-yellow-500/10 border-yellow-500",
  info: "bg-blue-500/10 border-blue-500",
  success: "bg-green-500/10 border-green-500",
};

const dotStyles: Record<AtividadeRecente["type"], string> = {
  critical: "bg-red-500",
  warning: "bg-yellow-500",
  info: "bg-blue-500",
  success: "bg-green-500",
};

export function ActivityFeed() {
  const navigate = useNavigate();
  const activities = useSupervisorStore((state) => state.activities);
  const [selectedActivity, setSelectedActivity] =
    useState<AtividadeRecente | null>(null);

  const MAX_RECENT_ACTIVITIES = 10;
  const visibleActivities = activities.slice(0, MAX_RECENT_ACTIVITIES);
  const hasMoreActivities = activities.length > MAX_RECENT_ACTIVITIES;

  return (
    <div className="eq-surface p-5">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="eq-card-title">Atividade Recente</h3>

        <button
          onClick={() => navigate("/supervisor/timeline")}
          className="text-xs text-green-400 hover:underline"
        >
          Ver tudo
        </button>
      </div>

      {/* List */}
      <div className="space-y-3 max-h-[48rem] overflow-y-auto pr-1">
        {visibleActivities.map((activity) => {
          return (
            <div
              key={activity.id}
              onClick={() => setSelectedActivity(activity)}
              className={`p-3 rounded-lg border-l-2 transition-all
                ${typeStyles[activity.type]}
                cursor-pointer hover:opacity-80
              `}
            >
              <div className="flex justify-between gap-3">
                <div className="flex items-start gap-2">
                  {/* Dot */}
                  <div
                    className={`w-2 h-2 rounded-full mt-1.5 shrink-0
                    ${dotStyles[activity.type]}`}
                  />

                  {/* Content */}
                  <div>
                    <p className="text-sm font-medium text-[var(--eq-text-primary)]">
                      {activity.title}
                    </p>

                    <p className="mt-0.5 whitespace-pre-line text-xs text-[var(--eq-text-secondary)]">
                      {activity.description}
                    </p>

                    <p className="mt-1.5 text-xs italic text-[var(--eq-text-muted)]">
                      {activity.author}
                    </p>
                  </div>
                </div>

                <span className="whitespace-nowrap text-xs text-[var(--eq-text-muted)]">
                  {activity.time}
                </span>
              </div>
            </div>
          );
        })}

        {activities.length === 0 && (
          <div className="eq-empty-state p-3 text-xs">
            Nenhuma atividade recente encontrada.
          </div>
        )}

        {hasMoreActivities && (
          <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 dark:bg-slate-900/50 p-3 text-xs text-slate-500">
            Mostrando as 10 atividades mais recentes. Veja tudo na linha do tempo.
          </div>
        )}
      </div>

      {/* Modal */}
      {selectedActivity && (
        <ActivityDetailsModal
          atividade={selectedActivity}
          onClose={() => setSelectedActivity(null)}
        />
      )}
    </div>
  );
}
