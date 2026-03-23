import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useOccurrenceStore } from '@/features/occurrences/stores/useOccurrenceStore';
import { getShiftHandoverData } from '@/features/occurrences/services/occurrenceService';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { api } from '@/services/api';
import {
  getCreatedThisShiftOccurrenceIds,
  getSelectedInheritedIds,
  hasCompletedInheritedSelection,
  setInheritedSelectionCompleted,
  setSelectedInheritedIds,
} from '@/features/occurrences/utils/handoverPersistence';
import type { ShiftHandoverData } from '@/features/occurrences/services/occurrenceService';
import type { Occurrence } from '@/features/occurrences/types';

export const useDashboard = () => {
  const navigate = useNavigate();
  const { user, table } = useAuth();
  const { occurrences, fetchOccurrences, isLoading } = useOccurrenceStore();

  const [handoverData, setHandoverData] = useState<ShiftHandoverData | null>(null);
  const [isHandoverOpen, setIsHandoverOpen] = useState(false);
  const [selectedInheritedIds, setSelectedInheritedIdsState] = useState<string[]>([]);
  const [createdThisShiftIds, setCreatedThisShiftIds] = useState<string[]>([]);
  const [isHandoverRequired, setIsHandoverRequired] = useState(false);

  const [searchTerm, setSearchTerm] = useState('');
  const [priority, setPriority] = useState('todas');
  const [status, setStatus] = useState('todas');

  useEffect(() => {
    fetchOccurrences();
  }, [fetchOccurrences]);

  useEffect(() => {
    if (!user?.id) {
      setSelectedInheritedIdsState([]);
      setCreatedThisShiftIds([]);
      return;
    }

    setSelectedInheritedIdsState(getSelectedInheritedIds(String(user.id)));
    setCreatedThisShiftIds(getCreatedThisShiftOccurrenceIds(String(user.id)));
  }, [user?.id]);

  useEffect(() => {
    const checkHandover = async () => {
      if (!user?.id || !table?.id) return;

      try {
        const data = await getShiftHandoverData();

        // Toda a lógica de localStorage foi removida daqui!
        // Agora confiamos 100% no Back-end: se ele enviou pendências, nós abrimos.
        // Se já assumimos antes, ele envia vazio e o modal não abre.
        if (data && data.occurrences && data.occurrences.length > 0) {
          setHandoverData(data);
          setIsHandoverRequired(true);
          const alreadyCompleted = hasCompletedInheritedSelection(String(user.id));
          setIsHandoverOpen(!alreadyCompleted);
        } else {
          setHandoverData(null);
          setIsHandoverRequired(false);
          setIsHandoverOpen(false);
        }
      } catch (error) {
        // Silenciado propositalmente
      }
    };

    checkHandover();
  }, [user?.id, table?.id]);

  const filteredOccurrences = useMemo(() => {
    return occurrences.filter((occ) => {
      const matchesSearch = (occ.title || '').toLowerCase().includes(searchTerm.toLowerCase());
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
    selectedInheritedIds,
    createdThisShiftIds,
    isHandoverRequired,
    stats,
    filters: { searchTerm, setSearchTerm, priority, setPriority, status, setStatus },
    handover: {
      isOpen: isHandoverOpen,
      data: handoverData,
      handleAcknowledge: async (observation: string, selectedIds: string[]) => {
        if (!handoverData?.occurrences || !user?.id) {
          return;
        }

        const normalizedSelectedIds = selectedIds.map((id) => String(id));
        if (normalizedSelectedIds.length === 0) {
          return;
        }

        const mapped = handoverData.occurrences
          .filter(inherited => normalizedSelectedIds.includes(String(inherited.id)))
          .map(inherited => {
            let validLinkType: "OS" | "External" | undefined = undefined;
            if (inherited.linkType === "OS" || inherited.linkType === "External") {
              validLinkType = inherited.linkType;
            }
            return {
              ...inherited,
              id: inherited.id,
              user_id: user.id,
              authorId: user.id,
              createdBy: inherited.reportedBy || handoverData.previousOperator || 'Sistema',
              description: inherited.description,
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
          const response = await api.post('/occurrences/bulk', { occurrences: mapped });

          const responseList =
            (Array.isArray(response?.data?.data) && response.data.data) ||
            (Array.isArray(response?.data?.occurrences) && response.data.occurrences) ||
            [];

          const persistedIds = responseList.length > 0
            ? responseList.map((occ: { id: string | number }) => String(occ.id))
            : normalizedSelectedIds;

          setSelectedInheritedIds(String(user.id), persistedIds);
          setInheritedSelectionCompleted(String(user.id));
          setSelectedInheritedIdsState(persistedIds);

          if (mapped.length > 0) {
            fetchOccurrences();
          }

          setIsHandoverOpen(false);
        } catch (error) {
          console.error("Erro ao salvar herança:", error);
          alert('Não foi possível salvar as ocorrências herdadas no banco de dados. Tente novamente.');
        }
      }
    }
  };
};