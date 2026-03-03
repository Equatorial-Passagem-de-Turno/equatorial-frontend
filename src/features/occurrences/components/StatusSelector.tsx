import { useState, useEffect, useRef } from 'react';
import { ChevronDown, Check, Loader2 } from 'lucide-react';
import { statusConfig } from '../config/statusConfig'; // Importando a config centralizada
import type { OccurrenceStatus } from '../types';

interface StatusSelectorProps {
  currentStatus: OccurrenceStatus;
  onStatusChange: (newStatus: OccurrenceStatus) => Promise<void>;
}

export const StatusSelector = ({ currentStatus, onStatusChange }: StatusSelectorProps) => {
  // 1. Estados Locais
  const [isOpen, setIsOpen] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<OccurrenceStatus>(currentStatus);
  const [isUpdating, setIsUpdating] = useState(false);
  
  const dropdownRef = useRef<HTMLDivElement>(null);

  // 2. Sincroniza o estado local se a prop mudar externamente (ex: atualização em tempo real)
  useEffect(() => {
    setSelectedStatus(currentStatus);
  }, [currentStatus]);

  // 3. Click Outside (Sua lógica original isolada aqui)
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // 4. Handler para confirmar a mudança
  const handleConfirmUpdate = async () => {
    if (selectedStatus === currentStatus) return;
    
    setIsUpdating(true);
    try {
      await onStatusChange(selectedStatus);
      setIsOpen(false); // Fecha o dropdown após sucesso
    } catch (error) {
      console.error("Erro ao atualizar status", error);
    } finally {
      setIsUpdating(false);
    }
  };

  // 5. Configuração Visual baseada na seleção atual (Previsão)
  const currentConfig = statusConfig[selectedStatus] || statusConfig["Aberta"];
  const CurrentIcon = currentConfig.icon;

  return (
    <div className="rounded-3xl p-6 bg-white border border-slate-100 dark:bg-slate-900/40 dark:border-slate-800 shadow-xl backdrop-blur-sm">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 tracking-tight">
          Gerenciar Status
        </h3>
      </div>

      {/* CUSTOM SELECT */}
      <div className="relative mb-6" ref={dropdownRef}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`
            w-full flex items-center justify-between px-4 py-3.5 rounded-2xl
            border transition-all duration-300 ease-out
            ${isOpen 
              ? 'border-indigo-500 ring-4 ring-indigo-500/10 shadow-lg bg-white dark:bg-slate-800' 
              : 'border-slate-200 dark:border-slate-700 bg-slate-50 hover:bg-white dark:bg-slate-950 dark:hover:bg-slate-900'
            }
          `}
        >
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-xl ${currentConfig.bg} ${currentConfig.color}`}>
              <CurrentIcon width={18} height={18} />
            </div>
            <span className="font-semibold text-slate-700 dark:text-slate-200">
              {selectedStatus}
            </span>
          </div>
          <ChevronDown 
            className={`text-slate-400 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} 
            size={20} 
          />
        </button>

        {/* DROPDOWN LIST */}
        <div className={`
          absolute z-50 w-full mt-2 p-1.5 rounded-2xl
          bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-700
          shadow-2xl shadow-slate-200/50 dark:shadow-black/50
          transition-all duration-200 origin-top
          ${isOpen ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 -translate-y-2 pointer-events-none'}
        `}>
          {Object.keys(statusConfig).map((statusKey) => {
            const config = statusConfig[statusKey];
            const Icon = config.icon;
            const isSelected = selectedStatus === statusKey;

            return (
              <div
                key={statusKey}
                onClick={() => {
                  setSelectedStatus(statusKey as OccurrenceStatus);
                  setIsOpen(false);
                }}
                className={`
                  flex items-center justify-between px-3 py-3 rounded-xl cursor-pointer
                  transition-all duration-200 group
                  ${isSelected 
                    ? 'bg-slate-50 dark:bg-slate-800' 
                    : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'
                  }
                `}
              >
                <div className="flex items-center gap-3">
                  <div className={`
                    p-2 rounded-lg transition-colors
                    ${isSelected ? config.bg + ' ' + config.color : 'bg-slate-100 dark:bg-slate-800 text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300'}
                  `}>
                    <Icon width={18} height={18} />
                  </div>
                  <span className={`font-medium ${isSelected ? 'text-slate-900 dark:text-white' : 'text-slate-500 dark:text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-200'}`}>
                    {config.label}
                  </span>
                </div>
                {isSelected && <Check size={16} className="text-indigo-500" />}
              </div>
            );
          })}
        </div>
      </div>

      {/* BOTÃO DE CONFIRMAR ATUALIZAÇÃO */}
      <button
        onClick={handleConfirmUpdate}
        disabled={isUpdating || selectedStatus === currentStatus}
        className={`
          w-full py-4 rounded-xl font-bold text-sm tracking-wide uppercase transition-all duration-300
          flex items-center justify-center gap-2 shadow-lg
          ${selectedStatus === currentStatus 
            ? 'bg-slate-100 text-slate-400 cursor-not-allowed shadow-none dark:bg-slate-800 dark:text-slate-600'
            : 'bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white shadow-emerald-500/20 hover:shadow-emerald-500/40 hover:-translate-y-0.5'
          }
        `}
      >
        {isUpdating ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin"/>
            Atualizando...
          </>
        ) : (
          'Confirmar Alteração'
        )}
      </button>
    </div>
  );
};