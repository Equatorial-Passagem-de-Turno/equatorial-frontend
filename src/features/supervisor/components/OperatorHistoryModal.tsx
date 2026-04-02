import { createPortal } from "react-dom";
import { useState } from "react";
import { X, Clock, FileText, Calendar } from "lucide-react";
import { SHIFTS_PER_OPERATOR, } from "../mocks/mocks.ts";
import type { Shift } from "../types/index.ts";
import { ShiftPendingItemsModal } from "./ShiftPendingModal";

interface OperatorHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  operatorName: string;
  operatorEmail: string;
  operatorProfile: string;
}

export function OperatorHistoryModal({
  isOpen,
  onClose,
  operatorName,
  operatorEmail,
  operatorProfile,
}: OperatorHistoryModalProps) {
  const [showPendenciasModal, setShowPendenciasModal] = useState(false);
  const [selectedShift, setSelectedShift] = useState<Shift | null>(null);

  if (!isOpen) return null;

  const shifts = SHIFTS_PER_OPERATOR[operatorName] || [];

  const handleVisualizarClick = (shift: Shift) => {
    setSelectedShift(shift);
    setShowPendenciasModal(true);
  };

  return createPortal(
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[9999] p-4">
      <div className="bg-theme-panel border border-border-primary rounded-lg w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">

        {/* Header */}
        <div className="p-6 border-b border-border-primary flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-theme-accent text-white flex items-center justify-center text-lg font-bold">
              {operatorName
                .split(" ")
                .map((n) => n[0])
                .join("")}
            </div>
            <div>
              <h2 className="text-xl font-bold text-text-primary">
                Histórico de Turnos - {operatorName}
              </h2>
              <p className="text-sm text-text-muted">
                {operatorEmail} • {operatorProfile}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-bg-secondary hover:bg-bg-secondary/80 flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5 text-text-muted" />
          </button>
        </div>

        {/* Conteúdo */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="bg-bg-secondary border border-border-primary rounded-lg overflow-hidden">

            <div className="p-4 border-b border-border-primary flex items-center justify-between">
              <h3 className="font-semibold text-text-primary flex items-center gap-2">
                <Calendar className="w-4 h-4 text-theme-accent" />
                Turnos Realizados
              </h3>
              <span className="text-xs text-theme-muted bg-bg-card px-3 py-1 rounded">
                {shifts.length} shifts
              </span>
            </div>

            {shifts.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border-primary bg-bg-card">
                      <th className="px-4 py-3 text-left text-xs font-semibold text-text-muted uppercase">
                        Shift / ID
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-text-muted uppercase">
                        Data
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-text-muted uppercase">
                        Horário
                      </th>
                      <th className="px-4 py-3 text-center text-xs font-semibold text-text-muted uppercase">
                        Status
                      </th>
                      <th className="px-4 py-3 text-center text-xs font-semibold text-text-muted uppercase">
                        Ação
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border-primary">
                    {shifts.map((shift) => (
                      <tr key={shift.id} className="hover:bg-bg-card">
                        <td className="px-4 py-3 flex items-center gap-2">
                          <FileText className="w-4 h-4 text-theme-muted" />
                          {shift.id}
                        </td>
                        <td className="px-4 py-3 text-text-muted">{shift.date}</td>
                        <td className="px-4 py-3 text-text-primary">{shift.time}</td>
                        <td className="px-4 py-3 text-center">
                          {shift.status}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <button
                            onClick={() => handleVisualizarClick(shift)}
                            className="px-3 py-1 bg-theme-accent hover:bg-emerald-400 text-white text-xs rounded"
                          >
                            Visualizar
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-12 text-center">
                <Clock className="w-12 h-12 text-text-muted mx-auto mb-3 opacity-50" />
                <p className="text-text-muted">
                  Nenhum turno encontrado
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {selectedShift && (
        <ShiftPendingItemsModal
          isOpen={showPendenciasModal}
          onClose={() => {
            setShowPendenciasModal(false);
            setSelectedShift(null);
          }}
          operator={operatorName}
          shiftId={selectedShift.id}
          date={selectedShift.date}
        />
      )}
    </div>,
    document.body
  );
}