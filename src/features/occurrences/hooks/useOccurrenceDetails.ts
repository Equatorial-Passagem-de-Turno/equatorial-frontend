import { useEffect, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { useOccurrenceStore } from '../stores/useOccurrenceStore';

export const useOccurrenceDetails = () => {
  const params = useParams();
  const { occurrences, fetchOccurrences, isLoading } = useOccurrenceStore();

  // 1. Normalização dos parâmetros de URL
  const rawParam = params.id ?? params.occurrenceId ?? '';
  
  const normalize = (s?: string) => decodeURIComponent((s ?? '').toString()).trim();
  const clean = (s: string) => s.replace(/^OC-/, '');

  const paramNormalized = normalize(rawParam);
  const paramClean = clean(paramNormalized);

  // 2. Buscar dados se ainda não estiverem carregados
  useEffect(() => {
    // Se a função existir na store, garantimos que os dados mais recentes sejam buscados
    if (fetchOccurrences) {
        void fetchOccurrences({ silent: true });
    }
  }, [fetchOccurrences]);

  // 3. Encontrar a ocorrência específica
  // Usamos useMemo para não recalcular toda vez que o componente renderizar se as dependências não mudarem
  const occurrence = useMemo(() => {
    return occurrences.find(o => {
      const id = o.id;
      const idClean = clean(id);
      return (
        id === paramNormalized || 
        id === rawParam || 
        idClean === paramClean || 
        idClean === paramNormalized || 
        id === decodeURIComponent(rawParam)
      );
    });
  }, [occurrences, paramNormalized, rawParam, paramClean]);

  return {
    occurrence,
    isLoading,
    idReceived: rawParam // Útil para mostrar mensagens de erro com o ID que tentou buscar
  };
};