import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../auth/hooks/useAuth';
import { useOccurrenceStore } from '../stores/useOccurrenceStore';
import { type OccurrencePriority, type OccurrenceStatus, type Occurrence } from '../types/index';

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
  const { user } = useAuth();
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
  // Renomeado para 'handleRemoveFile' para bater com o componente
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

  // Converte File para Base64 (para persistir no store/localStorage)
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
      // Processa anexos
      const processedAttachments = await Promise.all(
        (formData.attachments || []).map(file => convertFileToBase64(file))
      );

      // Gera ID no mesmo padrão do display
      const now = new Date();
      const random = Math.floor(1000 + Math.random() * 9000);
      const generatedId = `OC-${now.getFullYear()}${(now.getMonth() + 1).toString().padStart(2, '0')}-${random}`;

      const newOcc: Occurrence = {
        id: generatedId,
        title: formData.title,
        category: formData.category,
        priority: formData.priority,
        status: formData.status,
        description: formData.description,
        // Passamos o objeto completo de location. 
        // O type Occurrence deve suportar 'any' ou a interface correta em 'location'.
        location: formData.location as any, 
        createdAt: new Date().toLocaleString('pt-BR'),
        createdBy: user?.name ?? 'ANÔNIMO',
        linkType: formData.osNumero ? 'OS' : undefined,
        linkValue: formData.osNumero || undefined,
        attachments: processedAttachments,
        comments: [], // Inicia lista de comentários vazia
        reminders: [] // Inicia lista de lembretes vazia
      };

      // Persiste na store
      useOccurrenceStore.getState().addOccurrences([newOcc]);

      console.log('Ocorrência Registrada:', newOcc);
      
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
    handleRemoveFile, // Exportando com o nome correto
    handleSubmit,
  };
};