import React, { useState, useEffect } from 'react';
import { X, Calendar as CalendarIcon, Filter } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { MiniCalendar } from './MiniCalendar';
import { HistoryTable, type HistoryItem } from './HistoryTable';
import { ShiftDetailModal } from './ShiftDetailModal'; // <--- IMPORTAR

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const ShiftHistoryModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [historyData, setHistoryData] = useState<HistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  // Estados para controlar a visualização de detalhes
  const [selectedShift, setSelectedShift] = useState<HistoryItem | null>(null); // <--- SELEÇÃO
  const [isDetailOpen, setIsDetailOpen] = useState(false); // <--- CONTROLE MODAL

  const markedDates = [
    new Date(), 
    new Date(new Date().setDate(new Date().getDate() - 2)), 
    new Date(new Date().setDate(new Date().getDate() - 5)), 
  ];

  useEffect(() => {
    if (isOpen) {
      setIsLoading(true);
      setTimeout(() => {
        const mockData: HistoryItem[] = [
            { id: `TUR-${format(selectedDate, 'ddMM')}-A`, operador: 'BRUNO GOMES FERREIRA', horario: '06:00 - 14:00', tipo: 'MT', status: 'Fechado' },
            { id: `TUR-${format(selectedDate, 'ddMM')}-B`, operador: 'MARIA COSTA', horario: '14:00 - 22:00', tipo: 'BT', status: 'Fechado' },
            ...(format(selectedDate, 'ddMMyyyy') === format(new Date(), 'ddMMyyyy') 
                ? [{ id: `TUR-${format(selectedDate, 'ddMM')}-C`, operador: 'CARLOS OP.', horario: '22:00 - ...', tipo: 'AT', status: 'Aberto' as const }] 
                : [])
        ];
        
        if (selectedDate > new Date()) {
            setHistoryData([]);
        } else {
            setHistoryData(mockData);
        }
        setIsLoading(false);
      }, 400);
    }
  }, [selectedDate, isOpen]);

  // Handler para quando clicar em "Visualizar"
  const handleViewShift = (item: HistoryItem) => {
    setSelectedShift(item);
    setIsDetailOpen(true);
  };

  if (!isOpen) return null;

  return (
    <>
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-fade-in" onClick={onClose} />

        <div className="relative w-full max-w-4xl bg-slate-50 dark:bg-slate-950 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden animate-slide-up flex flex-col max-h-[90vh]">
            
            <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
            <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg">
                    <CalendarIcon className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div>
                    <h2 className="text-xl font-bold text-slate-800 dark:text-white">Histórico de Turnos</h2>
                    <p className="text-sm text-slate-500">Consulte turnos anteriores e status</p>
                </div>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors">
                <X className="w-6 h-6 text-slate-500" />
            </button>
            </div>

            <div className="flex-1 overflow-auto p-6">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
                    <div className="md:col-span-5 lg:col-span-4 space-y-4">
                        <div className="flex items-center gap-2 mb-2">
                            <Filter className="w-4 h-4 text-emerald-600" />
                            <span className="text-sm font-bold uppercase text-slate-500 tracking-wider">Filtrar Data</span>
                        </div>
                        <MiniCalendar 
                            selectedDate={selectedDate} 
                            onSelectDate={setSelectedDate}
                            markedDates={markedDates}
                        />
                         {/* ... Legenda ... */}
                    </div>

                    <div className="md:col-span-7 lg:col-span-8">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-bold text-slate-700 dark:text-white flex items-center gap-2">
                                Turnos de {format(selectedDate, "dd 'de' MMMM", { locale: ptBR })}
                            </h3>
                            <span className="text-xs bg-slate-200 dark:bg-slate-800 px-2 py-1 rounded-full text-slate-600 dark:text-slate-400 font-mono">
                                {historyData.length} registros
                            </span>
                        </div>
                        
                        {/* Passando o handler para a tabela */}
                        <HistoryTable 
                            data={historyData} 
                            isLoading={isLoading} 
                            onViewClick={handleViewShift} 
                        />
                    </div>
                </div>
            </div>

            <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-right">
                <button onClick={onClose} className="px-6 py-2 text-sm font-medium text-slate-600 hover:text-slate-800 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg transition-colors">
                    Fechar Histórico
                </button>
            </div>
        </div>
        </div>

        {/* 4. RENDERIZAR A MODAL DE DETALHES SOBREPOSTA */}
        <ShiftDetailModal 
            isOpen={isDetailOpen}
            onClose={() => setIsDetailOpen(false)}
            shiftData={selectedShift}
        />
    </>
  );
};