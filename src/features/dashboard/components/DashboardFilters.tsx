import { useState, useEffect } from 'react';
import { Search, ChevronDown } from 'lucide-react';

import type { 
  FilterOption, 
  DashboardFiltersProps, 
  SelectDropdownProps 
} from '../types'; 

const SelectDropdown = ({ 
  type, value, options, onChange, isOpen, onToggle 
}: SelectDropdownProps) => (
  <div className="relative flex-1 min-w-[160px]">
    <button
      onClick={(e) => onToggle(e, type)}
      className={`
        w-full flex items-center justify-between px-4 py-3 
        bg-[var(--bg-panel)] border rounded-xl text-[var(--text-main)] 
        transition-all duration-200 outline-none whitespace-nowrap shadow-sm
        ${isOpen 
          ? 'border-emerald-500 ring-2 ring-emerald-500/20 shadow-lg' 
          : 'border-[var(--border-input)] hover:border-emerald-500/50'
        }
      `}
    >
      <span className="font-medium truncate text-sm">
        {options.find((o) => o.value === value)?.label}
      </span>
      <ChevronDown className={`w-4 h-4 ml-2 text-[var(--text-muted)] transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
    </button>

    <div className={`
      absolute top-full left-0 right-0 mt-2 p-1.5
      bg-[var(--bg-panel)] border border-[var(--border-color)] rounded-xl shadow-xl z-50
      transition-all duration-200 origin-top
      ${isOpen ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 -translate-y-2 pointer-events-none'}
    `}>
      {options.map((opt) => (
        <div
          key={opt.value}
          onClick={() => { onChange(opt.value); }}
          className={`
            px-3 py-2.5 rounded-lg cursor-pointer transition-colors text-sm
            ${value === opt.value 
              ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400 font-semibold' 
              : 'text-[var(--text-main)] hover:bg-[var(--bg-background)]'
            }
          `}
        >
          {opt.label}
        </div>
      ))}
    </div>
  </div>
);

// Componente Principal
export const DashboardFilters = ({ 
  searchTerm, onSearchChange, 
  priority, onPriorityChange, 
  status, onStatusChange 
}: DashboardFiltersProps) => {
  const [openFilter, setOpenFilter] = useState<'priority' | 'status' | null>(null);

  useEffect(() => {
    const handleClickOutside = () => setOpenFilter(null);
    window.addEventListener('click', handleClickOutside);
    return () => window.removeEventListener('click', handleClickOutside);
  }, []);

  const toggleFilter = (e: React.MouseEvent, filter: 'priority' | 'status') => {
    e.stopPropagation();
    setOpenFilter(openFilter === filter ? null : filter);
  };

  const handleOptionClick = (setter: (val: string) => void, val: string) => {
    setter(val);
    setOpenFilter(null);
  };

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

  return (
    <div className="flex flex-col lg:flex-row gap-4 relative z-50">
      <div className="relative flex-1">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--text-muted)] pointer-events-none" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Buscar por título ou ID..."
          className="w-full bg-[var(--bg-panel)] border border-[var(--border-input)] rounded-xl pl-12 pr-4 py-3 text-[var(--text-main)] placeholder-[var(--text-muted)] focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all shadow-sm"
        />
      </div>
      <div className="flex flex-wrap gap-3 relative z-50">
        <SelectDropdown 
          type="priority" 
          value={priority} 
          options={priorityOptions} 
          onChange={(val) => handleOptionClick(onPriorityChange, val)} 
          isOpen={openFilter === 'priority'}
          onToggle={toggleFilter}
        />
        <SelectDropdown 
          type="status" 
          value={status} 
          options={statusOptions} 
          onChange={(val) => handleOptionClick(onStatusChange, val)} 
          isOpen={openFilter === 'status'}
          onToggle={toggleFilter}
        />
      </div>
    </div>
  );
};