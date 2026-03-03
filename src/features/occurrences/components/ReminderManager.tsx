import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useOccurrenceStore } from '../stores/useOccurrenceStore';
// Importando os ícones da UI nova
import { BellRing, Eye, X } from 'lucide-react';

export default function ReminderManager() {
  const navigate = useNavigate();
  const occurrences = useOccurrenceStore(state => state.occurrences);
  const updateOccurrence = useOccurrenceStore.getState().updateOccurrence;

  const timersRef = useRef<Record<string, number>>({});
  const [active, setActive] = useState<{ occId: string; reminderId: string } | null>(null);
  const [modalData, setModalData] = useState<{ title?: string; id?: string } | null>(null);

  // --- LÓGICA DE AGENDAMENTO (Mantida igual) ---
  const schedule = (occId: string, r: any) => {
    const now = Date.now();
    const remindAt = new Date(r.remindAt).getTime();
    const delay = remindAt - now;
    if (delay <= 0) return; // já passou
    if (timersRef.current[r.id]) return; // já agendado

    const t = window.setTimeout(() => {
      // Dispara o modal e tenta notificação nativa do navegador
      setModalData({ title: r.title || 'Sem título', id: occId });
      setActive({ occId, reminderId: r.id });

      try {
        if ('Notification' in window && Notification.permission === 'granted') {
          new Notification(`Lembrete: ${occId}`, { body: r.title || '' });
        } else if ('Notification' in window && Notification.permission !== 'denied') {
          Notification.requestPermission().then(p => {
            if (p === 'granted') new Notification(`Lembrete: ${occId}`, { body: r.title || '' });
          });
        }
      } catch (e) {
        // ignore errors
      }

      // Marca como "reconhecido" na store para não disparar de novo ao recarregar
      updateOccurrence(occId, {
        reminders: (useOccurrenceStore.getState().occurrences.find(o => o.id === occId)?.reminders ?? [])
          .map((rr: any) => rr.id === r.id ? { ...rr, acknowledged: true } : rr)
      });

      // Remove do ref de timers
      delete timersRef.current[r.id];
    }, delay);

    timersRef.current[r.id] = t as unknown as number;
  };

  // --- EFFECT: Monitora mudanças na store para agendar novos timers ---
  useEffect(() => {
    const allReminderIds = new Set<string>();
    occurrences.forEach(o => (o.reminders || []).forEach((r: any) => allReminderIds.add(r.id)));
    
    // Limpa timers órfãos
    Object.keys(timersRef.current).forEach(id => {
      if (!allReminderIds.has(id)) {
        clearTimeout(timersRef.current[id]);
        delete timersRef.current[id];
      }
    });

    // Agenda novos
    occurrences.forEach(o => {
      (o.reminders || []).forEach((r: any) => {
        if (!r.acknowledged) {
          const toSchedule = { ...r, title: o.title };
          schedule(o.id, toSchedule);
        }
      });
    });

    return () => {
      Object.values(timersRef.current).forEach(t => clearTimeout(t));
      timersRef.current = {};
    };
  }, [occurrences]);

  // --- AÇÕES DO MODAL ---
  const closeModal = (goToOccurrence = false) => {
    if (active) {
      if (goToOccurrence) {
        // Navega para a ocorrência
        navigate(`/occurrences/${encodeURIComponent(active.occId)}`);
        // Rola para o topo para garantir visibilidade
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
      setActive(null);
      setModalData(null);
    }
  };

  if (!modalData) return null;

  // --- UI PREMIUM ---
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      {/* Backdrop com Blur e Fade-in */}
      <div 
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity animate-in fade-in duration-300" 
        onClick={() => closeModal(false)}
      />

      {/* Card do Modal */}
      <div className="relative w-full max-w-sm bg-white dark:bg-slate-900 rounded-3xl shadow-2xl overflow-hidden border border-slate-100 dark:border-slate-800 transform transition-all animate-in zoom-in-95 slide-in-from-bottom-4 duration-300">
        
        {/* Botão X para fechar rápido */}
        <button 
          onClick={() => closeModal(false)}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 z-10 transition-colors"
        >
          <X size={20} />
        </button>

        {/* Elemento Decorativo de Topo */}
        <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-indigo-50/80 to-transparent dark:from-indigo-950/30 pointer-events-none" />

        <div className="relative p-8 flex flex-col items-center text-center">
          
          {/* Ícone Animado (Sino Tocando) */}
          <div className="mb-6 relative">
            <div className="absolute inset-0 bg-indigo-500 rounded-full opacity-20 animate-ping duration-1000" />
            <div className="absolute inset-0 bg-indigo-500 rounded-full opacity-10 animate-ping delay-150 duration-1000" />
            
            <div className="relative h-20 w-20 bg-indigo-100 dark:bg-indigo-900/50 rounded-full flex items-center justify-center text-indigo-600 dark:text-indigo-400 border-4 border-white dark:border-slate-900 shadow-xl">
              <BellRing size={32} className="animate-bounce" />
            </div>
          </div>

          {/* Títulos */}
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-2 tracking-tight">
            Lembrete Ativo!
          </h2>
          
          <p className="text-slate-500 dark:text-slate-400 text-sm mb-6">
            O tempo programado para esta ocorrência acabou.
          </p>

          {/* Card da Ocorrência em Destaque */}
          <div className="w-full bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-4 border border-slate-100 dark:border-slate-700/50 mb-8">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">
              {modalData.id}
            </span>
            <p className="font-semibold text-slate-700 dark:text-slate-200 line-clamp-2">
              {modalData.title}
            </p>
          </div>

          {/* Ações */}
          <div className="w-full flex flex-col gap-3">
            <button 
              onClick={() => closeModal(true)}
              className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 hover:-translate-y-0.5 transition-all duration-200 flex items-center justify-center gap-2"
            >
              <Eye size={18} /> Ver Agora
            </button>
            
            <button 
              onClick={() => closeModal(false)}
              className="w-full py-3 rounded-xl text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 text-sm font-medium transition-colors"
            >
              Fechar
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}