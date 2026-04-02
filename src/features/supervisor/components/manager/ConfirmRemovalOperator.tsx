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
      <div className="bg-white dark:bg-[#1e293b] border border-zinc-200 dark:border-[#334155] rounded-lg w-full max-w-md overflow-hidden shadow-xl">
        {/* Header */}
        <div className="p-6 border-b border-zinc-200 dark:border-[#334155]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-red-500/10 dark:bg-red-500/20 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-red-500" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-zinc-900 dark:text-white">
                  {titulo}
                </h2>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg bg-zinc-100 dark:bg-[#0f172a] hover:bg-zinc-200 dark:hover:bg-[#0f172a]/80 flex items-center justify-center transition-colors"
            >
              <X className="w-5 h-5 text-zinc-600 dark:text-[#94a3b8]" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <p className="text-sm text-zinc-600 dark:text-[#94a3b8]">
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
        <div className="p-6 border-t border-zinc-200 dark:border-[#334155] flex items-center gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-3 bg-white dark:bg-[#0f172a] hover:bg-zinc-50 dark:hover:bg-[#0f172a]/80 border border-zinc-200 dark:border-[#334155] rounded-lg text-zinc-900 dark:text-white font-medium transition-all"
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
