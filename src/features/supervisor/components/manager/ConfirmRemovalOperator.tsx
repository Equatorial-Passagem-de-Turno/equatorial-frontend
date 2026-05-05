import { AlertTriangle, X } from "lucide-react";
import { createPortal } from "react-dom";
interface ConfirmRemovalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  titulo: string;
  descricao: string;
  itemNome: string;
}

export function ConfirmRemovalModal({
  isOpen,
  onClose,
  onConfirm,
  titulo,
  descricao,
  itemNome,
}: ConfirmRemovalModalProps) {
  if (!isOpen) return null;

  return createPortal(
    
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[9999] p-4">
      <div className="eq-modal-solid relative w-full max-w-md overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-500 via-rose-500 to-pink-500" />
        {/* Header */}
        <div className="eq-modal-header p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-red-500/10 dark:bg-red-500/20 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-red-500" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-[var(--eq-text-primary)]">
                  {titulo}
                </h2>
              </div>
            </div>
            <button
              onClick={onClose}
              className="eq-control flex h-8 w-8 items-center justify-center rounded-lg p-0 transition-colors hover:bg-[var(--eq-bg-surface-soft)]"
            >
              <X className="h-5 w-5 text-[var(--eq-text-secondary)]" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="eq-modal-body space-y-4 p-6">
          <p className="eq-page-subtitle text-sm">
            {descricao}
          </p>
          
          <div className="p-4 bg-red-500/10 dark:bg-red-500/20 border border-red-500/30 rounded-lg">
            <p className="text-sm font-medium text-red-600 dark:text-red-400">
              {itemNome}
            </p>
          </div>

          <div className="p-3 bg-amber-500/10 dark:bg-amber-500/20 border border-amber-500/30 rounded-lg">
            <p className="text-xs text-amber-700 dark:text-amber-400">
              ⚠️ Esta ação não pode ser desfeita. Todos os dados associados serão permanentemente removidos.
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="eq-modal-footer flex items-center gap-3 p-6">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-3 eq-control rounded-lg font-medium transition-all hover:bg-[var(--eq-bg-surface-soft)]"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 px-4 py-3 bg-red-500 hover:bg-red-600 rounded-lg text-white font-medium transition-all shadow-lg shadow-red-500/20"
          >
            Confirmar Remoção
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
