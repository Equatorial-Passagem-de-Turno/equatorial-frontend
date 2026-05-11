import { useNavigate } from 'react-router-dom';
import { Clock, FileText, User } from 'lucide-react';
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
        case 'crítica': return 'eq-criticality-bar-critical';
        case 'alta': return 'eq-criticality-bar-high';
        case 'média': return 'eq-criticality-bar-medium';
        default: return 'eq-criticality-bar-low';
     }
  };

  const getStatusStyle = (status: string) => {
    return status === 'Resolvida' ? 'eq-status-success' : 'eq-status-open';
  };

  return (
    <div
      onClick={() => navigate(`/occurrences/${encodeURIComponent(occurrence.id)}`)}
      className="
        eq-event-card eq-card-occurrence group active:scale-[0.99]
      "
    >
      {/* barra lateral de prioridade */}
      <div className={`absolute left-0 top-0 bottom-0 w-1 ${getBorderColor(occurrence.priority)}`} />

      <div className="flex flex-col pl-3">
          <div className="flex justify-between items-start mb-2">
              <div className="flex flex-wrap items-center gap-2">
                  <span className="eq-id-chip">
                    {occurrence.id}
                  </span>
                  <PriorityBadge priority={occurrence.priority} />
                  
                  {isMine && (
                      <span className="p-1 bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400 rounded-full border border-blue-200 dark:border-blue-800" title="Minha autoria">
                        <User className="w-3 h-3"/>
                      </span>
                  )}
                  <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] sm:text-xs border font-bold eq-tone-occurrence">
                    <FileText className="w-3 h-3" />
                    Ocorrência
                  </span>
              </div>
              <span className={`px-2 py-0.5 rounded-full text-[10px] sm:text-xs border font-medium ${getStatusStyle(occurrence.status)}`}>
                {occurrence.status}
              </span>
          </div>
          
          <h3 className="eq-card-title text-base sm:text-lg mb-1 group-hover:text-emerald-600 dark:group-hover:text-emerald-400">
            {occurrence.title}
          </h3>
          <p className="eq-card-description mb-3">
            {occurrence.description}
          </p>
          
          <div className="eq-card-meta flex items-center justify-between pt-3 border-t">
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





