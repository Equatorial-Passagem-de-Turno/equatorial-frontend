import { useNavigate } from 'react-router-dom';
import { User, Clock } from 'lucide-react';
import { PriorityBadge } from '@/components/ui/Badge'; 
import type { Occurrence } from '@/features/occurrences/types';

interface ShiftOccurrenceItemProps {
  occurrence: Occurrence;
  currentUser?: { name?: string };
}

export const ShiftOccurrenceItem = ({ occurrence, currentUser }: ShiftOccurrenceItemProps) => {
  const navigate = useNavigate();
  const userName = currentUser?.name?.toLowerCase() || '';
  const isMine = userName && occurrence.createdBy.toLowerCase().includes(userName);

  const displayDate = occurrence.createdAt.includes('T') 
    ? new Date(occurrence.createdAt).toLocaleDateString() + ' ' + new Date(occurrence.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
    : occurrence.createdAt;

  const getBorderColor = (priority: string) => {
     switch(priority) {
        case 'crítica': return 'bg-red-500';
        case 'alta': return 'bg-orange-500';
        case 'média': return 'bg-amber-500';
        default: return 'bg-emerald-500';
     }
  };

  const getStatusStyle = (status: string) => {
    return status === 'Resolvida' 
      ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800' 
      : 'bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700';
  };

  return (
    <div
      onClick={() => navigate(`/occurrences/${encodeURIComponent(occurrence.id)}`)}
      className="
        rounded-xl p-4 sm:p-5 transition-all cursor-pointer group border shadow-sm relative overflow-hidden
        bg-white border-slate-200 active:scale-[0.99]
        dark:bg-slate-900/50 dark:border-slate-800 dark:backdrop-blur-xl dark:shadow-none
        hover:border-emerald-500/50 hover:shadow-lg hover:shadow-emerald-500/10
        dark:hover:border-emerald-500/50 dark:hover:shadow-emerald-900/20
      "
    >
      {/* barra lateral de prioridade */}
      <div className={`absolute left-0 top-0 bottom-0 w-1 ${getBorderColor(occurrence.priority)}`} />

      <div className="flex flex-col pl-3">
          <div className="flex justify-between items-start mb-2">
              <div className="flex flex-wrap items-center gap-2">
                  <span className="font-mono text-[10px] sm:text-xs font-bold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-700">
                    {occurrence.id}
                  </span>
                  <PriorityBadge priority={occurrence.priority} />
                  
                  {isMine && (
                      <span className="p-1 bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400 rounded-full border border-blue-200 dark:border-blue-800" title="Minha autoria">
                        <User className="w-3 h-3"/>
                      </span>
                  )}
              </div>
              <span className={`px-2 py-0.5 rounded-full text-[10px] sm:text-xs border font-medium ${getStatusStyle(occurrence.status)}`}>
                {occurrence.status}
              </span>
          </div>
          
          <h3 className="text-base sm:text-lg font-semibold text-slate-900 dark:text-white mb-1 leading-snug group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
            {occurrence.title}
          </h3>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 line-clamp-2 mb-3">
            {occurrence.description}
          </p>
          
          <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-400">
             <div className="flex items-center gap-1.5">
                <User className="w-3.5 h-3.5" /> 
                <span className="font-medium truncate max-w-[100px] sm:max-w-none">{occurrence.createdBy}</span>
             </div>
             <div className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" />
                <span>{displayDate}</span>
             </div>
          </div>
      </div>
    </div>
  );
};