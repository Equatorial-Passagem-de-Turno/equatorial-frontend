import React from 'react';
import { useOccurrenceStore } from '../stores/useOccurrenceStore';
import OccurrenceListItem from './OccurrenceListItem';

export const OccurrencesList: React.FC = () => {
  const occurrences = useOccurrenceStore(state => state.occurrences);

  if (!occurrences || occurrences.length === 0) {
    return <div className="p-6 text-slate-400">Nenhuma ocorrência encontrada.</div>;
  }

  return (
    <div className="space-y-4">
      {occurrences.map(o => (
        <OccurrenceListItem key={o.id} occurrence={o} />
      ))}
    </div>
  );
};

export default OccurrencesList;