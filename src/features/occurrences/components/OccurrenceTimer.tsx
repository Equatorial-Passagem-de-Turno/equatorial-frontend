import { useState } from 'react';
import { Timer, Clock, PlayCircle, Loader2, Check } from 'lucide-react';
import type { Reminder } from '../types'; // Certifique-se de ter essa interface definida

interface OccurrenceTimerProps {
  reminders?: Reminder[]; // Histórico de lembretes da ocorrência
  onSchedule: (minutes: number, seconds: number) => Promise<void>; // Função do pai
}

export const OccurrenceTimer = ({ reminders = [], onSchedule }: OccurrenceTimerProps) => {
  // 1. Estados Locais (A página pai não precisa saber disso enquanto o usuário digita)
  const [minutes, setMinutes] = useState<number>(15);
  const [seconds, setSeconds] = useState<number>(0);
  const [isScheduling, setIsScheduling] = useState(false);

  // 2. Handler para disparar a ação
  const handleStartTimer = async () => {
    const totalTime = (Number(minutes) || 0) + (Number(seconds) || 0);
    if (totalTime === 0) return;

    setIsScheduling(true);
    try {
      await onSchedule(minutes, seconds);
      // Opcional: Resetar o timer ou manter o último valor usado?
      // Manter o valor costuma ser útil para repetição.
    } catch (error) {
      console.error("Erro ao agendar timer", error);
    } finally {
      setIsScheduling(false);
    }
  };

  return (
    <div className="rounded-2xl p-6 bg-white border border-slate-200 dark:bg-slate-900/50 dark:border-slate-800 shadow-sm">
      
      {/* CABEÇALHO */}
      <div className="flex items-center gap-2 mb-4">
        <div className="p-1.5 bg-indigo-50 dark:bg-indigo-900/30 rounded-lg text-indigo-600 dark:text-indigo-400">
          <Timer size={16} />
        </div>
        <span className="text-sm font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wide">
          Temporizador
        </span>
      </div>

      {/* INTERFACE DO RELÓGIO DIGITAL (INPUTS) */}
      <div className="bg-slate-50 dark:bg-slate-900/50 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 mb-4">
        <div className="flex items-end justify-center gap-2 mb-4">
          
          {/* Input Minutos */}
          <div className="flex flex-col items-center gap-1">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Min</span>
            <input 
              type="number" 
              min="0"
              value={minutes} 
              onChange={e => setMinutes(Number(e.target.value))} 
              className="w-20 h-16 text-center text-3xl font-mono font-bold bg-white dark:bg-slate-950 border-2 border-slate-200 dark:border-slate-700 rounded-2xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all text-slate-800 dark:text-white placeholder-slate-300"
              placeholder="00"
            />
          </div>

          {/* Separador */}
          <div className="h-16 flex items-center pb-1">
            <span className="text-2xl font-bold text-slate-300 dark:text-slate-600">:</span>
          </div>

          {/* Input Segundos */}
          <div className="flex flex-col items-center gap-1">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Seg</span>
            <input 
              type="number"
              min="0" 
              max="59"
              value={seconds} 
              onChange={e => setSeconds(Number(e.target.value))} 
              className="w-20 h-16 text-center text-3xl font-mono font-bold bg-white dark:bg-slate-950 border-2 border-slate-200 dark:border-slate-700 rounded-2xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all text-slate-800 dark:text-white placeholder-slate-300"
              placeholder="00"
            />
          </div>
        </div>

        {/* Botão Iniciar */}
        <button 
          onClick={handleStartTimer} 
          disabled={isScheduling || (minutes === 0 && seconds === 0)} 
          className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 disabled:bg-none disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed disabled:shadow-none text-white font-bold text-sm shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/40 transition-all flex items-center justify-center gap-2 group"
        >
          {isScheduling ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <PlayCircle className="w-4 h-4 group-hover:scale-110 transition-transform" />
          )}
          <span>Iniciar Contagem</span>
        </button>
      </div>

      {/* LISTA DE HISTÓRICO (Reminders ativos/passados) */}
      {reminders && reminders.length > 0 && (
        <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
          <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 pl-1 mt-2">
            Histórico de Timers
          </h4>
          <div className="flex flex-col gap-2 max-h-40 overflow-y-auto pr-1 scrollbar-thin">
            {reminders.map(r => (
              <div 
                key={r.id} 
                className={`
                  flex items-center justify-between p-3 rounded-xl border transition-all
                  ${r.acknowledged 
                    ? 'bg-slate-50 border-slate-100 text-slate-400 dark:bg-slate-900/30 dark:border-slate-800 dark:text-slate-500' 
                    : 'bg-white border-indigo-100 shadow-sm text-indigo-900 dark:bg-indigo-950/20 dark:border-indigo-900/50 dark:text-indigo-200'
                  }
                `}
              >
                <div className="flex items-center gap-3">
                  {r.acknowledged ? (
                    <div className="p-1.5 rounded-full bg-slate-200 dark:bg-slate-800">
                      <Check size={12} className="text-slate-500" />
                    </div>
                  ) : (
                    <div className="p-1.5 rounded-full bg-indigo-100 text-indigo-600 dark:bg-indigo-900 dark:text-indigo-400 relative">
                      <Clock size={12} />
                    </div>
                  )}
                  <div className="flex flex-col">
                    <span className="font-mono font-bold text-sm leading-none">
                      {String(r.minutes).padStart(2, '0')}m {String(r.seconds || 0).padStart(2, '0')}s
                    </span>
                    <span className="text-[10px] opacity-70">
                      {r.acknowledged ? 'Concluído' : 'Em andamento...'}
                    </span>
                  </div>
                </div>
                
                <span className="text-[10px] font-medium opacity-60">
                  {new Date(r.remindAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};