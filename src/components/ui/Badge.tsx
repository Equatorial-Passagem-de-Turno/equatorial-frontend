export const PriorityBadge = ({ priority }: { priority: string }) => {
  const colors = {
    'crítica': 'bg-red-500/10 text-red-400 border-red-500/30',
    'alta': 'bg-orange-500/10 text-orange-400 border-orange-500/30',
    'média': 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30',
    'baixa': 'bg-blue-500/10 text-blue-400 border-blue-500/30'
  };
  return (
    <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${colors[priority as keyof typeof colors]}`}>
      {priority.toUpperCase()}
    </span>
  );
};
