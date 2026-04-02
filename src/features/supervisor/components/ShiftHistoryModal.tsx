import { createPortal } from "react-dom";
import { useState } from "react";
import {
  X,
  Calendar,
  ChevronLeft,
  ChevronRight,
  FileText,
} from "lucide-react";
import { ShiftPendingItemsModal } from "./ShiftPendingModal";

interface Shift {
  id: string;
  operador: string;
  horario: string;
  status: "ativo" | "concluido" | "pendente";
}

interface ShiftHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const turnosData: Record<string, Shift[]> = {
  "2026-02-09": [
    { id: "TUR-0902-A", operador: "BRUNO GOMES FERREIRA", horario: "06:00 - 14:00", status: "concluido" },
    { id: "TUR-0902-B", operador: "MARIA COSTA", horario: "14:00 - 22:00", status: "concluido" },
    { id: "TUR-0902-C", operador: "CARLOS OP.", horario: "22:00 - ...", status: "pendente" },
  ],
};

const mesesPt = [
  "Janeiro","Fevereiro","Março","Abril","Maio","Junho",
  "Julho","Agosto","Setembro","Outubro","Novembro","Dezembro",
];

const diasSemana = ["D", "S", "T", "Q", "Q", "S", "S"];

export function ShiftHistoryModal({ isOpen, onClose }: ShiftHistoryModalProps) {
  const [currentDate, setCurrentDate] = useState(new Date(2026, 1, 9));
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date(2026, 1, 9));
  const [showPendenciasModal, setShowPendenciasModal] = useState(false);
  const [selectedShift, setSelectedShift] = useState<Shift | null>(null);

  if (!isOpen) return null;

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
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2,"0")}-${String(date.getDate()).padStart(2,"0")}`;
  };

  const formatDateDisplay = (date: Date) => {
    return `${String(date.getDate()).padStart(2,"0")} de ${mesesPt[date.getMonth()].toLowerCase()}`;
  };

  const days = getDaysInMonth(currentDate);
  const selectedDateKey = selectedDate ? formatDateKey(selectedDate) : null;
  const turnos = selectedDateKey ? turnosData[selectedDateKey] || [] : [];

  const isToday = (day: number) => {
    const today = new Date(2026, 1, 9);
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

  const handleVisualizarClick = (turno: Shift) => {
    setSelectedShift(turno);
    setShowPendenciasModal(true);
  };

  return createPortal(
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[9999] p-4">
      <div className="bg-theme-panel border border-slate-700 rounded-xl w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">

        {/* HEADER */}
        <div className="p-6 border-b border-slate-700 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-600/10 flex items-center justify-center">
              <Calendar className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-100">
                Histórico de Shifts
              </h2>
              <p className="text-sm text-slate-400">
                Consulte turnos anteriores e status
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-slate-700 hover:bg-slate-600 flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5 text-slate-300" />
          </button>
        </div>

        {/* CONTEÚDO */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-12 gap-6">

            {/* CALENDÁRIO */}
            <div className="col-span-4">
              <div className="bg-slate-700/40 border border-slate-700 rounded-lg p-4">
                <div className="flex items-center justify-between mb-4">
                  <button onClick={previousMonth} className="w-8 h-8 rounded hover:bg-slate-700 flex items-center justify-center">
                    <ChevronLeft className="w-5 h-5 text-slate-400" />
                  </button>
                  <span className="text-sm font-semibold text-slate-200">
                    {mesesPt[currentDate.getMonth()]} {currentDate.getFullYear()}
                  </span>
                  <button onClick={nextMonth} className="w-8 h-8 rounded hover:bg-slate-700 flex items-center justify-center">
                    <ChevronRight className="w-5 h-5 text-slate-400" />
                  </button>
                </div>

                <div className="grid grid-cols-7 gap-1">
                  {diasSemana.map((dia, idx) => (
                    <div key={idx} className="h-8 flex items-center justify-center text-xs text-slate-400">
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
                        className={`h-8 flex items-center justify-center text-sm rounded transition-colors
                          ${
                            isSelected(day)
                              ? "bg-emerald-600 text-white font-bold"
                              : isToday(day)
                              ? "bg-emerald-600/20 text-emerald-400 font-semibold"
                              : "text-slate-300 hover:bg-slate-700"
                          }`}
                      >
                        {day}
                      </button>
                    )
                  )}
                </div>
              </div>
            </div>

            {/* TABELA */}
            <div className="col-span-8">
              <div className="bg-slate-700/40 border border-slate-700 rounded-lg overflow-hidden">
                <div className="p-4 border-b border-slate-700 flex items-center justify-between">
                  <h3 className="font-semibold text-slate-200">
                    {selectedDate
                      ? `Shifts de ${formatDateDisplay(selectedDate)}`
                      : "Selecione uma data"}
                  </h3>
                  <span className="text-xs text-slate-400 bg-slate-700 px-3 py-1 rounded">
                    {turnos.length} registros
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-slate-700 bg-slate-700/50">
                        <th className="px-4 py-3 text-left text-xs text-slate-400 uppercase">Shift / ID</th>
                        <th className="px-4 py-3 text-left text-xs text-slate-400 uppercase">Operador</th>
                        <th className="px-4 py-3 text-left text-xs text-slate-400 uppercase">Horário</th>
                        <th className="px-4 py-3 text-center text-xs text-slate-400 uppercase">Ação</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-700">
                      {turnos.map((turno) => (
                        <tr key={turno.id} className="hover:bg-slate-700/40">
                          <td className="px-4 py-3 text-slate-200 flex items-center gap-2">
                            <FileText className="w-4 h-4 text-slate-400" />
                            {turno.id}
                          </td>
                          <td className="px-4 py-3 text-slate-400">{turno.operador}</td>
                          <td className="px-4 py-3 text-slate-200">{turno.horario}</td>
                          <td className="px-4 py-3 text-center">
                            <button
                              onClick={() => handleVisualizarClick(turno)}
                              className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium rounded"
                            >
                              Visualizar
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

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
          operator={selectedShift.operador}
          shiftId={selectedShift.id}
          date={selectedDate ? formatDateDisplay(selectedDate) : ""}
        />
      )}
    </div>,
    document.body
  );
}