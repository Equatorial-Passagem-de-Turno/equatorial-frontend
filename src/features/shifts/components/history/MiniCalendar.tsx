import React from 'react';
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface Props {
  selectedDate: Date;
  onSelectDate: (date: Date) => void;
  markedDates: Date[]; // Datas que possuem turnos (para mostrar a bolinha/marcador)
}

export const MiniCalendar: React.FC<Props> = ({ selectedDate, onSelectDate, markedDates }) => {
  const [currentMonth, setCurrentMonth] = React.useState(new Date());

  const days = eachDayOfInterval({
    start: startOfWeek(startOfMonth(currentMonth)),
    end: endOfWeek(endOfMonth(currentMonth))
  });

  const hasShift = (date: Date) => markedDates.some(d => isSameDay(d, date));

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 p-4 shadow-sm">
      {/* Header do Calendário */}
      <div className="flex items-center justify-between mb-4">
        <button onClick={() => setCurrentMonth(subMonths(currentMonth, 1))} className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full">
            <ChevronLeft className="w-5 h-5 text-slate-500" />
        </button>
        <span className="font-bold text-slate-700 dark:text-slate-200 capitalize">
            {format(currentMonth, 'MMMM yyyy', { locale: ptBR })}
        </span>
        <button onClick={() => setCurrentMonth(addMonths(currentMonth, 1))} className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full">
            <ChevronRight className="w-5 h-5 text-slate-500" />
        </button>
      </div>

      {/* Grid de Dias */}
      <div className="grid grid-cols-7 gap-1 text-center">
        {['D', 'S', 'T', 'Q', 'Q', 'S', 'S'].map((day, dayIndex) => (
          <div key={`${day}-${dayIndex}`} className="text-xs font-bold text-slate-400 mb-2">{day}</div>
        ))}
        
        {days.map((day, idx) => {
          const isSelected = isSameDay(day, selectedDate);
          const isCurrentMonth = isSameMonth(day, currentMonth);
          const active = hasShift(day);

          return (
            <button
              key={idx}
              onClick={() => onSelectDate(day)}
              className={`
                relative h-9 w-9 rounded-lg flex items-center justify-center text-sm transition-all
                ${!isCurrentMonth ? 'text-slate-300 dark:text-slate-700' : 'text-slate-700 dark:text-slate-300'}
                ${isSelected 
                  ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-500/30 font-bold' 
                  : 'hover:bg-slate-100 dark:hover:bg-slate-800'}
              `}
            >
              {format(day, 'd')}
              
              {/* Marcador se houver turno (como o ícone de bookmark da imagem original) */}
              {active && !isSelected && (
                <div className="absolute bottom-1">
                   <div className="w-1 h-1 rounded-full bg-emerald-500" />
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};