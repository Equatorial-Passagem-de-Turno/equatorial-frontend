import { useState, useMemo } from 'react';

export interface ShiftOccurrence {
  id: string;
  title: string;
  description: string;
  priority: 'crítica' | 'alta' | 'média' | 'baixa';
  status: 'Pendente' | 'Em Análise' | 'Resolvida' | 'Transferida';
  mesa: string;
  base: string;
  
  category: string;     
  createdAt: string;     
  createdBy: string;     
  authorId: string;
}

const MOCK_DATA: ShiftOccurrence[] = [
  { 
    id: '1', 
    title: 'Falha no servidor', 
    description: 'Servidor principal parou de responder...', 
    priority: 'crítica', 
    status: 'Pendente', 
    mesa: 'Mesa 1', 
    base: 'Matriz', 
    category: 'Infraestrutura',  
    createdAt: '2023-10-27T10:00:00', 
    createdBy: 'João Silva',     
    authorId: '123' 
  },
  { 
    id: '2', 
    title: 'Troca de turno', 
    description: 'Passagem de bastão realizada sem ocorrências...', 
    priority: 'média', 
    status: 'Resolvida', 
    mesa: 'Supervisão', 
    base: 'Norte', 
    category: 'Operacional',     
    createdAt: '2023-10-26T18:30:00', 
    createdBy: 'Maria Santos',   
    authorId: '456' 
  },
  { 
    id: '3', 
    title: 'Queda de energia', 
    description: 'Queda momentânea na região sul...', 
    priority: 'alta', 
    status: 'Em Análise', 
    mesa: 'Mesa 1', 
    base: 'Sul', 
    category: 'Infraestrutura',  
    createdAt: '2023-10-25T14:15:00', 
    createdBy: 'João Silva',     
    authorId: '123' 
  },
];

export const useShiftOccurrences = () => {
  const user = { id: '123', name: 'João Silva' };

  const [searchTerm, setSearchTerm] = useState('');
  const [author, setAuthor] = useState('');
  const [priority, setPriority] = useState('todas');
  const [status, setStatus] = useState('todas');
  const [mesa, setMesa] = useState('todas');
  const [base, setBase] = useState('todas');
  const [onlyMine, setOnlyMine] = useState(false);

  // Lógica de Filtragem
  const filteredData = useMemo(() => {
    return MOCK_DATA.filter((item) => {
      // Busca por Texto
      const matchesSearch = 
        item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.description.toLowerCase().includes(searchTerm.toLowerCase());

      // Filtro de Autor
      const matchesAuthor = item.createdBy.toLowerCase().includes(author.toLowerCase());

      // Filtros de Select
      const matchesPriority = priority === 'todas' || item.priority === priority;
      const matchesStatus = status === 'todas' || item.status === status;
      const matchesMesa = mesa === 'todas' || item.mesa === mesa;
      const matchesBase = base === 'todas' || item.base === base;

      // Filtro "Minhas"
      const matchesMine = !onlyMine || item.authorId === user.id;

      return matchesSearch && matchesAuthor && matchesPriority && matchesStatus && matchesMesa && matchesBase && matchesMine;
    });
  }, [searchTerm, author, priority, status, mesa, base, onlyMine, user.id]);

  // Estatísticas
  const stats = useMemo(() => ({
    total: filteredData.length,
    criticas: filteredData.filter(i => i.priority === 'crítica').length,
    pendentes: filteredData.filter(i => i.status === 'Pendente').length,
  }), [filteredData]);

  return {
    user,
    filteredData,
    stats,
    filters: {
      searchTerm, setSearchTerm,
      author, setAuthor,
      priority, setPriority,
      status, setStatus,
      mesa, setMesa,
      base, setBase,
      onlyMine, setOnlyMine,
    }
  };
};