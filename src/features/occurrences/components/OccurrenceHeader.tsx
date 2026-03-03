import { MapPin, Clock, Users } from 'lucide-react';
import { PriorityBadge } from '../../../components/ui/Badge'; // Ajuste o caminho conforme sua estrutura
import type { Occurrence, OccurrenceLocation } from '../types';

interface OccurrenceHeaderProps {
  occurrence: Occurrence;
}

export const OccurrenceHeader = ({ occurrence }: OccurrenceHeaderProps) => {

  // Lógica de renderização de localização (isolada aqui pois é visual)
  const renderLocation = () => {
    if (!occurrence.location) {
      return <span className="text-slate-400">Localização não informada</span>;
    }

    // Se for string simples
    if (typeof occurrence.location === 'string') {
      return (
        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4" /> 
          {occurrence.location}
        </div>
      );
    }

    // Se for objeto estruturado
    const loc = occurrence.location as OccurrenceLocation;
    
    return (
      <div className="flex flex-col gap-1.5">
        <div className="flex items-start gap-2">
          <MapPin className="w-4 h-4 mt-0.5 text-slate-500" />
          <div>
            <span className="font-medium text-slate-700 dark:text-slate-300">
              {loc.address ? `${loc.address}, ` : ''} {loc.neighborhood ? `${loc.neighborhood} ` : ''}
            </span>
            {(loc.city || loc.zone) && (
              <span className="text-slate-500 dark:text-slate-400"> — {loc.city} {loc.zone ? `(${loc.zone})` : ''}</span>
            )}
            {(!loc.address && !loc.city) && <span className="text-slate-500">Local geográfico não detalhado</span>}
          </div>
        </div>
        
        {/* Chips de Alimentador/Subestação */}
        {(loc.alimentador || loc.subestacao || loc.reference) && (
          <div className="pl-6 flex flex-wrap gap-2 text-xs">
            {loc.alimentador && (
              <span className="bg-blue-50 text-blue-700 border border-blue-100 px-2 py-0.5 rounded-md dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800">
                AL: <b>{loc.alimentador}</b>
              </span>
            )}
            {loc.subestacao && (
              <span className="bg-purple-50 text-purple-700 border border-purple-100 px-2 py-0.5 rounded-md dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-800">
                SE: <b>{loc.subestacao}</b>
              </span>
            )}
            {loc.reference && (
              <span className="text-slate-500 italic flex items-center gap-1 border-l pl-2 border-slate-300 dark:border-slate-700">
                Ref: {loc.reference}
              </span>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="rounded-2xl p-8 bg-white border border-slate-200 dark:bg-slate-900/50 dark:border-slate-800 shadow-sm">
      {/* Topo: ID, Prioridade, Status */}
      <div className="flex items-center gap-3 mb-4">
        <span className="text-slate-400 dark:text-slate-500 font-mono text-lg">{occurrence.id}</span>
        <PriorityBadge priority={occurrence.priority} />
        <span className="px-3 py-1 rounded-full text-xs border bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300">
          {occurrence.status}
        </span>
      </div>

      {/* Título */}
      <h1 className="text-3xl font-bold mb-4 text-slate-900 dark:text-white">
        {occurrence.title}
      </h1>
      
      {/* Meta Dados (Data, Usuário, Local) */}
      <div className="flex flex-col gap-2 mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
        <div className="flex flex-wrap items-center gap-6 text-sm text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4" /> {occurrence.createdAt}
          </div>
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4" /> {occurrence.createdBy}
          </div>
        </div>
        <div className="mt-2">
          {renderLocation()}
        </div>
      </div>

      {/* Descrição */}
      <div className="border-t border-slate-100 dark:border-slate-800 pt-6 mt-6">
        <h3 className="text-lg font-semibold mb-3 text-slate-900 dark:text-white">Descrição Detalhada</h3>
        <p className="leading-relaxed whitespace-pre-wrap text-slate-600 dark:text-slate-300">
          {occurrence.description}
        </p>
      </div>
    </div>
  );
};