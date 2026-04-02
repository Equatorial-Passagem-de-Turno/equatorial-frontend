import { X } from "lucide-react";
import { ATIVIDADES_RECENTES } from "../mocks/mocks.ts";

interface NotificacoesModalProps {
  onClose: () => void;
}

/**
 * Estilos semânticos por tipo de atividade
 */
const typeStyles = {
  critical: "bg-destructive/10 border-destructive",
  warning: "bg-accent-secondary/10 border-accent-secondary",
  info: "bg-accent-primary/10 border-accent-primary",
  success: "bg-accent-primary/10 border-accent-primary",
};

const dotStyles = {
  critical: "bg-destructive",
  warning: "bg-accent-secondary",
  info: "bg-accent-primary",
  success: "bg-accent-primary",
};

export function NotificacoesModal({ onClose }: NotificacoesModalProps) {
  // Ordena as notificações das mais recentes para as mais antigas
  // Usamos o timestamp para ordenação precisa
  const sortedAtividades = [...ATIVIDADES_RECENTES].sort((a, b) => {
    // Converter timestamps para comparação
    const parseTimestamp = (ts: string) => {
      const [datePart, timePart] = ts.split(" ");
      const [day, month, year] = datePart.split("/");
      const [hour, minute] = timePart.split(":");
      return new Date(
        parseInt(year),
        parseInt(month) - 1,
        parseInt(day),
        parseInt(hour),
        parseInt(minute)
      ).getTime();
    };

    return parseTimestamp(b.timestamp) - parseTimestamp(a.timestamp);
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative z-10 bg-bg-card border border-border-primary rounded-lg shadow-2xl w-full max-w-3xl max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border-primary">
          <div>
            <h2 className="text-xl font-semibold text-text-primary">
              Todas as Notificações
            </h2>
            <p className="text-sm text-text-muted mt-1">
              {sortedAtividades.length} notificações recentes
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-bg-hover rounded-lg transition-colors"
            aria-label="Fechar"
          >
            <X className="w-5 h-5 text-text-muted" />
          </button>
        </div>

        {/* Conteúdo - Lista de Notificações */}
        <div className="overflow-y-auto p-6 space-y-3 flex-1">
          {sortedAtividades.map((activity) => (
            <div
              key={activity.id}
              className={`p-4 rounded-lg border-l-2 transition-all ${typeStyles[activity.type]}`}
            >
              <div className="flex justify-between gap-4">
                <div className="flex items-start gap-3 flex-1">
                  {/* Indicador */}
                  <div
                    className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${dotStyles[activity.type]}`}
                  />

                  {/* Conteúdo */}
                  <div className="flex-1">
                    <p className="text-sm font-medium text-text-primary">
                      {activity.title}
                    </p>

                    <p className="text-sm mt-1 whitespace-pre-line text-text-muted">
                      {activity.description}
                    </p>

                    <div className="flex items-center gap-3 mt-2">
                      <p className="text-xs italic text-text-secondary">
                        {activity.author}
                      </p>
                      <span className="text-xs text-text-muted">•</span>
                      <span className="text-xs text-text-muted">
                        {activity.timestamp}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Horário Relativo */}
                <span className="text-xs text-text-muted whitespace-nowrap self-start">
                  {activity.time}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 p-6 border-t border-border-primary">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-bg-secondary hover:bg-bg-hover text-text-primary rounded-lg transition-colors font-medium"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
}
