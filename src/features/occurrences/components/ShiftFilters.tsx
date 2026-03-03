import { useState, useEffect } from 'react';
import { Search, User, ChevronDown, Radio, Monitor, MapPin } from 'lucide-react';

interface FilterOption {
  label: string;
  value: string;
}

interface ShiftFiltersProps {
  filters: {
    searchTerm: string; setSearchTerm: (v: string) => void;
    author: string; setAuthor: (v: string) => void;
    priority: string; setPriority: (v: string) => void;
    status: string; setStatus: (v: string) => void;
    // Novos filtros adicionados
    mesa: string; setMesa: (v: string) => void;
    base: string; setBase: (v: string) => void;
    
    onlyMine: boolean; setOnlyMine: (v: boolean) => void;
  }
}

export const ShiftFilters = ({ filters }: ShiftFiltersProps) => {
  // Adicionado 'mesa' e 'base' ao estado de controle do dropdown
  const [openFilter, setOpenFilter] = useState<'priority' | 'status' | 'mesa' | 'base' | null>(null);

  useEffect(() => {
    const handleClickOutside = () => setOpenFilter(null);
    window.addEventListener('click', handleClickOutside);
    return () => window.removeEventListener('click', handleClickOutside);
  }, []);

  const toggleFilter = (e: React.MouseEvent, filter: 'priority' | 'status' | 'mesa' | 'base') => {
    e.stopPropagation();
    setOpenFilter(openFilter === filter ? null : filter);
  };

  // --- Opções dos Filtros ---
  const priorityOptions: FilterOption[] = [
    { label: 'Todas Prioridades', value: 'todas' },
    { label: 'Crítica', value: 'crítica' },
    { label: 'Alta', value: 'alta' },
    { label: 'Média', value: 'média' },
    { label: 'Baixa', value: 'baixa' },
  ];

  const statusOptions: FilterOption[] = [
    { label: 'Todos Status', value: 'todas' },
    { label: 'Pendente', value: 'Pendente' },
    { label: 'Em Análise', value: 'Em Análise' },
    { label: 'Resolvida', value: 'Resolvida' },
    { label: 'Transferida', value: 'Transferida' },
  ];

  const mesaOptions: FilterOption[] = [
    { label: 'Todas Mesas', value: 'todas' },
    { label: 'Mesa Operacional 1', value: 'Mesa 1' },
    { label: 'Mesa Operacional 2', value: 'Mesa 2' },
    { label: 'Mesa Supervisão', value: 'Supervisão' },
  ];

  const baseOptions: FilterOption[] = [
    { label: 'Todas Bases', value: 'todas' },
    { label: 'Base Matriz', value: 'Matriz' },
    { label: 'Base Filial Norte', value: 'Norte' },
    { label: 'Base Filial Sul', value: 'Sul' },
  ];

  const renderDropdown = (
    type: 'priority' | 'status' | 'mesa' | 'base', 
    currentVal: string, 
    setVal: (v: string) => void, 
    options: FilterOption[],
    icon?: React.ReactNode // Opcional para ícones extras
  ) => (
    <div className="relative flex-1 min-w-[150px]">
      <button
        onClick={(e) => toggleFilter(e, type)}
        className={`w-full h-[46px] flex items-center justify-between px-3 bg-white dark:bg-slate-900 border rounded-xl text-slate-700 dark:text-slate-200 transition-all duration-200 outline-none whitespace-nowrap shadow-sm text-sm font-medium ${openFilter === type ? 'border-emerald-500 ring-2 ring-emerald-500/20' : 'border-slate-300 dark:border-slate-800'}`}
      >
        <div className="flex items-center gap-2 truncate">
          {icon && <span className="text-slate-400">{icon}</span>}
          <span className="truncate text-xs sm:text-sm">
             {options.find(o => o.value === currentVal)?.label}
          </span>
        </div>
        <ChevronDown className={`w-3.5 h-3.5 ml-1 text-slate-400 transition-transform ${openFilter === type ? 'rotate-180' : ''}`} />
      </button>

      <div className={`absolute top-full left-0 right-0 mt-2 p-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl z-[60] transition-all origin-top ${openFilter === type ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'}`}>
        {options.map((opt) => (
          <div key={opt.value} onClick={() => { setVal(opt.value); setOpenFilter(null); }} className={`px-3 py-2.5 rounded-lg cursor-pointer transition-colors text-sm ${currentVal === opt.value ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400 font-semibold' : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'}`}>
            {opt.label}
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="flex flex-col xl:flex-row gap-3 mb-6 relative z-50">
      {/* Busca Texto */}
      <div className="flex-1 relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
        <input
          type="text"
          value={filters.searchTerm}
          onChange={(e) => filters.setSearchTerm(e.target.value)}
          placeholder="Buscar..."
          className="w-full pl-11 pr-4 py-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 outline-none transition-all shadow-sm text-sm h-[46px]"
        />
      </div>

      <div className="flex flex-wrap gap-2 relative z-50">
        {/* Input Autor */}
        <div className="relative flex-1 min-w-[140px]">
           <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
           <input
             type="text"
             value={filters.author}
             onChange={(e) => filters.setAuthor(e.target.value)}
             placeholder="Autor"
             className="w-full pl-9 pr-3 py-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-emerald-500/50 outline-none shadow-sm h-[46px]"
           />
        </div>

        {/* Novos Dropdowns de MESA e BASE */}
        {renderDropdown('mesa', filters.mesa, filters.setMesa, mesaOptions, <Monitor className="w-4 h-4"/>)}
        {renderDropdown('base', filters.base, filters.setBase, baseOptions, <MapPin className="w-4 h-4"/>)}

        {/* Filtros Originais */}
        {renderDropdown('priority', filters.priority, filters.setPriority, priorityOptions)}

        {/* Checkbox Minhas */}
        <label className={`relative flex-1 min-w-[100px] h-[46px] flex items-center justify-center gap-2 rounded-xl border cursor-pointer select-none transition-all shadow-sm whitespace-nowrap ${filters.onlyMine ? 'bg-emerald-50 border-emerald-200 text-emerald-700 dark:bg-emerald-900/20 dark:border-emerald-800 dark:text-emerald-400' : 'bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-emerald-500/50'}`}>
          <input type="checkbox" checked={filters.onlyMine} onChange={(e) => filters.setOnlyMine(e.target.checked)} className="hidden" />
          <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors shrink-0 ${filters.onlyMine ? 'bg-emerald-500 border-emerald-500' : 'border-slate-400 bg-white dark:bg-slate-800'}`}>
             {filters.onlyMine && <Radio className="w-2.5 h-2.5 text-white fill-current" />}
          </div>
          <span className="text-xs sm:text-sm font-medium">Minhas</span>
        </label>

        {renderDropdown('status', filters.status, filters.setStatus, statusOptions)}
      </div>
    </div>
  );
};