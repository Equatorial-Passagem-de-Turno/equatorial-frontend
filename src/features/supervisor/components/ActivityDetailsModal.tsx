import { X, Bell, Clock, User, AlertTriangle, CheckCircle, Info } from 'lucide-react';
import type { AtividadeRecente } from '../mocks/mocks.ts';

interface ActivityDetailsModalProps {
  atividade: AtividadeRecente;
  onClose: () => void;
}

export function ActivityDetailsModal({ atividade, onClose }: ActivityDetailsModalProps) {

  const getActivityTypeIcon = () => {
    switch (atividade.type) {
      case 'critical':
        return <AlertTriangle className="w-5 h-5 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-amber-500" />;
      case 'success':
        return <CheckCircle className="w-5 h-5 text-emerald-500" />;
      case 'info':
      default:
        return <Info className="w-5 h-5 text-blue-500" />;
    }
  };

  const getActivityTypeLabel = () => {
    switch (atividade.type) {
      case 'critical':
        return 'Alerta Crítico';
      case 'warning':
        return 'Alerta de Atenção';
      case 'success':
        return 'Notificação de Sucesso';
      case 'info':
      default:
        return 'Informação';
    }
  };

  const getActivityTypeBadgeColor = () => {
    switch (atividade.type) {
      case 'critical':
        return 'bg-red-500/20 text-red-300 border-red-500/50';
      case 'warning':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/50';
      case 'success':
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50';
      case 'info':
      default:
        return 'bg-blue-500/20 text-blue-300 border-blue-500/50';
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-theme-panel border border-border-primary rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">

        {/* Header */}
        <div className="flex items-start justify-between p-6 border-b border-border-primary sticky top-0 bg-bg-card">
          <div className="flex items-start gap-3 flex-1">
            {getActivityTypeIcon()}
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <span className={`px-2 py-1 rounded text-xs border ${getActivityTypeBadgeColor()} uppercase font-medium`}>
                  {getActivityTypeLabel()}
                </span>
              </div>
              <h2 className="text-lg text-text-primary">{atividade.title}</h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-text-muted hover:text-text-primary transition-colors p-1 hover:bg-bg-secondary rounded"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">

          {/* Descrição */}
          <div>
            <h3 className="text-sm font-medium text-text-primary mb-3 flex items-center gap-2">
              <Bell className="w-4 h-4 text-accent-primary" />
              Detalhes
            </h3>
            <div className="bg-bg-secondary border border-border-primary rounded-lg p-4">
              <p className="text-sm text-text-primary whitespace-pre-line leading-relaxed">
                {atividade.description}
              </p>
            </div>
          </div>

          {/* Informações */}
          <div className="grid grid-cols-2 gap-4">

            {/* Data/Hora */}
            <div className="bg-bg-secondary border border-border-primary rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="w-4 h-4 text-text-muted" />
                <p className="text-xs text-text-muted uppercase tracking-wide">Data/Hora</p>
              </div>
              <p className="text-sm text-text-primary font-mono">{atividade.timestamp}</p>
              <p className="text-xs text-text-muted mt-1">{atividade.time}</p>
            </div>

            {/* Autor */}
            <div className="bg-bg-secondary border border-border-primary rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <User className="w-4 h-4 text-text-muted" />
                <p className="text-xs text-text-muted uppercase tracking-wide">Autor</p>
              </div>
              <p className="text-sm text-text-primary">{atividade.author}</p>
            </div>

          </div>

          {/* ID da Atividade */}
          <div className="bg-bg-secondary border border-border-primary rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Info className="w-4 h-4 text-text-muted" />
              <p className="text-xs text-text-muted uppercase tracking-wide">Identificador</p>
            </div>
            <p className="text-sm text-text-primary font-mono">{atividade.id}</p>
          </div>

        </div>

        {/* Footer */}
        <div className="p-6 border-t border-border-primary flex justify-end gap-3 bg-bg-secondary/50">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-bg-card border border-border-primary text-text-primary rounded hover:bg-bg-secondary transition-colors text-sm"
          >
            Fechar
          </button>
        </div>

      </div>
    </div>
  );
}