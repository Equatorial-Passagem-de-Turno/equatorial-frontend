import { useState } from 'react';
import { Bell, Link as LinkIcon, Save, Trash2, Loader2, FileText } from 'lucide-react';
import { OccurrenceReportPrintView } from '../../occurrences/components/OccurrenceReportPrintView'; // Verifique o caminho
import type { Occurrence } from '../types';

interface OccurrenceActionsProps {
  occurrence: Occurrence;
  userEmail?: string;
  onLinkOs: (osNumber: string) => Promise<void>;
  onUnlinkOs: () => Promise<void>;
  onNotifySupervisor: () => void;
}

export const OccurrenceActions = ({ 
  occurrence, 
  userEmail,
  onLinkOs, 
  onUnlinkOs, 
  onNotifySupervisor 
}: OccurrenceActionsProps) => {
  const [showOsForm, setShowOsForm] = useState(false);
  const [osInput, setOsInput] = useState('');
  const [isLinking, setIsLinking] = useState(false);

  const handleSaveOs = async () => {
    if (!osInput.trim()) return;
    setIsLinking(true);
    try {
      await onLinkOs(osInput.trim());
      setShowOsForm(false);
      setOsInput('');
    } finally {
      setIsLinking(false);
    }
  };

  return (
    <div className="rounded-2xl p-6 bg-white border border-slate-200 dark:bg-slate-900/50 dark:border-slate-800 shadow-sm">
      <h3 className="text-lg font-semibold mb-4 text-slate-900 dark:text-white">Ações Rápidas</h3>
      <div className="space-y-3">
        
        {/* BOTÃO NOTIFICAR */}
        <button 
          onClick={onNotifySupervisor} 
          className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-400 hover:to-indigo-500 text-white font-bold text-sm shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40 hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2"
        >
          <Bell className="w-4 h-4" /> 
          <span>Notificar Supervisor</span>
        </button>

        {/* ÁREA DE VINCULAR OS */}
        {!occurrence.linkValue ? (
          <button onClick={() => setShowOsForm(!showOsForm)} className="text-black w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium bg-slate-50 dark:bg-slate-800 dark:text-white hover:bg-slate-100 dark:hover:bg-slate-700">
            <LinkIcon className="w-4 h-4" /> Vincular OS
          </button>
        ) : (
          <div className="group flex items-center justify-between p-3 pl-4 bg-white dark:bg-slate-900/50 rounded-xl border border-emerald-100 dark:border-emerald-900/30 shadow-sm hover:border-emerald-300 dark:hover:border-emerald-700/50 transition-all duration-300 animate-in slide-in-from-top-2">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400">
                <LinkIcon size={18} strokeWidth={2.5} />
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider leading-none mb-0.5">OS Vinculada</span>
                <span className="font-mono font-bold text-slate-700 dark:text-slate-200 text-sm">{occurrence.linkValue}</span>
              </div>
            </div>
            <button onClick={onUnlinkOs} className="p-2.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-all">
              <Trash2 size={18} />
            </button>
          </div>
        )}

        {/* FORMULÁRIO OS */}
        {showOsForm && !occurrence.linkValue && (
          <div className="mt-4 space-y-3 animate-in slide-in-from-top-2 duration-200">
            <input 
              value={osInput} 
              onChange={(e) => setOsInput(e.target.value)} 
              placeholder="Digite o Nº da OS" 
              className="w-full rounded-xl px-4 py-3 bg-white border border-slate-300 dark:bg-slate-950 dark:border-slate-700 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all" 
            />
            <button 
              onClick={handleSaveOs} 
              disabled={isLinking || !osInput.trim()} 
              className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 disabled:bg-slate-200 disabled:text-slate-400 disabled:shadow-none text-white font-bold text-sm shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/40 hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2"
            >
              {isLinking ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              <span>Salvar Vínculo</span>
            </button>
          </div>
        )}

        {/* BOTÃO RELATÓRIO PDF */}
        <button 
          onClick={() => window.print()} 
          className="w-full py-3 rounded-xl bg-gradient-to-r from-slate-700 to-slate-900 hover:from-slate-600 hover:to-slate-800 text-white font-bold text-sm shadow-lg shadow-slate-900/20 hover:shadow-slate-900/40 hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2"
        >
          <FileText className="w-4 h-4" /> 
          <span>Relatório PDF</span>
        </button>
        
        {/* Componente oculto para impressão */}
        <OccurrenceReportPrintView occurrence={occurrence} operatorEmail={userEmail} />
      </div>
    </div>
  );
};