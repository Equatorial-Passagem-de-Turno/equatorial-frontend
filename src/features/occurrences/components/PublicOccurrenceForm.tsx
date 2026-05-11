import { useMemo, useState } from 'react';
import { Loader2, Paperclip, Send, X } from 'lucide-react';
import { api } from '@/services/api';
import { toast } from 'sonner';

interface PublicOccurrenceFormProps {
  onSuccess?: () => void;
}

type PublicOccurrenceFormState = {
  title: string;
  description: string;
  reporterName: string;
  reporterContact: string;
  sector: string;
  contractAccount: string;
  noteNumber: string;
  city: string;
  neighborhood: string;
  address: string;
  reference: string;
};

const INITIAL_STATE: PublicOccurrenceFormState = {
  title: '',
  description: '',
  reporterName: '',
  reporterContact: '',
  sector: '',
  contractAccount: '',
  noteNumber: '',
  city: '',
  neighborhood: '',
  address: '',
  reference: '',
};

const DEFAULT_CATEGORY = 'Atendimento ao Cliente';
const DEFAULT_PRIORITY = 'média';
const DEFAULT_STATUS = 'Aberta';

export const PublicOccurrenceForm = ({ onSuccess }: PublicOccurrenceFormProps) => {
  const [formData, setFormData] = useState(INITIAL_STATE);
  const [attachments, setAttachments] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const inputClass =
    'w-full rounded-xl px-4 py-3 transition-all outline-none border focus:ring-2 focus:ring-emerald-500/30 bg-white border-slate-200 text-slate-900 placeholder:text-slate-400 dark:bg-slate-950/70 dark:border-slate-700 dark:text-white dark:placeholder:text-slate-500';
  const labelClass = 'block text-sm font-semibold mb-2 text-slate-700 dark:text-slate-200';

  const handleChange = (field: keyof PublicOccurrenceFormState, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleFileAdd = (files: FileList | null) => {
    if (!files) return;
    const list = Array.from(files);
    setAttachments((prev) => [...prev, ...list]);
  };

  const handleRemoveFile = (index: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  };

  const convertFileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
      reader.readAsDataURL(file);
    });
  };

  const contactComment = useMemo(() => {
    const parts = [
      formData.reporterName ? `Nome: ${formData.reporterName}` : null,
      formData.reporterContact ? `Contato: ${formData.reporterContact}` : null,
    ].filter(Boolean);

    if (parts.length === 0) return null;

    return {
      id: `ext-${Date.now()}`,
      author: 'Externo',
      type: 'Contato',
      text: parts.join(' | '),
      createdAt: new Date().toISOString(),
    };
  }, [formData.reporterName, formData.reporterContact]);

  const serviceIdentifierComment = useMemo(() => {
    const parts = [
      formData.contractAccount.trim() ? `Conta contrato: ${formData.contractAccount.trim()}` : null,
      formData.noteNumber.trim() ? `Número da nota: ${formData.noteNumber.trim()}` : null,
    ].filter(Boolean);

    if (parts.length === 0) return null;

    return {
      id: `ext-id-${Date.now()}`,
      author: 'Externo',
      type: 'Identificação',
      text: parts.join(' | '),
      createdAt: new Date().toISOString(),
    };
  }, [formData.contractAccount, formData.noteNumber]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!formData.reporterName.trim() || !formData.reporterContact.trim() || !formData.sector.trim()) {
      toast.warning('Campos obrigatórios', {
        description: 'Informe seu nome, contato e o setor da ocorrência.',
      });
      return;
    }

    if (!formData.title.trim() || !formData.description.trim()) {
      toast.warning('Campos obrigatórios', {
        description: 'Informe o assunto e a descrição da ocorrência.',
      });
      return;
    }

    if (!formData.contractAccount.trim() && !formData.noteNumber.trim()) {
      toast.warning('Campos obrigatórios', {
        description: 'Informe a conta contrato ou o número da nota.',
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const processedAttachments = await Promise.all(
        attachments.map((file) => convertFileToBase64(file))
      );

      const location = {
        sector: formData.sector.trim(),
        city: formData.city.trim(),
        neighborhood: formData.neighborhood.trim(),
        address: formData.address.trim(),
        reference: formData.reference.trim(),
      };

      const hasLocation = Object.values(location).some((value) => value.length > 0);

      const payload = {
        title: formData.title.trim(),
        category: DEFAULT_CATEGORY,
        priority: DEFAULT_PRIORITY,
        status: DEFAULT_STATUS,
        description: formData.description.trim(),
        location: hasLocation ? location : undefined,
        linkType: 'External',
        attachments: processedAttachments.length > 0 ? processedAttachments : undefined,
        comments: [contactComment, serviceIdentifierComment].filter(Boolean),
      };

      await api.post('/occurrences/public', payload);

      toast.success('Ocorrência enviada', {
        description: 'A ocorrência foi registrada e seguirá para supervisão.',
      });

      setFormData(INITIAL_STATE);
      setAttachments([]);
      onSuccess?.();
    } catch (error) {
      toast.error('Não foi possível enviar', {
        description: 'Tente novamente em instantes.',
      });
      console.error('Erro ao enviar ocorrência externa:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className={labelClass}>Seu nome *</label>
          <input
            type="text"
            required
            value={formData.reporterName}
            onChange={(e) => handleChange('reporterName', e.target.value)}
            className={inputClass}
            placeholder="Ex: Maria Souza"
          />
        </div>
        <div>
          <label className={labelClass}>Contato (telefone ou e-mail) *</label>
          <input
            type="text"
            required
            value={formData.reporterContact}
            onChange={(e) => handleChange('reporterContact', e.target.value)}
            className={inputClass}
            placeholder="Ex: (99) 99999-0000"
          />
        </div>
      </div>

      <div>
        <label className={labelClass}>Assunto da ocorrência *</label>
        <input
          type="text"
          required
          value={formData.title}
          onChange={(e) => handleChange('title', e.target.value)}
          className={inputClass}
          placeholder="Ex: Falta de energia no bairro"
        />
      </div>

      <div>
        <label className={labelClass}>Descrição *</label>
        <textarea
          required
          rows={4}
          value={formData.description}
          onChange={(e) => handleChange('description', e.target.value)}
          className={`${inputClass} resize-none`}
          placeholder="Descreva o que aconteceu, ponto de referência e qualquer detalhe importante."
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className={labelClass}>Setor *</label>
          <input
            type="text"
            required
            value={formData.sector}
            onChange={(e) => handleChange('sector', e.target.value)}
            className={inputClass}
            placeholder="Ex: Setor Norte"
          />
        </div>
        <div>
          <label className={labelClass}>Conta contrato</label>
          <input
            type="text"
            value={formData.contractAccount}
            onChange={(e) => handleChange('contractAccount', e.target.value)}
            className={inputClass}
            placeholder="Ex: 123456789"
            aria-required={!formData.noteNumber.trim()}
          />
        </div>
        <div>
          <label className={labelClass}>Número da nota</label>
          <input
            type="text"
            value={formData.noteNumber}
            onChange={(e) => handleChange('noteNumber', e.target.value)}
            className={inputClass}
            placeholder="Ex: 987654321"
            aria-required={!formData.contractAccount.trim()}
          />
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400 md:col-span-2">
          Informe pelo menos uma das opções: conta contrato ou número da nota.
        </p>
        <div>
          <label className={labelClass}>Cidade</label>
          <input
            type="text"
            value={formData.city}
            onChange={(e) => handleChange('city', e.target.value)}
            className={inputClass}
            placeholder="Ex: São Luís"
          />
        </div>
        <div>
          <label className={labelClass}>Bairro</label>
          <input
            type="text"
            value={formData.neighborhood}
            onChange={(e) => handleChange('neighborhood', e.target.value)}
            className={inputClass}
            placeholder="Ex: Centro"
          />
        </div>
      </div>

      <div>
        <label className={labelClass}>Endereço</label>
        <input
          type="text"
          value={formData.address}
          onChange={(e) => handleChange('address', e.target.value)}
          className={inputClass}
          placeholder="Rua, número, complemento"
        />
      </div>

      <div>
        <label className={labelClass}>Ponto de referência</label>
        <input
          type="text"
          value={formData.reference}
          onChange={(e) => handleChange('reference', e.target.value)}
          className={inputClass}
          placeholder="Ex: próximo ao posto X"
        />
      </div>

      <div className="space-y-3">
        <label className={labelClass}>Anexos (opcional)</label>
        <div className="flex flex-wrap items-center gap-3">
          <label className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-600 shadow-sm transition hover:-translate-y-0.5 hover:border-emerald-400 hover:text-emerald-700 dark:border-slate-700 dark:bg-slate-950/60 dark:text-slate-200">
            <Paperclip className="h-4 w-4" />
            Selecionar arquivos
            <input
              type="file"
              multiple
              className="hidden"
              onChange={(e) => handleFileAdd(e.target.files)}
            />
          </label>
          <span className="text-xs text-slate-500 dark:text-slate-400">
            Fotos ou documentos ajudam a agilizar a análise.
          </span>
        </div>

        {attachments.length > 0 && (
          <div className="space-y-2">
            {attachments.map((file, index) => (
              <div
                key={`${file.name}-${index}`}
                className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-600 dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-300"
              >
                <span className="truncate">{file.name}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveFile(index)}
                  className="rounded-full p-1 text-slate-400 transition hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-900/20"
                  aria-label="Remover anexo"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="pt-2">
        <button
          type="submit"
          disabled={isSubmitting}
          className="group flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 via-emerald-600 to-teal-600 px-4 py-3 font-bold text-white shadow-lg shadow-emerald-500/25 transition-all hover:-translate-y-0.5 hover:shadow-emerald-500/40 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          <span>{isSubmitting ? 'Enviando...' : 'Enviar ocorrência'}</span>
        </button>
      </div>
    </form>
  );
};
