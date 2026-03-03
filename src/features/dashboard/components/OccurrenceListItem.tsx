import { useNavigate } from 'react-router-dom';
import { Clock, MapPin } from 'lucide-react';
import { PriorityBadge } from '@/components/ui/Badge'; 
import type { Occurrence } from '@/features/occurrences/types/index';

interface OccurrenceListItemProps {
  occurrence: Occurrence;
}

export const OccurrenceListItem = ({ occurrence }: OccurrenceListItemProps) => {
  const navigate = useNavigate();

  // helper para cor da barra lateral de acordo com a prioridade
  const getBorderColor = (priority: string) => {
    switch (priority) {
      case 'crítica': return 'bg-red-500';
      case 'alta': return 'bg-orange-500';
      default: return 'bg-emerald-500';
    }
  };

  return (
    <div 
      onClick={() => navigate(`/occurrences/${occurrence.id}`)} 
      className="bg-[var(--bg-panel)] border border-[var(--border-color)] rounded-xl p-5 hover:border-emerald-500/50 hover:shadow-md transition-all cursor-pointer group relative overflow-hidden"
    >
      {/* barra lateral */}
      <div className={`absolute left-0 top-0 bottom-0 w-1 ${getBorderColor(occurrence.priority)}`} />

      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4 pl-2">
        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span className="text-[var(--text-muted)] font-mono text-xs bg-[var(--bg-background)] px-2 py-1 rounded border border-[var(--border-color)]">
              {occurrence.id}
            </span>
            
            <PriorityBadge priority={occurrence.priority} />
            
            <span className="px-2.5 py-0.5 bg-[var(--bg-background)] text-[var(--text-main)] rounded-full text-xs border border-[var(--border-color)] font-medium">
              {occurrence.status}
            </span>
            
            {occurrence.category === 'Herdada de Turno' && (
              <span className="px-2 py-0.5 bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded-full text-xs border border-amber-500/20 flex items-center gap-1">
                <Clock className="w-3 h-3" /> Herdada
              </span>
            )}
          </div>

          <h3 className="text-lg font-semibold text-[var(--text-main)] group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
            {occurrence.title}
          </h3>
          <p className="text-[var(--text-muted)] text-sm line-clamp-2 mt-1">
            {occurrence.description}
          </p>
        </div>

        <div className="text-sm text-[var(--text-muted)] space-y-1.5 min-w-[140px] flex flex-col items-start lg:items-end border-t lg:border-t-0 border-[var(--border-color)] pt-3 lg:pt-0 mt-2 lg:mt-0">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-emerald-500/70" />
            {occurrence.createdAt}
          </div>
          
          {occurrence.location && (
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-blue-500/70" />
              {typeof occurrence.location === 'object' 
                ? `${occurrence.location.alimentador} - ${occurrence.location.subestacao}` 
                : occurrence.location}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};