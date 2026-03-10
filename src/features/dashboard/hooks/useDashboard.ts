import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useOccurrenceStore } from '@/features/occurrences/stores/useOccurrenceStore';
import { getShiftHandoverData } from '@/features/occurrences/services/occurrenceService';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { api } from '@/services/api';
import type { ShiftHandoverData } from '@/features/occurrences/services/occurrenceService';
import type { Occurrence } from '@/features/occurrences/types';

export const useDashboard = () => {
  const navigate = useNavigate();
  const { user, table } = useAuth(); // Usando table.id para identificar o ciclo atual
  const { occurrences, fetchOccurrences, isLoading, addOccurrences } = useOccurrenceStore();

  const [handoverData, setHandoverData] = useState<ShiftHandoverData | null>(null);
  const [isHandoverOpen, setIsHandoverOpen] = useState(false);

  const [searchTerm, setSearchTerm] = useState('');
  const [priority, setPriority] = useState('todas');
  const [status, setStatus] = useState('todas');

  // 1. Busca inicial de ocorrências do banco
  useEffect(() => {
    fetchOccurrences();
  }, [fetchOccurrences]);

  // 2. Lógica do Modal (Aparece apenas UMA vez por sessão de mesa ativa)
  useEffect(() => {
    const checkHandover = async () => {
      if (!user?.id || !table?.id) return;

      // Chave única: Se mudar o usuário ou a mesa, o modal pode aparecer de novo
      const storageKey = `handover_done_${user.id}_${table.id}`;
      const alreadyDone = localStorage.getItem(storageKey);

      if (alreadyDone === 'true') return;

      try {
        const data = await getShiftHandoverData();
        if (data && data.occurrences && data.occurrences.length > 0) {
          setHandoverData(data);
          setIsHandoverOpen(true);
        }
      } catch (error) {
        console.error("Erro ao buscar dados de herança:", error);
      }
    };

    checkHandover();
  }, [user?.id, table?.id]);

  const filteredOccurrences = useMemo(() => {
    return occurrences.filter((occ) => {
      const title = occ.title || '';
      const desc = occ.description || '';
      const matchesSearch = title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            desc.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesPriority = priority === 'todas' || occ.priority === priority;
      const matchesStatus = status === 'todas' || occ.status === status;
      return matchesSearch && matchesPriority && matchesStatus;
    });
  }, [occurrences, searchTerm, priority, status]);

  const stats = useMemo(() => ({
    total: filteredOccurrences.length,
    criticas: filteredOccurrences.filter(o => o.priority === 'crítica').length,
    pendentes: filteredOccurrences.filter(o => o.status === 'Pendente' || o.status === 'Aberta').length,
    analise: filteredOccurrences.filter(o => o.status === 'Em Análise').length,
  }), [filteredOccurrences]);

  return {
    navigate,
    isLoading,
    filteredOccurrences,
    stats,
    filters: { searchTerm, setSearchTerm, priority, setPriority, status, setStatus },
    handover: {
      isOpen: isHandoverOpen,
      data: handoverData,
      handleAcknowledge: async (observation: string, selectedIds: string[]) => {
        if (handoverData?.occurrences && user?.id) {
          // Filtra apenas o que o usuário marcou no checkbox do modal
          const mapped = handoverData.occurrences
            .filter(inherited => selectedIds.includes(inherited.id))
            .map(inherited => {
              let validLinkType: "OS" | "External" | undefined = undefined;
              if (inherited.linkType === "OS" || inherited.linkType === "External") {
                validLinkType = inherited.linkType;
              }
              return {
                ...inherited,
                user_id: user.id,
                authorId: user.id,
                createdBy: inherited.reportedBy || handoverData.previousOperator || 'Sistema',
                description: `${inherited.description}\n\n[HERDADA DO TURNO ANTERIOR]`,
                createdAt: new Date().toLocaleString('pt-BR'),
                linkType: validLinkType,
                comments: observation ? [{
                  id: `obs-${Date.now()}`,
                  author: user.name,
                  text: `Observação no recebimento: ${observation}`,
                  type: 'Geral',
                  createdAt: new Date().toISOString()
                }] : []
              } as Occurrence;
            });

          try {
            if (mapped.length > 0) {
              await api.post('/occurrences/bulk', { occurrences: mapped });
              addOccurrences(mapped);
            }
            // MARCA COMO FINALIZADO: Impede que o modal reabra no F5
            localStorage.setItem(`handover_done_${user.id}_${table?.id}`, 'true');
          } catch (error) {
            console.error("Erro ao salvar herança:", error);
          }
        }
        setIsHandoverOpen(false);
      }
    }
  };
};