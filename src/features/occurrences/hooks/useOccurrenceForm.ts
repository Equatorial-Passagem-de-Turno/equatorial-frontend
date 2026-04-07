import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useOccurrenceStore } from '../stores/useOccurrenceStore';
import { type Occurrence, type OccurrencePriority, type OccurrenceStatus } from '../types/index';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { api } from '@/services/api';
import axios from 'axios';
import { showErrorModal, showWarningModal } from '@/shared/ui/feedbackModal';

type AssignmentMode = 'operator' | 'desk';

type TargetOperator = {
  id: string;
  name: string;
  deskName?: string;
  deskId?: string;
};

type TargetDesk = {
  id: string;
  name: string;
  code: string;
};

// Estado inicial com TODOS os campos do formulário atualizado
const INITIAL_STATE = {
  title: '',
  category: 'Atendimento ao Cliente',
  priority: 'média' as OccurrencePriority,
  status: 'Aberta' as OccurrenceStatus,
  description: '',
  location: { 
    alimentador: '', 
    subestacao: '', 
    city: '', 
    neighborhood: '', 
    zone: '', 
    address: '', 
    reference: '' 
  },
  osNumero: '',
  attachments: [] as File[],
  assignmentMode: 'operator' as AssignmentMode,
  targetOperatorId: '',
  targetDeskId: '',
};

export const useOccurrenceForm = () => {
  const navigate = useNavigate();
  const { user, role } = useAuth();
  const [formData, setFormData] = useState(INITIAL_STATE);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [targetOperators, setTargetOperators] = useState<TargetOperator[]>([]);
  const [targetDesks, setTargetDesks] = useState<TargetDesk[]>([]);
  const [isLoadingTargets, setIsLoadingTargets] = useState(false);

  const accountRole = String(user?.role || role || '').toLowerCase();
  const isSupervisorCreator = useMemo(
    () => ['supervisor', 'admin', 'adm'].includes(accountRole),
    [accountRole]
  );

  useEffect(() => {
    if (!isSupervisorCreator) return;

    const loadTargets = async () => {
      setIsLoadingTargets(true);
      try {
        const activeOperatorsResponse = await api.get<Array<{
          id: number | string;
          name: string;
          table_id?: number | null;
          table?: string;
          table_code?: string;
        }>>('/shifts/operators/active');

        const activeOperators = activeOperatorsResponse.data || [];

        const operators = activeOperators.map((item) => ({
          id: String(item.id),
          name: item.name,
          deskName: item.table || undefined,
          deskId: item.table_id ? String(item.table_id) : undefined,
        }));

        const deskMap = new Map<string, TargetDesk>();
        activeOperators.forEach((item) => {
          const tableId = item.table_id ? String(item.table_id) : '';
          if (!tableId || deskMap.has(tableId)) return;

          deskMap.set(tableId, {
            id: tableId,
            name: item.table || 'Mesa',
            code: item.table_code || '--',
          });
        });

        const desks = Array.from(deskMap.values());

        setTargetOperators(operators);
        setTargetDesks(desks);

        setFormData((previous) => ({
          ...previous,
          targetOperatorId: previous.targetOperatorId || operators[0]?.id || '',
          targetDeskId: previous.targetDeskId || desks[0]?.id || '',
        }));
      } catch {
        setTargetOperators([]);
        setTargetDesks([]);
      } finally {
        setIsLoadingTargets(false);
      }
    };

    void loadTargets();
  }, [isSupervisorCreator]);

  // Função genérica para atualizar campos de texto
  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Função específica para atualizar location aninhado
  const handleLocationChange = (field: keyof typeof INITIAL_STATE.location, value: string) => {
    setFormData(prev => ({ ...prev, location: { ...prev.location, [field]: value } }));
  };

  // Adiciona arquivos ao formData.attachments e cria previews via ObjectURL
  const handleFileAdd = (files: FileList | null) => {
    if (!files) return;
    const list = Array.from(files);
    setFormData(prev => ({ ...prev, attachments: [...(prev.attachments ?? []), ...list] }));
    const urls = list.map(f => URL.createObjectURL(f));
    setPreviewUrls(prev => [...prev, ...urls]);
  };

  // Remove arquivo do estado e libera objectURL do preview correspondente
  const handleRemoveFile = (index: number) => {
    setFormData(prev => {
      const at = [...(prev.attachments ?? [])];
      at.splice(index, 1);
      return { ...prev, attachments: at };
    });
    setPreviewUrls(prev => {
      const p = [...prev];
      const url = p.splice(index, 1)[0];
      try { URL.revokeObjectURL(url); } catch { console.warn('Failed to revoke object URL:', url); }
      return p;
    });
  };

  // Converte File para Base64 (para enviar via JSON para a API)
  const convertFileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
      reader.readAsDataURL(file);
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Pega a função da store que bate na API
      const { createOccurrence } = useOccurrenceStore.getState();

      // Processa os anexos para Base64 antes de enviar para o Laravel
      const processedAttachments = await Promise.all(
        (formData.attachments || []).map(file => convertFileToBase64(file))
      );

      if (isSupervisorCreator) {
        if (targetOperators.length === 0) {
          await showWarningModal('Nenhum operador com turno em andamento foi encontrado para receber a ocorrência.');
          setIsSubmitting(false);
          return;
        }

        if (formData.assignmentMode === 'operator' && !formData.targetOperatorId) {
          await showWarningModal('Selecione o operador que recebera a ocorrencia.');
          setIsSubmitting(false);
          return;
        }

        if (formData.assignmentMode === 'desk' && !formData.targetDeskId) {
          await showWarningModal('Selecione a mesa que recebera a ocorrencia.');
          setIsSubmitting(false);
          return;
        }

        if (formData.assignmentMode === 'desk' && targetDesks.length === 0) {
          await showWarningModal('Nenhuma mesa com turno em andamento está disponível para receber a ocorrência.');
          setIsSubmitting(false);
          return;
        }
      }

      const newOcc: Partial<Occurrence> = {
        title: formData.title,
        category: formData.category,
        priority: formData.priority,
        status: formData.status,
        description: formData.description,
        location: formData.location as any, 
        linkType: formData.osNumero ? ('OS' as const) : undefined,
        
        linkValue: formData.osNumero || undefined,
        attachments: processedAttachments, 
      };

      if (isSupervisorCreator) {
        newOcc.assigned_operator_id = formData.assignmentMode === 'operator'
          ? Number(formData.targetOperatorId)
          : undefined;

        newOcc.assigned_operation_desk_id = formData.assignmentMode === 'desk'
          ? Number(formData.targetDeskId)
          : undefined;
      }

      // Envia para o Laravel!
      await createOccurrence(newOcc);
      
      console.log('Ocorrência Registrada com Sucesso no Banco!');
      navigate('/');
    } catch (error) {
      const apiMessage = axios.isAxiosError(error)
        ? String(error.response?.data?.error || error.response?.data?.message || '')
        : '';

      if (apiMessage) {
        await showErrorModal(apiMessage);
      } else {
        await showErrorModal('Nao foi possivel salvar a ocorrência. Tente novamente.');
      }

      console.error("Erro ao salvar ocorrência:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    formData,
    previewUrls,
    isSubmitting,
    isSupervisorCreator,
    targetOperators,
    targetDesks,
    isLoadingTargets,
    isCritical: formData.priority === 'crítica',
    handleChange,
    handleLocationChange,
    handleFileAdd,
    handleRemoveFile,
    handleSubmit,
  };
};