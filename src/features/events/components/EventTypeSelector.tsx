import { AlertTriangle, CircuitBoard, FileText, Wrench, type LucideIcon } from 'lucide-react';

export type EventType = 'occurrence' | 'circuit-switching' | 'unavailable-equipment';

interface EventTypeOption {
  value: EventType;
  label: string;
  description: string;
  icon: LucideIcon;
  tone: string;
  activeTone: string;
}

interface EventTypeSelectorProps {
  value: EventType;
  onChange: (value: EventType) => void;
}

const options: EventTypeOption[] = [
  {
    value: 'occurrence',
    label: 'Ocorrência',
    description: 'Registro operacional comum, com categoria, prioridade e detalhes.',
    icon: FileText,
    tone: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/30 dark:text-emerald-400',
    activeTone: 'border-emerald-500 ring-2 ring-emerald-500/20',
  },
  {
    value: 'circuit-switching',
    label: 'Circuito manobrado',
    description: 'Registro de circuito, manobra, prazo e clientes afetados.',
    icon: CircuitBoard,
    tone: 'text-blue-600 bg-blue-50 dark:bg-blue-950/30 dark:text-blue-400',
    activeTone: 'border-blue-500 ring-2 ring-blue-500/20',
  },
  {
    value: 'unavailable-equipment',
    label: 'Equipamento indisponível',
    description: 'Registro com foco em número, tipo e normalização do equipamento.',
    icon: Wrench,
    tone: 'text-red-600 bg-red-50 dark:bg-red-950/30 dark:text-red-400',
    activeTone: 'border-red-500 ring-2 ring-red-500/20',
  },
];

export const EventTypeSelector = ({ value, onChange }: EventTypeSelectorProps) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg text-slate-600 dark:text-slate-300">
          <AlertTriangle className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Cadastrar evento</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Selecione o tipo de evento antes de preencher o formulario.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        {options.map((option) => {
          const Icon = option.icon;
          const isActive = value === option.value;

          return (
            <button
              key={option.value}
              type="button"
              onClick={() => onChange(option.value)}
              className={`text-left rounded-xl border p-4 transition-all bg-white dark:bg-slate-950/70 hover:border-slate-400 dark:hover:border-slate-600 ${
                isActive ? option.activeTone : 'border-slate-200 dark:border-slate-800'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className={`shrink-0 p-2.5 rounded-lg ${option.tone}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <div className="font-bold text-slate-800 dark:text-slate-100">
                    {option.label}
                  </div>
                  <div className="text-xs leading-relaxed text-slate-500 dark:text-slate-400 mt-1">
                    {option.description}
                  </div>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
