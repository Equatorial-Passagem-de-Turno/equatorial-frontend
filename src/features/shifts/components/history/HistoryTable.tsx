import React from 'react';
import { FileText } from 'lucide-react';

export interface HistoryItem {
  id: string;
  operador: string;
  horario: string;
  tipo: string;
  status: 'Fechado' | 'Aberto';
}

interface Props {
  data: HistoryItem[];
  isLoading?: boolean;
  onViewClick: (item: HistoryItem) => void; // <--- NOVA PROP
}

export const HistoryTable: React.FC<Props> = ({ data, isLoading, onViewClick }) => {
  if (isLoading) return <div className="p-8 text-center text-slate-400">Carregando dados...</div>;
  if (data.length === 0) return <div className="p-8 text-center text-slate-400">Nenhum turno encontrado nesta data.</div>;

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 dark:border-slate-700">
      <table className="w-full text-left text-sm">
        <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 uppercase text-xs font-bold">
          <tr>
            <th className="p-3">Turno / ID</th>
            <th className="p-3">Operador</th>
            <th className="p-3">Horário</th>
            <th className="p-3 text-center">Farol</th>
            <th className="p-3 text-right">Ação</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 dark:divide-slate-800 bg-white dark:bg-slate-900">
          {data.map((item) => (
            <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
              <td className="p-3 font-medium text-slate-700 dark:text-slate-200">
                <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-slate-400" />
                    {item.id}
                </div>
              </td>
              <td className="p-3 text-slate-600 dark:text-slate-400">{item.operador}</td>
              <td className="p-3 text-slate-600 dark:text-slate-400">{item.horario}</td>
              <td className="p-3 text-center">
                <span className={`inline-flex h-3 w-3 rounded-full ${
                    item.status === 'Fechado' ? 'bg-emerald-500 shadow-sm shadow-emerald-500/50' : 'bg-red-500 shadow-sm shadow-red-500/50 animate-pulse'
                }`} title={item.status} />
              </td>
              <td className="p-3 text-right">
                {/* Botão Atualizado com onClick */}
                <button 
                  onClick={() => onViewClick(item)} // <--- AÇÃO AQUI
                  className="text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300 font-medium text-xs border border-emerald-200 dark:border-emerald-800 px-3 py-1.5 rounded hover:bg-emerald-50 dark:hover:bg-emerald-900/30 transition-colors"
                >
                  Visualizar
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};