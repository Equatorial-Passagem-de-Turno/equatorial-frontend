import { createPortal } from "react-dom";
import { useEffect, useState } from "react";
import {
  X,
  Calendar,
  ChevronLeft,
  ChevronRight,
  FileText,
  Search,
  Eye,
} from "lucide-react";
import { api } from "@/services/api";
import { ShiftDetailModal } from "@/features/shifts/components/history/ShiftDetailModal";
import type { HistoryItem } from "@/features/shifts/components/history/HistoryTable";

interface Shift {
  shiftId?: number;
  id: string;
  operador: string;
  horario: string;
  tipo?: string;
  workedDuration?: string;
  status: "ativo" | "concluido" | "pendente";
}

interface ShiftHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const mesesPt = [
  "Janeiro", "Fevereiro", "Marco", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
];

const diasSemana = ["D", "S", "T", "Q", "Q", "S", "S"];

export function ShiftHistoryModal({ isOpen, onClose }: ShiftHistoryModalProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
  const [turnos, setTurnos] = useState<Shift[]>([]);
  const [operatorSearchTerm, setOperatorSearchTerm] = useState("");
  const [selectedShiftForDetail, setSelectedShiftForDetail] = useState<HistoryItem | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days: (number | null)[] = [];
    for (let i = 0; i < startingDayOfWeek; i++) days.push(null);
    for (let i = 1; i <= daysInMonth; i++) days.push(i);

    return days;
  };

  const previousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  };

  const handleDayClick = (day: number) => {
    setSelectedDate(new Date(currentDate.getFullYear(), currentDate.getMonth(), day));
  };

  const formatDateKey = (date: Date) => {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
  };

  const formatDateDisplay = (date: Date) => {
    return `${String(date.getDate()).padStart(2, "0")} de ${mesesPt[date.getMonth()].toLowerCase()}`;
  };

  const days = getDaysInMonth(currentDate);
  const selectedDateKey = selectedDate ? formatDateKey(selectedDate) : null;

  useEffect(() => {
    if (!isOpen || !selectedDateKey) return;

    const load = async () => {
      setIsLoading(true);
      setTurnos([]);
      try {
        const response = await api.get<Array<{ shift_id?: number; id: string; operador: string; horario: string; tipo?: string; workedDuration?: string; tempo_trabalhado?: string; status: string }>>(`/shifts/by-date?date=${selectedDateKey}`);
        const mapped: Shift[] = (response.data || []).map((item) => ({
          shiftId: item.shift_id,
          id: item.id,
          operador: item.operador,
          horario: item.horario,
          tipo: item.tipo || "--",
          workedDuration: item.workedDuration || item.tempo_trabalhado || "--",
          status: String(item.status).toLowerCase().includes("aberto") ? "ativo" : "concluido",
        }));
        setTurnos(mapped);
      } catch {
        setTurnos([]);
      } finally {
        setIsLoading(false);
      }
    };

    void load();
  }, [isOpen, selectedDateKey]);

  const isToday = (day: number) => {
    const today = new Date();
    return (
      day === today.getDate() &&
      currentDate.getMonth() === today.getMonth() &&
      currentDate.getFullYear() === today.getFullYear()
    );
  };

  const isSelected = (day: number) => {
    if (!selectedDate) return false;
    return (
      day === selectedDate.getDate() &&
      currentDate.getMonth() === selectedDate.getMonth() &&
      currentDate.getFullYear() === selectedDate.getFullYear()
    );
  };

  if (!isOpen) return null;

  const normalizedSearch = operatorSearchTerm.trim().toLowerCase();
  const visibleTurnos = turnos.filter((turno) => {
    if (!normalizedSearch) return true;
    return (
      turno.operador.toLowerCase().includes(normalizedSearch) ||
      turno.id.toLowerCase().includes(normalizedSearch) ||
      String(turno.tipo || '').toLowerCase().includes(normalizedSearch)
    );
  });

  const handleOpenShiftDetail = (turno: Shift) => {
    const parsedFromDisplayId = Number(String(turno.id ?? "").replace(/\D/g, ""));
    const normalizedShiftId = Number(turno.shiftId ?? parsedFromDisplayId);

    setSelectedShiftForDetail({
      shiftId: Number.isFinite(normalizedShiftId) ? normalizedShiftId : 0,
      id: String(turno.id ?? ""),
      operador: String(turno.operador ?? "Desconhecido"),
      horario: String(turno.horario ?? "--:-- - --:--"),
      tipo: String(turno.tipo ?? "--"),
      status: turno.status === "ativo" ? "Aberto" : "Fechado",
      workedDuration: String(turno.workedDuration ?? "--"),
    });

    setIsDetailModalOpen(true);
  };

  return createPortal(
    <>
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[9999] p-4">
        <div className="eq-modal-solid relative flex max-h-[90vh] w-full max-w-6xl flex-col overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-400 via-teal-500 to-emerald-600" />
        <div className="eq-modal-header flex items-center justify-between p-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-600/10 flex items-center justify-center">
              <Calendar className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-[var(--eq-text-primary)]">Historico de Shifts</h2>
              <p className="eq-page-subtitle text-sm">Consulte turnos anteriores e status</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="eq-control flex h-8 w-8 items-center justify-center rounded-lg p-0 transition-colors hover:bg-[var(--eq-bg-surface-soft)]"
          >
            <X className="h-5 w-5 text-[var(--eq-text-secondary)]" />
          </button>
        </div>

        <div className="eq-modal-body flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-12 gap-6">
            <div className="col-span-4">
              <div className="eq-surface-soft p-4">
                <div className="flex items-center justify-between mb-4">
                  <button onClick={previousMonth} className="flex h-8 w-8 items-center justify-center rounded hover:bg-[var(--eq-bg-surface)]">
                    <ChevronLeft className="h-5 w-5 text-[var(--eq-text-muted)]" />
                  </button>
                  <span className="text-sm font-semibold text-[var(--eq-text-primary)]">
                    {mesesPt[currentDate.getMonth()]} {currentDate.getFullYear()}
                  </span>
                  <button onClick={nextMonth} className="flex h-8 w-8 items-center justify-center rounded hover:bg-[var(--eq-bg-surface)]">
                    <ChevronRight className="h-5 w-5 text-[var(--eq-text-muted)]" />
                  </button>
                </div>

                <div className="grid grid-cols-7 gap-1">
                  {diasSemana.map((dia, idx) => (
                    <div key={idx} className="flex h-8 items-center justify-center text-xs text-[var(--eq-text-muted)]">
                      {dia}
                    </div>
                  ))}

                  {days.map((day, idx) =>
                    day === null ? (
                      <div key={idx} className="h-8" />
                    ) : (
                      <button
                        key={idx}
                        onClick={() => handleDayClick(day)}
                        className={`h-8 flex items-center justify-center text-sm rounded transition-colors ${
                          isSelected(day)
                            ? "bg-emerald-600 text-white font-bold"
                            : isToday(day)
                              ? "bg-emerald-600/20 text-emerald-400 font-semibold"
                              : "text-[var(--eq-text-secondary)] hover:bg-[var(--eq-bg-surface)]"
                        }`}
                      >
                        {day}
                      </button>
                    )
                  )}
                </div>
              </div>
            </div>

            <div className="col-span-8">
              <div className="eq-surface-soft overflow-hidden">
                <div className="flex items-center justify-between border-b border-[var(--eq-border)] p-4">
                  <h3 className="font-semibold text-[var(--eq-text-primary)]">
                    {selectedDate ? `Historico de turnos de todos os operadores em ${formatDateDisplay(selectedDate)}` : "Selecione uma data"}
                  </h3>
                  <span className="eq-id-chip px-3 py-1">{visibleTurnos.length} registros</span>
                </div>

                <div className="border-b border-[var(--eq-border)] bg-[var(--eq-bg-surface-soft)] p-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--eq-text-muted)]" />
                    <input
                      type="text"
                      value={operatorSearchTerm}
                      onChange={(event) => setOperatorSearchTerm(event.target.value)}
                      placeholder="Filtrar por operador, turno ou perfil"
                      className="eq-control w-full py-2 pl-9 pr-3 text-sm placeholder:text-[var(--eq-text-muted)] focus:ring-2 focus:ring-emerald-500/40"
                    />
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-[var(--eq-border)] bg-[var(--eq-bg-surface-soft)]">
                        <th className="px-4 py-3 text-left text-xs uppercase text-[var(--eq-text-muted)]">Shift / ID</th>
                        <th className="px-4 py-3 text-left text-xs uppercase text-[var(--eq-text-muted)]">Operador</th>
                        <th className="px-4 py-3 text-left text-xs uppercase text-[var(--eq-text-muted)]">Perfil</th>
                        <th className="px-4 py-3 text-left text-xs uppercase text-[var(--eq-text-muted)]">Horario</th>
                        <th className="px-4 py-3 text-left text-xs uppercase text-[var(--eq-text-muted)]">Total Trabalhado</th>
                        <th className="px-4 py-3 text-left text-xs uppercase text-[var(--eq-text-muted)]">Status</th>
                        <th className="px-4 py-3 text-right text-xs uppercase text-[var(--eq-text-muted)]">Acao</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[var(--eq-border)]">
                      {isLoading && (
                        <tr>
                          <td className="px-4 py-3 text-[var(--eq-text-muted)]" colSpan={7}>Carregando...</td>
                        </tr>
                      )}

                      {!isLoading && visibleTurnos.map((turno) => (
                        <tr key={turno.id} className="hover:bg-[var(--eq-bg-surface)]">
                          <td className="flex items-center gap-2 px-4 py-3 text-[var(--eq-text-primary)]">
                            <FileText className="h-4 w-4 text-[var(--eq-text-muted)]" />
                            {turno.id}
                          </td>
                          <td className="px-4 py-3 text-[var(--eq-text-muted)]">{turno.operador}</td>
                          <td className="px-4 py-3 text-[var(--eq-text-secondary)]">{turno.tipo || "--"}</td>
                          <td className="px-4 py-3 text-[var(--eq-text-primary)]">{turno.horario}</td>
                          <td className="px-4 py-3 text-[var(--eq-text-secondary)]">{turno.workedDuration || "--"}</td>
                          <td className="px-4 py-3">
                            <span className={`inline-flex rounded border px-2 py-1 text-xs font-semibold ${turno.status === 'ativo' ? 'eq-status-success' : 'eq-status-open'}`}>
                              {turno.status === 'ativo' ? 'Aberto' : 'Fechado'}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-right">
                            <button
                              onClick={() => handleOpenShiftDetail(turno)}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded border border-emerald-500/30 bg-emerald-500/10 text-emerald-300 text-xs font-semibold hover:bg-emerald-500/20 transition-colors"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              Detalhar
                            </button>
                          </td>
                        </tr>
                      ))}

                      {!isLoading && visibleTurnos.length === 0 && (
                        <tr>
                          <td className="px-4 py-4 text-[var(--eq-text-muted)]" colSpan={7}>
                            Nenhum turno encontrado para o filtro informado.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      </div>
      <ShiftDetailModal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        shiftData={selectedShiftForDetail}
      />
    </>,
    document.body
  );
}
