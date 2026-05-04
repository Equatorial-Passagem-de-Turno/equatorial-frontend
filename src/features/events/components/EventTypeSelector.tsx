import { AlertTriangle, CircuitBoard, FileText, Wrench, type LucideIcon } from 'lucide-react';

export type EventType = 'occurrence' | 'circuit-switching' | 'unavailable-equipment';

interface EventTypeOption {
  value: EventType;
  label: string;
  description: string;
  icon: LucideIcon;
  iconTone: string;
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
    iconTone: 'eq-tone-occurrence',
    activeTone: 'eq-card-occurrence-active',
  },
  {
    value: 'circuit-switching',
    label: 'Circuito manobrado',
    description: 'Registro de circuito, manobra, prazo e clientes afetados.',
    icon: CircuitBoard,
    iconTone: 'eq-tone-circuit',
    activeTone: 'eq-card-circuit-active',
  },
  {
    value: 'unavailable-equipment',
    label: 'Equipamento indisponível',
    description: 'Registro com foco em número, tipo e normalização do equipamento.',
    icon: Wrench,
    iconTone: 'eq-tone-equipment',
    activeTone: 'eq-card-equipment-active',
  },
];

export const EventTypeSelector = ({ value, onChange }: EventTypeSelectorProps) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="eq-soft-icon p-2 rounded-lg">
          <AlertTriangle className="w-5 h-5" />
        </div>
        <div>
          <h2 className="eq-card-title text-xl font-bold">Cadastrar evento</h2>
          <p className="eq-page-subtitle">
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
              className={`eq-surface-soft text-left p-4 transition-all hover:border-[var(--eq-border-strong)] ${
                isActive ? option.activeTone : ''
              }`}
            >
              <div className="flex items-start gap-3">
                <div className={`shrink-0 p-2.5 rounded-lg border ${option.iconTone}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <div className="eq-card-title font-bold">
                    {option.label}
                  </div>
                  <div className="eq-card-description mt-1 leading-relaxed">
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
