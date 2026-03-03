// opção do select
export interface FilterOption {
  label: string;
  value: string;
}

// componente de filtros
export interface DashboardFiltersProps {
  searchTerm: string;
  onSearchChange: (val: string) => void;
  priority: string;
  onPriorityChange: (val: string) => void;
  status: string;
  onStatusChange: (val: string) => void;
}

// dropdown de seleção
export interface SelectDropdownProps {
  type: 'priority' | 'status';
  value: string;
  options: FilterOption[];
  onChange: (val: string) => void;
  isOpen: boolean;
  onToggle: (e: React.MouseEvent, type: 'priority' | 'status') => void;
}