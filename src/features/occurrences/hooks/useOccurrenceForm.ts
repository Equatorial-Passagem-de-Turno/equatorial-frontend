import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useOccurrenceStore } from '../stores/useOccurrenceStore';
import { type Occurrence, type OccurrencePriority, type OccurrenceStatus } from '../types/index';

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
};

export const useOccurrenceForm = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState(INITIAL_STATE);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

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

      // Envia para o Laravel!
      await createOccurrence(newOcc);
      
      console.log('Ocorrência Registrada com Sucesso no Banco!');
      navigate('/');
    } catch (error) {
      console.error("Erro ao salvar ocorrência:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    formData,
    previewUrls,
    isSubmitting,
    isCritical: formData.priority === 'crítica',
    handleChange,
    handleLocationChange,
    handleFileAdd,
    handleRemoveFile,
    handleSubmit,
  };
};