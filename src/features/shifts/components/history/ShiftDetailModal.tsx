import React from 'react';
import { X, FileText, MessageSquare, Printer, MapPin, AlertCircle, CheckCircle } from 'lucide-react';
import { type HistoryItem } from './HistoryTable';

// Tipagem para os eventos internos do turno (Baseado na imagem antiga)
interface ShiftEvent {
  id: string;
  base: string; // Ex: DELMIRO, AT-LESTE
  dataHora: string;
  status: 'Entregue' | 'Pendente';
  atividade: string; // Ex: Perturbação...
  observacao: string;
  qtdComentarios: number;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  shiftData: HistoryItem | null; // Dados do turno selecionado
}

export const ShiftDetailModal: React.FC<Props> = ({ isOpen, onClose, shiftData }) => {
  if (!isOpen || !shiftData) return null;

  // MOCK: Gerar eventos fictícios baseados no ID do turno para visualização
  const mockEvents: ShiftEvent[] = [
    {
      id: '65165',
      base: 'DELMIRO',
      dataHora: `${shiftData.horario.split(' - ')[0]}`, // Pega o início do turno
      status: 'Entregue',
      atividade: 'Perturbação na Instalação de Clientes',
      observacao: 'Cliente relatou oscilação. Equipe enviada para verificação no ramal.',
      qtdComentarios: 0
    },
    {
      id: '12424333',
      base: 'AT - LESTE',
      dataHora: '20/01/2026 11:38',
      status: 'Pendente',
      atividade: 'Circuitos Manobrados',
      observacao: 'SE TBM COM SE BBBE - Aguardando autorização do COD.',
      qtdComentarios: 2
    }
  ];

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      {/* Backdrop Escuro (mais escuro que o anterior para focar nesta modal) */}
      <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm animate-fade-in" onClick={onClose} />

      {/* Janela Principal */}
      <div className="relative w-full max-w-3xl bg-slate-100 dark:bg-slate-900 rounded-xl shadow-2xl border border-slate-300 dark:border-slate-700 overflow-hidden animate-slide-up flex flex-col max-h-[90vh]">
        
        {/* --- CABEÇALHO (Azul Escuro como na imagem antiga) --- */}
        <div className="bg-slate-800 text-white p-4 flex items-center justify-between border-b border-slate-700">
          <div className="flex items-center gap-3">
             <div className="p-2 bg-slate-700 rounded-lg border border-slate-600">
                <FileText className="w-6 h-6 text-emerald-400" />
             </div>
             <div>
                <h2 className="text-lg font-bold leading-tight">Lista de Eventos no Turno</h2>
                <p className="text-xs text-slate-400 font-mono mt-0.5">{shiftData.id}</p>
             </div>
          </div>
          
          <div className="flex items-center gap-3">
            {/* Botão PDF inspirado na imagem */}
            <button className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 rounded text-xs font-bold transition-colors shadow-sm">
                <Printer className="w-4 h-4" />
                VER PDF
            </button>
            <button onClick={onClose} className="p-1.5 hover:bg-slate-700 rounded-full transition-colors">
                <X className="w-5 h-5 text-slate-400 hover:text-white" />
            </button>
          </div>
        </div>

        {/* --- BARRA DE INFORMAÇÕES DO OPERADOR --- */}
        <div className="bg-white dark:bg-slate-800 p-4 border-b border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center font-bold text-slate-600 dark:text-slate-300">
                    {shiftData.operador.substring(0, 2).toUpperCase()}
                </div>
                <div>
                    <p className="text-xs text-slate-500 uppercase font-bold">Operador Responsável</p>
                    <p className="font-bold text-slate-800 dark:text-white">{shiftData.operador}</p>
                </div>
            </div>
            <div className="text-right">
                 <p className="text-xs text-slate-500 uppercase font-bold">Data do Turno</p>
                 <p className="font-bold text-slate-800 dark:text-white text-lg">14/01/2026</p> {/* Mock data fixa para exemplo */}
            </div>
        </div>

        {/* --- CONTEÚDO (Lista de Eventos) --- */}
        <div className="flex-1 overflow-auto p-4 space-y-4">
            {mockEvents.map((event) => (
                <div key={event.id} className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
                    
                    {/* Header do Card (Base e Status) */}
                    <div className="grid grid-cols-12 border-b border-slate-100 dark:border-slate-700">
                        <div className="col-span-4 bg-slate-50 dark:bg-slate-900/50 p-2 border-r border-slate-100 dark:border-slate-700 flex flex-col justify-center">
                            <span className="text-[10px] font-bold text-slate-400 uppercase">Base</span>
                            <div className="flex items-center gap-1 font-bold text-slate-700 dark:text-slate-200 text-sm">
                                <MapPin className="w-3 h-3 text-emerald-500" />
                                {event.base}
                            </div>
                        </div>
                        <div className="col-span-4 p-2 border-r border-slate-100 dark:border-slate-700 flex flex-col justify-center text-center">
                             <span className="text-[10px] font-bold text-slate-400 uppercase">Data/Hora</span>
                             <span className="text-xs font-mono text-slate-600 dark:text-slate-300">{event.dataHora}</span>
                        </div>
                        <div className="col-span-4 p-2 flex flex-col justify-center items-center bg-slate-50 dark:bg-slate-900/50">
                             <span className="text-[10px] font-bold text-slate-400 uppercase mb-1">Status</span>
                             <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border flex items-center gap-1 ${
                                event.status === 'Entregue' 
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-100 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800' 
                                : 'bg-orange-50 text-orange-700 border-orange-100 dark:bg-orange-900/20 dark:text-orange-400 dark:border-orange-800'
                             }`}>
                                {event.status === 'Entregue' ? <CheckCircle className="w-3 h-3"/> : <AlertCircle className="w-3 h-3"/>}
                                {event.status}
                             </span>
                        </div>
                    </div>

                    {/* Corpo do Card (Atividade e Obs) */}
                    <div className="p-3 grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="md:col-span-3 space-y-3">
                            <div>
                                <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Atividade</span>
                                <p className="text-sm font-medium text-slate-800 dark:text-white leading-snug">
                                    {event.atividade}
                                </p>
                            </div>
                            <div className="bg-slate-50 dark:bg-slate-950 p-2 rounded border border-slate-100 dark:border-slate-800">
                                <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">1ª Observação (ID: {event.id})</span>
                                <p className="text-xs text-slate-600 dark:text-slate-400 italic">
                                    "{event.observacao}"
                                </p>
                            </div>
                        </div>

                        {/* Coluna de Ações (Direita) */}
                        <div className="md:col-span-1 flex flex-col justify-center items-center gap-2 border-l border-slate-100 dark:border-slate-700 pl-4">
                            <div className="text-center w-full">
                                <button className="w-full flex flex-col items-center justify-center p-2 rounded hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors group">
                                    <MessageSquare className="w-5 h-5 text-slate-400 group-hover:text-blue-500 mb-1" />
                                    <span className="text-[10px] font-bold text-slate-500">Notas/Coment.</span>
                                </button>
                                <div className="mt-1 bg-slate-800 text-white text-xs font-bold py-1 px-3 rounded shadow-sm">
                                    {event.qtdComentarios}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            ))}
            
            {/* Mensagem de fim da lista */}
            <div className="text-center py-4">
                <p className="text-xs text-slate-400 uppercase tracking-widest">Fim dos registros</p>
            </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-50 dark:bg-slate-900 p-3 border-t border-slate-200 dark:border-slate-700 flex justify-end">
            <button onClick={onClose} className="px-5 py-2 bg-white border border-slate-300 text-slate-700 text-sm font-bold rounded hover:bg-slate-50 transition-colors shadow-sm">
                Fechar Detalhes
            </button>
        </div>
      </div>
    </div>
  );
};