import { useState, useEffect } from 'react';
import { Calendar } from 'lucide-react';

interface ShiftTimerProps {
  shiftStartTime?: Date;
  shiftDurationHours?: number;
}

export const ShiftTimer = ({ shiftStartTime, shiftDurationHours = 8 }: ShiftTimerProps) => {
  const [timeState, setTimeState] = useState({
    hours: '00',
    minutes: '00',
    seconds: '00',
    dateString: '',
  });

  useEffect(() => {
    const updateTimer = () => {
      const now = new Date();
      
      // Formatação de Tempo
      const hours = String(now.getHours()).padStart(2, '0');
      const minutes = String(now.getMinutes()).padStart(2, '0');
      const seconds = String(now.getSeconds()).padStart(2, '0');

      // Formatação de Data (Ex: Quinta, 04 de Dezembro)
      const dateString = new Intl.DateTimeFormat('pt-BR', {
        weekday: 'long',
        day: 'numeric',
        month: 'long'
      }).format(now);

      setTimeState({ hours, minutes, seconds, dateString });
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [shiftStartTime, shiftDurationHours]);

  return (
    <div className="group relative overflow-hidden rounded-3xl transition-all duration-300
      /* Light Mode Base */
      bg-white border border-slate-200 shadow-lg shadow-slate-200/50
      /* Dark Mode Base */
      dark:bg-slate-900 dark:border-slate-800 dark:shadow-none
    ">
      
      {/* Efeito de brilho de fundo (Gradient Glow) */}
      <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 -mb-4 -ml-4 w-24 h-24 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative p-6 sm:p-8 flex flex-col items-center justify-center space-y-6">

        {/* Display Principal do Relógio */}
        <div className="flex items-baseline gap-1 sm:gap-2 font-mono select-none">
          {/* Horas : Minutos */}
          <div className="flex items-baseline text-slate-900 dark:text-white transition-colors duration-300">
            <span className="text-5xl sm:text-7xl font-bold tracking-tighter tabular-nums">
              {timeState.hours}
            </span>
            <span className="text-5xl sm:text-7xl font-bold text-slate-300 dark:text-slate-700 animate-pulse pb-2">
              :
            </span>
            <span className="text-5xl sm:text-7xl font-bold tracking-tighter tabular-nums">
              {timeState.minutes}
            </span>
          </div>

          {/* Segundos (Menor e mais suave) */}
          <div className="text-2xl sm:text-3xl font-medium text-slate-400 dark:text-slate-500 tabular-nums self-end pb-1 sm:pb-2 pl-1">
             {timeState.seconds}
          </div>
        </div>

        {/* Rodapé: Data */}
        <div className="w-full border-t border-slate-100 dark:border-slate-800/50 pt-4">
          <div className="flex items-center justify-center gap-2 text-slate-500 dark:text-slate-400">
            <Calendar className="w-4 h-4" />
            <span className="text-sm font-medium capitalize">
              {timeState.dateString}
            </span>
          </div>
        </div>

      </div>
    </div>
  );
};