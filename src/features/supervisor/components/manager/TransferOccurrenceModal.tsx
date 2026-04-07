import { useState, useEffect } from "react";
import { X, ArrowRightLeft, User } from "lucide-react";
import { createPortal } from "react-dom";
import type { Occurrence } from "../../types/index";
import { useSupervisorStore } from "../../stores/useSupervisorStore";
import { showWarningModal } from "@/shared/ui/feedbackModal";

interface TransferOccurrenceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTransfer: (updatedOccurrence: Occurrence) => void;
  occurrence: Occurrence;
}

export function TransferOccurrenceModal({
  isOpen,
  onClose,
  onTransfer,
  occurrence,
}: TransferOccurrenceModalProps) {
  const operators = useSupervisorStore((state) => state.operators);
  const [selectedOperator, setSelectedOperator] = useState("");
  const [reason, setReason] = useState("");

  useEffect(() => {
    setSelectedOperator("");
    setReason("");
  }, [occurrence]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedOperator) {
      void showWarningModal("Selecione um operador.");
      return;
    }
    if (!reason.trim()) {
      void showWarningModal("Informe o motivo da transferência.");
      return;
    }

    const operador = operators.find((o) => o.id === selectedOperator);

    if (!operador) return;

    onTransfer({
      ...occurrence,
      operator: operador.name,
      operatorId: operador.id,
      status: "transferida",
    });
  };

  return createPortal(
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[9999] p-4">
      <div className="bg-white dark:bg-[#1e293b] border border-zinc-200 dark:border-[#334155] rounded-xl w-full max-w-xl overflow-hidden flex flex-col shadow-2xl">
        {/* HEADER */}

        <div className="p-6 border-b border-zinc-200 dark:border-[#334155] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-orange-500/10 dark:bg-orange-500/20 flex items-center justify-center">
              <ArrowRightLeft className="w-5 h-5 text-orange-500" />
            </div>

            <div>
              <h2 className="text-xl font-bold text-zinc-900 dark:text-white">
                Transferir Ocorrência
              </h2>

              <p className="text-sm text-zinc-600 dark:text-[#94a3b8]">
                Redirecione a ocorrência para outro operador
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-zinc-100 dark:bg-[#0f172a] hover:bg-zinc-200 dark:hover:bg-[#0f172a]/80 flex items-center justify-center"
          >
            <X className="w-5 h-5 text-zinc-600 dark:text-[#94a3b8]" />
          </button>
        </div>

        {/* BODY */}

        <div className="p-6">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* OPERADOR */}

            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <User className="w-4 h-4 text-orange-500" />
                Novo Operador
              </label>

              <select
                value={selectedOperator}
                onChange={(e) => setSelectedOperator(e.target.value)}
                className="w-full px-4 py-3 bg-white dark:bg-[#0f172a] border border-zinc-200 dark:border-[#334155] rounded-lg"
              >
                <option value="">Selecione um operador</option>

                {operators.map((op) => (
                  <option key={op.id} value={op.id}>
                    {op.name} — {op.profile}
                  </option>
                ))}
              </select>
            </div>

            {/* MOTIVO */}

            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-900 dark:text-white">
                Motivo da transferência *
              </label>

              <textarea
                rows={3}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Explique o motivo da transferência..."
                className="w-full px-4 py-3 bg-white dark:bg-[#0f172a] border border-zinc-200 dark:border-[#334155] rounded-lg text-zinc-900 dark:text-white"
              />
            </div>

            {/* ACTIONS */}

            <div className="flex gap-3 pt-4 border-t border-zinc-200 dark:border-[#334155]">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-3 border rounded-lg"
              >
                Cancelar
              </button>

              <button
                type="submit"
                className="flex-1 px-4 py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-medium"
              >
                Transferir
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>,
    document.body,
  );
}
