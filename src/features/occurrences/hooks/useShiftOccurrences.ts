import { useState, useMemo, useEffect } from 'react';
import { useOccurrenceStore } from '../stores/useOccurrenceStore';
import { useAuth } from '../../auth/hooks/useAuth';

export const useShiftOccurrences = () => {
  const { user } = useAuth();
  
  // PEGANDO OS DADOS REAIS DO BANCO DA STORE
  const { occurrences, fetchOccurrences } = useOccurrenceStore();

  // Garante que os dados sejam buscados ao abrir a tela
  useEffect(() => {
    if (fetchOccurrences) {
      void fetchOccurrences({ silent: true });
    }
  }, [fetchOccurrences]);

  const [searchTerm, setSearchTerm] = useState('');
  const [author, setAuthor] = useState('');
  const [priority, setPriority] = useState('todas');
  const [status, setStatus] = useState('todas');
  const [mesa, setMesa] = useState('todas');
  const [base, setBase] = useState('todas');
  const [onlyMine, setOnlyMine] = useState(false);

  // Lógica de Filtragem Segura
  const filteredData = useMemo(() => {
    // Evita erros caso occurrences ainda não tenha carregado e seja undefined
    if (!Array.isArray(occurrences)) return [];

    return occurrences.filter((item) => {
      // Usamos (item.campo || '') para evitar erro de .toLowerCase() em valores nulos do banco
      const titleMatch = (item.title || '').toLowerCase().includes(searchTerm.toLowerCase());
      const descMatch = (item.description || '').toLowerCase().includes(searchTerm.toLowerCase());
      const matchesSearch = titleMatch || descMatch;

      const matchesAuthor = (item.createdBy || '').toLowerCase().includes(author.toLowerCase());
      const matchesPriority = priority === 'todas' || item.priority === priority;
      const matchesStatus = status === 'todas' || item.status === status || (status === 'Pendente' && item.status === 'Aberta');
      
      // Se houver campos 'mesa' e 'base' reais no banco, descomente abaixo:
      // const matchesMesa = mesa === 'todas' || item.mesa === mesa; 
      // const matchesBase = base === 'todas' || item.base === base; 

      const matchesMine = !onlyMine || item.authorId === user?.id;

      return matchesSearch && matchesAuthor && matchesPriority && matchesStatus && matchesMine;
    });
  }, [occurrences, searchTerm, author, priority, status, onlyMine, user?.id]);

  // Estatísticas baseadas no filtro atual
  const stats = useMemo(() => ({
    total: filteredData.length,
    criticas: filteredData.filter(i => i.priority === 'crítica').length,
    pendentes: filteredData.filter(i => i.status === 'Pendente' || i.status === 'Aberta').length,
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