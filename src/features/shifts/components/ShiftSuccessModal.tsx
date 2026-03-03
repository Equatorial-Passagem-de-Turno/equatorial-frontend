import React from 'react';
import { Mail, Printer, ArrowRight } from 'lucide-react';

interface Props {
  isOpen: boolean;
  operatorEmail: string;
  onPrint: () => void;
  onNavigate: () => void;
}

export const ShiftSuccessModal: React.FC<Props> = ({ isOpen, operatorEmail, onPrint, onNavigate }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-950/50 backdrop-blur-sm animate-fade-in" />
      
      <div className="relative max-w-md w-full p-8 text-center rounded-2xl shadow-2xl animate-slide-up border bg-white border-slate-200 dark:bg-slate-900 dark:border-emerald-500/30">
        <div className="flex justify-center mb-6 relative">
            <div className="absolute inset-0 bg-emerald-500/20 blur-xl rounded-full" />
            <div className="p-5 rounded-full relative z-10 bg-emerald-100 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/50">
                <Mail className="w-12 h-12 text-emerald-600 dark:text-emerald-400" />
            </div>
        </div>

        <h3 className="text-2xl font-bold mb-2 text-slate-900 dark:text-white">Turno Encerrado!</h3>
        <p className="mb-8 text-sm text-slate-600 dark:text-slate-400">
          Relatório enviado para <span className="font-mono text-slate-800 dark:text-slate-300">{operatorEmail}</span>
        </p>

        <div className="space-y-3">
          <button onClick={onPrint} className="w-full py-3.5 rounded-xl border bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100 dark:bg-slate-800 dark:border-slate-600 dark:text-white flex items-center justify-center gap-3">
            <Printer className="w-5 h-5 text-emerald-500" /> Imprimir PDF
          </button>
          <button onClick={onNavigate} className="w-full font-bold py-3.5 rounded-xl bg-emerald-600 text-white hover:bg-emerald-500 flex items-center justify-center gap-2">
            Voltar ao Dashboard <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};