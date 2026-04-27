import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useOccurrenceStore } from '@/features/occurrences/stores/useOccurrenceStore';
import { getShiftHandoverDataCached } from '@/features/occurrences/services/shiftService';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { api } from '@/services/api';
import { showErrorModal } from '@/shared/ui/feedbackModal';
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
  const [currentShiftWorkedDuration, setCurrentShiftWorkedDuration] = useState<string>('--');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [searchTerm, setSearchTerm] = useState('');
  const [priority, setPriority] = useState('todas');
  const [status, setStatus] = useState('todas');

  const getWorkedDurationCacheKey = (userId: string | number) =>
    `dashboard_worked_duration_${String(userId)}`;

  useEffect(() => {
    void fetchOccurrences({ silent: true });
  }, [fetchOccurrences]);

  useEffect(() => {
    if (!user?.id) {
      setCurrentShiftWorkedDuration('--');
      return;
    }

    let isCancelled = false;
    const cacheKey = getWorkedDurationCacheKey(user.id);

    const cached = localStorage.getItem(cacheKey);
    if (cached) {
      setCurrentShiftWorkedDuration(cached);
    } else {
      setCurrentShiftWorkedDuration('--');
    }

    const fetchCurrentShiftDuration = async () => {
      try {
        const response = await api.get('/shifts/current');
        if (isCancelled) return;

        const payload = response?.data;
        if (!payload) return;

        const worked = String(payload?.workedDuration ?? payload?.tempo_trabalhado ?? '--');
        setCurrentShiftWorkedDuration(worked);
        localStorage.setItem(cacheKey, worked);
      } catch {
        // Mantem ultimo valor conhecido para evitar piscar '--' em falha intermitente.
      }
    };

    void fetchCurrentShiftDuration();
    const intervalId = window.setInterval(() => {
      void fetchCurrentShiftDuration();
    }, 60_000);

    return () => {
      isCancelled = true;
      window.clearInterval(intervalId);
    };
  }, [user?.id]);

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
        const data = await getShiftHandoverDataCached() as ShiftHandoverData;

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

  // Lista exibida na tela — aplica search, priority e status
  const filteredOccurrences = useMemo(() => {
    return occurrences.filter((occ) => {
      const matchesSearch = (occ.title || '').toLowerCase().includes(searchTerm.toLowerCase());
      const matchesPriority = priority === 'todas' || occ.priority === priority;
      const matchesStatus = status === 'todas' || occ.status === status || (status === 'Pendente' && occ.status === 'Aberta');
      return matchesSearch && matchesPriority && matchesStatus;
    });
  }, [occurrences, searchTerm, priority, status]);

  // Stats dos cards — calculados sobre as ocorrências BRUTAS (sem filtros de UI)
  // para que os totais nunca mudem ao filtrar a lista
  const baseStats = useMemo(() => {
    const currentUserId = user?.id ? String(user.id) : '';
    const closedStatuses = new Set(['resolvida', 'finalizada', 'cancelada', 'fechada', 'encerrada']);

    const normalizeText = (value: string) =>
      value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();

    const ownedOpen = occurrences.filter((occ) => {
      const authorId = occ.authorId != null ? String(occ.authorId) : '';
      const userId = occ.user_id != null ? String(occ.user_id) : '';
      const isMine = Boolean(currentUserId) && (authorId === currentUserId || userId === currentUserId);
      const normalizedStatus = normalizeText(String(occ.status || ''));
      const apiIsOpen = (occ as { is_open?: boolean }).is_open;
      const isOpen = typeof apiIsOpen === 'boolean'
        ? apiIsOpen
        : normalizedStatus.length === 0 || !closedStatuses.has(normalizedStatus);
      return isMine && isOpen;
    });

    return {
      total: ownedOpen.length,
      criticas: ownedOpen.filter(o => o.priority === 'crítica').length,
      pendentes: ownedOpen.filter(o => o.status === 'Pendente' || o.status === 'Aberta').length,
      analise: ownedOpen.filter(o => o.status === 'Em Análise').length,
    };
  }, [occurrences, user?.id]);

  return {
    navigate,
    isLoading,
    filteredOccurrences,
    selectedInheritedIds,
    createdThisShiftIds,
    currentShiftWorkedDuration,
    isHandoverRequired,
    baseStats,
    filters: { searchTerm, setSearchTerm, priority, setPriority, status, setStatus },
    handover: {
      isOpen: isHandoverOpen,
      isSubmitting,
      data: handoverData,
      handleAcknowledge: async (observation: string, selectedIds: string[]) => {
        if (!handoverData?.occurrences || !user?.id) {
          void showErrorModal('Sessão inválida. Recarregue a página e tente novamente.');
          return;
        }

        const normalizedSelectedIds = selectedIds.map((id) => String(id));
        if (normalizedSelectedIds.length === 0) {
          void showErrorModal('Selecione pelo menos uma ocorrência para assumir.');
          return;
        }

        const mapped = handoverData.occurrences
          .filter(inherited => normalizedSelectedIds.includes(String(inherited.id)))
          .map(inherited => {
            let validLinkType: 'OS' | 'External' | undefined = undefined;
            if (inherited.linkType === 'OS' || inherited.linkType === 'External') {
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
              comments: observation
                ? [{
                    id: `obs-${Date.now()}`,
                    author: user.name,
                    text: `Observação no recebimento: ${observation}`,
                    type: 'Geral',
                    createdAt: new Date().toISOString(),
                  }]
                : [],
            } as Occurrence;
          });

        setIsSubmitting(true);
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
            void fetchOccurrences({ force: true, silent: true });
          }

          setIsHandoverOpen(false);
        } catch (error) {
          console.error('Erro ao salvar herança:', error);
          void showErrorModal('Não foi possível salvar as ocorrências herdadas no banco de dados. Tente novamente.');
        } finally {
          setIsSubmitting(false);
        }
      },
    },
  };
};