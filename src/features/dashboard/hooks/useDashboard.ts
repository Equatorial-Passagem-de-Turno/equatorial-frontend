import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useAuth } from '../../auth/hooks/useAuth';
import { useOccurrenceStore } from '@/features/occurrences/stores/useOccurrenceStore';
import { getShiftHandoverData, type ShiftHandoverData } from '@/features/occurrences/services/occurrenceService';
import { type Occurrence } from '@/features/occurrences/types/index';

export const useDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { occurrences, addOccurrences, fetchOccurrences, isLoading } = useOccurrenceStore();

  // filtros
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPriority, setFilterPriority] = useState('todas');
  const [filterStatus, setFilterStatus] = useState('todas');

  // turno
  const [handoverData, setHandoverData] = useState<ShiftHandoverData | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // carregar as ocorrencias
  useEffect(() => {
    if (fetchOccurrences) fetchOccurrences();
  }, [fetchOccurrences]);

  // logica do turno - verificar se ja viu o turno anterior
  useEffect(() => {
    if (!user?.id) return;
    const storageKey = `handover_viewed_${user.id}`;
    if (sessionStorage.getItem(storageKey)) return;

    const checkHandover = async () => {
      try {
        const data = await getShiftHandoverData();
        if (data) {
          setHandoverData(data);
          setIsModalOpen(true);
        }
      } catch (error) {
        console.error("Erro ao buscar dados do turno anterior", error);
      }
    };
    checkHandover();
  }, [user?.id]);

  const handleHandoverAcknowledge = (observation: string) => {
    if (observation) console.log("Observação:", observation);
    if (user?.id) sessionStorage.setItem(`handover_viewed_${user.id}`, 'true');

    if (handoverData?.occurrences.length) {
        const newOccurrences: Occurrence[] = handoverData.occurrences.map(inh => ({
            id: inh.id,
            title: inh.title,
            description: inh.description,
            priority: inh.priority, 
            status: 'Pendente', 
            category: 'Herdada de Turno',
            location: inh.location, 
            createdAt: inh.createdAt || inh.timestamp, 
            createdBy: inh.reportedBy.toUpperCase(),
            linkType: inh.linkType as 'OS' | undefined, 
            linkValue: inh.linkValue,
            attachments: inh.attachments || [],
            comments: [], 
            reminders: [] 
        }));
        addOccurrences(newOccurrences);
    }
    setIsModalOpen(false);
    toast.success('Turno Iniciado!');
  };

  // logica de filtragem das ocorrencias
  const filteredOccurrences = useMemo(() => {
    const priorityRank: Record<string, number> = { 'crítica': 4, 'alta': 3, 'média': 2, 'baixa': 1 };
    
    return occurrences
      .filter(occ => (
        (occ.title.toLowerCase().includes(searchTerm.toLowerCase()) || occ.id.toLowerCase().includes(searchTerm.toLowerCase()))
        && (filterPriority === 'todas' || occ.priority === filterPriority)
        && (filterStatus === 'todas' || occ.status === filterStatus)
      ))
      .sort((a, b) => (priorityRank[b.priority] || 0) - (priorityRank[a.priority] || 0));
  }, [occurrences, searchTerm, filterPriority, filterStatus]);

  // estatisticas rapidas
  const stats = {
    total: occurrences.length,
    criticas: occurrences.filter(o => o.priority === 'crítica').length,
    pendentes: occurrences.filter(o => o.status === 'Pendente').length,
    analise: occurrences.filter(o => o.status === 'Em Análise').length,
  };

  return {
    user,
    navigate,
    isLoading,
    occurrences, 
    filteredOccurrences, 
    stats,
    filters: {
      searchTerm, setSearchTerm,
      priority: filterPriority, setPriority: setFilterPriority,
      status: filterStatus, setStatus: setFilterStatus
    },
    handover: {
      data: handoverData,
      isOpen: isModalOpen,
      handleAcknowledge: handleHandoverAcknowledge,
      setIsOpen: setIsModalOpen
    }
  };
};