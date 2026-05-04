import { useState, useEffect } from 'react';
import { Search, User, ChevronDown, Radio, Monitor, MapPin, Layers } from 'lucide-react';

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
    eventType: string; setEventType: (v: string) => void;
    
    onlyMine: boolean; setOnlyMine: (v: boolean) => void;
  }
}

export const ShiftFilters = ({ filters }: ShiftFiltersProps) => {
  // Adicionado 'mesa' e 'base' ao estado de controle do dropdown
  const [openFilter, setOpenFilter] = useState<'priority' | 'status' | 'mesa' | 'base' | 'eventType' | null>(null);

  useEffect(() => {
    const handleClickOutside = () => setOpenFilter(null);
    window.addEventListener('click', handleClickOutside);
    return () => window.removeEventListener('click', handleClickOutside);
  }, []);

  const toggleFilter = (e: React.MouseEvent, filter: 'priority' | 'status' | 'mesa' | 'base' | 'eventType') => {
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

  const eventTypeOptions: FilterOption[] = [
    { label: 'Todos Eventos', value: 'todos' },
    { label: 'Ocorrências', value: 'occurrence' },
    { label: 'Circuitos Manobrados', value: 'circuit-switching' },
    { label: 'Equipamentos Indisponíveis', value: 'unavailable-equipment' },
  ];

  const renderDropdown = (
    type: 'priority' | 'status' | 'mesa' | 'base' | 'eventType', 
    currentVal: string, 
    setVal: (v: string) => void, 
    options: FilterOption[],
    icon?: React.ReactNode // Opcional para ícones extras
  ) => (
    <div className="relative flex-1 min-w-[150px]">
      <button
        onClick={(e) => toggleFilter(e, type)}
        className={`eq-control w-full h-[46px] flex items-center justify-between px-3 whitespace-nowrap text-sm font-medium ${openFilter === type ? 'border-emerald-500 ring-2 ring-emerald-500/20' : ''}`}
      >
        <div className="flex items-center gap-2 truncate">
          {icon && <span className="text-[var(--eq-text-muted)]">{icon}</span>}
          <span className="truncate text-xs sm:text-sm">
             {options.find(o => o.value === currentVal)?.label}
          </span>
        </div>
        <ChevronDown className={`w-3.5 h-3.5 ml-1 text-[var(--eq-text-muted)] transition-transform ${openFilter === type ? 'rotate-180' : ''}`} />
      </button>

      <div className={`eq-dropdown-menu absolute top-full left-0 right-0 mt-2 p-1.5 z-[60] transition-all origin-top ${openFilter === type ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'}`}>
        {options.map((opt) => (
          <div key={opt.value} onClick={() => { setVal(opt.value); setOpenFilter(null); }} className={`eq-dropdown-option ${currentVal === opt.value ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400 font-semibold' : ''}`}>
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
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--eq-text-muted)]" />
        <input
          type="text"
          value={filters.searchTerm}
          onChange={(e) => filters.setSearchTerm(e.target.value)}
          placeholder="Buscar..."
          className="eq-control w-full pl-11 pr-4 py-3 focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 text-sm h-[46px]"
        />
      </div>

      <div className="flex flex-wrap gap-2 relative z-50">
        {/* Input Autor */}
        <div className="relative flex-1 min-w-[140px]">
           <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--eq-text-muted)]" />
           <input
             type="text"
             value={filters.author}
             onChange={(e) => filters.setAuthor(e.target.value)}
             placeholder="Autor"
             className="eq-control w-full pl-9 pr-3 py-3 text-sm focus:ring-2 focus:ring-emerald-500/50 h-[46px]"
           />
        </div>

        {/* Novos Dropdowns de MESA e BASE */}
        {renderDropdown('eventType', filters.eventType, filters.setEventType, eventTypeOptions, <Layers className="w-4 h-4"/>)}
        {renderDropdown('mesa', filters.mesa, filters.setMesa, mesaOptions, <Monitor className="w-4 h-4"/>)}
        {renderDropdown('base', filters.base, filters.setBase, baseOptions, <MapPin className="w-4 h-4"/>)}

        {/* Filtros Originais */}
        {renderDropdown('priority', filters.priority, filters.setPriority, priorityOptions)}

        {/* Checkbox Minhas */}
        <label className={`eq-control relative flex-1 min-w-[100px] h-[46px] flex items-center justify-center gap-2 cursor-pointer select-none whitespace-nowrap ${filters.onlyMine ? 'bg-emerald-50 border-emerald-200 text-emerald-700 dark:bg-emerald-900/20 dark:border-emerald-800 dark:text-emerald-400' : 'hover:border-emerald-500/50'}`}>
          <input type="checkbox" checked={filters.onlyMine} onChange={(e) => filters.setOnlyMine(e.target.checked)} className="hidden" />
          <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors shrink-0 ${filters.onlyMine ? 'bg-emerald-500 border-emerald-500' : 'border-[var(--eq-border-strong)] bg-[var(--eq-bg-surface)]'}`}>
             {filters.onlyMine && <Radio className="w-2.5 h-2.5 text-white fill-current" />}
          </div>
          <span className="text-xs sm:text-sm font-medium">Minhas</span>
        </label>

        {renderDropdown('status', filters.status, filters.setStatus, statusOptions)}
      </div>
    </div>
  );
};
