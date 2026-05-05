import { createPortal } from "react-dom";
import { useEffect, useState } from "react";
import { X, Clock, FileText, Calendar } from "lucide-react";
import { api } from "@/services/api";
import type { Shift } from "../types/index.ts";

interface OperatorHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  operatorId: string;
  operatorName: string;
  operatorEmail: string;
  operatorProfile: string;
}

export function OperatorHistoryModal({
  isOpen,
  onClose,
  operatorId,
  operatorName,
  operatorEmail,
  operatorProfile,
}: OperatorHistoryModalProps) {
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!isOpen || !operatorId) return;

    const load = async () => {
      setIsLoading(true);
      try {
        const response = await api.get<Array<{ id: string; date: string; time: string; status: string }>>(`/shifts/by-user/${operatorId}`);
        const mapped: Shift[] = (response.data || []).map((shift) => ({
          id: shift.id,
          date: shift.date,
          time: shift.time,
          status: shift.status === 'in_progress' ? 'ativo' : shift.status === 'finished' ? 'concluido' : 'pendente',
        }));
        setShifts(mapped);
      } catch {
        setShifts([]);
      } finally {
        setIsLoading(false);
      }
    };

    void load();
  }, [isOpen, operatorId]);

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[9999] p-4">
      <div className="eq-modal-solid relative flex max-h-[90vh] w-full max-w-4xl flex-col overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-400 via-teal-500 to-emerald-600" />

        {/* Header */}
        <div className="eq-modal-header flex items-center justify-between p-6">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-r from-emerald-500 to-teal-600 text-lg font-bold text-white shadow-lg shadow-emerald-500/20">
              {operatorName
                .split(" ")
                .map((n) => n[0])
                .join("")}
            </div>
            <div>
              <h2 className="text-xl font-bold text-[var(--eq-text-primary)]">
                Histórico de Turnos - {operatorName}
              </h2>
              <p className="eq-page-subtitle text-sm">
                {operatorEmail} • {operatorProfile}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="eq-control flex h-8 w-8 items-center justify-center rounded-lg p-0 transition-colors hover:bg-[var(--eq-bg-surface-soft)]"
          >
            <X className="h-5 w-5 text-[var(--eq-text-secondary)]" />
          </button>
        </div>

        {/* Conteúdo */}
        <div className="eq-modal-body flex-1 overflow-y-auto p-6">
          <div className="eq-surface-soft overflow-hidden">

            <div className="flex items-center justify-between border-b border-[var(--eq-border)] p-4">
              <h3 className="flex items-center gap-2 font-semibold text-[var(--eq-text-primary)]">
                <Calendar className="w-4 h-4 text-theme-accent" />
                Turnos Realizados
              </h3>
              <span className="eq-id-chip px-3 py-1">
                {shifts.length} shifts
              </span>
            </div>

            {isLoading ? (
              <div className="p-12 text-center">
                <Clock className="mx-auto mb-3 h-12 w-12 text-[var(--eq-text-muted)] opacity-50" />
                <p className="text-[var(--eq-text-muted)]">
                  Carregando histórico...
                </p>
              </div>
            ) : shifts.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-[var(--eq-border)] bg-[var(--eq-bg-surface-soft)]">
                      <th className="px-4 py-3 text-left text-xs font-semibold text-[var(--eq-text-muted)] uppercase">
                        Shift / ID
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-[var(--eq-text-muted)] uppercase">
                        Data
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-[var(--eq-text-muted)] uppercase">
                        Horário
                      </th>
                      <th className="px-4 py-3 text-center text-xs font-semibold text-[var(--eq-text-muted)] uppercase">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--eq-border)]">
                    {shifts.map((shift) => (
                      <tr key={shift.id} className="hover:bg-[var(--eq-bg-surface-soft)]">
                        <td className="px-4 py-3 flex items-center gap-2">
                          <FileText className="w-4 h-4 text-[var(--eq-text-muted)]" />
                          {shift.id}
                        </td>
                        <td className="px-4 py-3 text-[var(--eq-text-muted)]">{shift.date}</td>
                        <td className="px-4 py-3 text-[var(--eq-text-primary)]">{shift.time}</td>
                        <td className="px-4 py-3 text-center">
                          {shift.status}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-12 text-center">
                <Clock className="mx-auto mb-3 h-12 w-12 text-[var(--eq-text-muted)] opacity-50" />
                <p className="text-[var(--eq-text-muted)]">
                  Nenhum turno encontrado
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

    </div>,
    document.body
  );
}