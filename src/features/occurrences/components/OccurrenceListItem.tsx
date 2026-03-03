import React from 'react';
import { Link } from 'react-router-dom';
import type { Occurrence } from '../types/index';

interface Props {
  occurrence: Occurrence;
}

const OccurrenceListItem: React.FC<Props> = ({ occurrence }) => {
  return (
    <Link to={`/occurrences/${encodeURIComponent(occurrence.id)}`}>
      <div>{occurrence.title}</div>
    </Link>
  );
};

export default OccurrenceListItem;