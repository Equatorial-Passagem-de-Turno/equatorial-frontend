import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ActivityDetailsModal } from "./ActivityDetailsModal";
import { ATIVIDADES_RECENTES, type AtividadeRecente } from "../mocks/mocks";

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

  const [selectedActivity, setSelectedActivity] =
    useState<AtividadeRecente | null>(null);

  return (
    <div className="bg-slate-900 border border-slate-700 rounded-lg p-5">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-white">Atividade Recente</h3>

        <button
          onClick={() => navigate("/timeline")}
          className="text-xs text-green-400 hover:underline"
        >
          Ver tudo
        </button>
      </div>

      {/* List */}
      <div className="space-y-3">
        {ATIVIDADES_RECENTES.map((activity) => {
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
                    <p className="text-sm font-medium text-white">
                      {activity.title}
                    </p>

                    <p className="text-xs mt-0.5 whitespace-pre-line text-slate-400">
                      {activity.description}
                    </p>

                    <p className="text-xs mt-1.5 italic text-slate-500">
                      {activity.author}
                    </p>
                  </div>
                </div>

                <span className="text-xs text-slate-400 whitespace-nowrap">
                  {activity.time}
                </span>
              </div>
            </div>
          );
        })}
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
