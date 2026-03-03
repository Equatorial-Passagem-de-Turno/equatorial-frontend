import { type LucideIcon } from 'lucide-react';

interface StatCardProps {
  icon: LucideIcon;
  label: string;
  value: number | string;
  color: string;
  onClick?: () => void;
}

export const StatCard = ({ icon: Icon, label, value, color, onClick }: StatCardProps) => (
  <div 
    onClick={onClick} 
    className={`
      w-full bg-[var(--bg-panel)] border border-[var(--border-color)] rounded-xl p-4 transition-all duration-200
      ${onClick ? 'cursor-pointer hover:border-emerald-500/50 hover:shadow-lg hover:shadow-emerald-500/10 hover:-translate-y-1' : ''}
    `}
  >
    <div className="flex items-start justify-between gap-3">
      <div className={`w-12 h-12 bg-gradient-to-br ${color} rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm`}>
        <Icon className="w-6 h-6 text-white" />
      </div>
      <div className="text-right flex-1 min-w-0">
        <div className="text-2xl font-bold text-[var(--text-main)] truncate">{value}</div>
        <div className="text-[var(--text-muted)] text-sm font-medium truncate uppercase tracking-wide">{label}</div>
      </div>
    </div>
  </div>
);