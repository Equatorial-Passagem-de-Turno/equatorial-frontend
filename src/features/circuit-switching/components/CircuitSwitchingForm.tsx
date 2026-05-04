import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CalendarClock,
  CircuitBoard,
  Clock3,
  FileClock,
  Loader2,
  RotateCcw,
  Save,
  Users,
  Wrench,
} from 'lucide-react';
import { api } from '@/services/api';
import { showSuccessModal, showWarningModal } from '@/shared/ui/feedbackModal';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { FileAttachmentField } from './FileAttachmentField';
import type { CircuitAttachment, CircuitDeadlineEntry, CircuitSwitchingRecord } from '../types';

const STORAGE_KEY = 'circuit_switching_records_v1';

const causeOptions = [
  'Manobra programada',
  'Emergencial',
  'Transferência de carga',
  'Manutenção corretiva',
  'Manutenção preventiva',
  'Falha de equipamento',
  'Solicitação operacional',
];

const sectorOptions = [
  'COD',
  'Operação',
  'Manutenção',
  'Proteção e controle',
  'Subestações',
  'Distribuição',
  'Terceirizada',
];

const getAttachmentType = (file: File): CircuitAttachment['type'] => {
  if (file.type.startsWith('image/')) return 'image';
  if (file.type.startsWith('video/')) return 'video';
  if (file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')) return 'pdf';
  return 'document';
};

const generateCircuitId = () => {
  const now = new Date();
  const date = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}`;
  const random = Math.floor(1000 + Math.random() * 9000);
  return `CM-${date}-${random}`;
};

const formatDateTime = (value: string) => {
  if (!value) return '--';
  return new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(new Date(value));
};

export const CircuitSwitchingForm = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const authorName = user?.name?.trim() || user?.email || 'Autor não informado';
  const [generatedId] = useState(generateCircuitId);
  const [feeder, setFeeder] = useState('');
  const [equipment, setEquipment] = useState('');
  const [affectedCustomers, setAffectedCustomers] = useState('');
  const [responsibleSector, setResponsibleSector] = useState('');
  const [currentDeadline, setCurrentDeadline] = useState('');
  const [deadlineReason, setDeadlineReason] = useState('');
  const [deadlineHistory, setDeadlineHistory] = useState<CircuitDeadlineEntry[]>([]);
  const [description, setDescription] = useState('');
  const [observations, setObservations] = useState('');
  const [cause, setCause] = useState('');
  const [attachments, setAttachments] = useState<CircuitAttachment[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const formTitle = useMemo(() => {
    if (feeder && equipment) return `${feeder} - ${equipment}`;
    if (feeder) return feeder;
    return 'Novo registro de circuito manobrado';
  }, [equipment, feeder]);

  const inputClass = 'w-full rounded-xl px-5 py-4 transition-all outline-none border focus:ring-2 focus:ring-blue-500/50 bg-white border-slate-300 text-slate-900 placeholder:text-slate-400 dark:bg-slate-950/70 dark:border-slate-700 dark:text-white dark:placeholder:text-slate-500';
  const labelClass = 'block text-sm font-semibold mb-2 text-slate-700 dark:text-slate-300';
  const compactLabelClass = 'block text-xs font-semibold mb-2 uppercase text-slate-500 dark:text-slate-400';

  const handleFileAdd = (files: FileList | null) => {
    if (!files) return;

    const mapped = Array.from(files).map((file) => ({
      id: `${file.name}-${file.lastModified}-${crypto.randomUUID()}`,
      name: file.name,
      url: URL.createObjectURL(file),
      type: getAttachmentType(file),
      rawFile: file,
    }));

    setAttachments((current) => [...current, ...mapped]);
  };

  const handleFileRemove = (id: string) => {
    setAttachments((current) => {
      const removed = current.find((attachment) => attachment.id === id);
      if (removed) URL.revokeObjectURL(removed.url);
      return current.filter((attachment) => attachment.id !== id);
    });
  };

  const handleDeadlineChange = async () => {
    if (!currentDeadline) {
      await showWarningModal('Informe um prazo antes de registrar no histórico.');
      return;
    }

    setDeadlineHistory((current) => [
      {
        id: crypto.randomUUID(),
        value: currentDeadline,
        reason: deadlineReason.trim() || 'Prazo informado pela equipe',
        registeredAt: new Date().toISOString(),
      },
      ...current,
    ]);
    setDeadlineReason('');
  };

  const resetForm = () => {
    setFeeder('');
    setEquipment('');
    setAffectedCustomers('');
    setResponsibleSector('');
    setCurrentDeadline('');
    setDeadlineReason('');
    setDeadlineHistory([]);
    setDescription('');
    setObservations('');
    setCause('');
    attachments.forEach((attachment) => URL.revokeObjectURL(attachment.url));
    setAttachments([]);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!currentDeadline) {
      await showWarningModal('Informe o prazo atual da manobra.');
      return;
    }

    setIsSubmitting(true);

    try {
      const activeShift = JSON.parse(localStorage.getItem('current_shift') || '{}');
      const shiftId = activeShift?.id || 1;

      const formData = new FormData();
      
      formData.append('shift_id', shiftId.toString());
      formData.append('feeder', feeder);
      formData.append('equipment', equipment);
      if (affectedCustomers) {
        formData.append('affected_clients', parseInt(affectedCustomers, 10).toString());
      }
      formData.append('responsible_sector', responsibleSector);
      formData.append('reason', `${cause} - ${description}`);
      formData.append('observations', observations);
      formData.append('deadline', currentDeadline);

      attachments.forEach((attachment: any) => {
        if (attachment.rawFile) {
          formData.append('attachments[]', attachment.rawFile);
        }
      });

      await api.post('/circuit-switchings', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      await showSuccessModal(`Circuito manobrado registrado com sucesso!`);
      resetForm();

    } catch (error: any) {
      console.error('Erro ao salvar no backend:', error);
      await showWarningModal(
        error.response?.data?.message || 'Erro ao comunicar com o servidor. Tente novamente.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-7 animate-fade-in relative z-10 pb-10">
      <div className="flex items-center gap-5 mb-8 p-6 bg-white dark:bg-slate-900/50 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="p-4 rounded-2xl transition-all duration-500 border-2 bg-blue-50 border-blue-100 text-blue-600 dark:bg-blue-950/30 dark:border-blue-900/50 dark:text-blue-400">
          <CircuitBoard className="w-10 h-10" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 flex-wrap">
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white uppercase tracking-tight">
              {generatedId}
            </h2>
            
          </div>
          <p className="text-slate-500 dark:text-slate-400 text-lg font-medium mt-1 truncate">
            {formTitle}
          </p>
        </div>
      </div>

      <div className="p-8 rounded-2xl border bg-slate-50 border-slate-200 dark:bg-slate-900/30 dark:border-slate-800/50 space-y-6 shadow-inner">
        <div className="flex items-center gap-3 mb-4 text-slate-600 dark:text-slate-300 border-b border-slate-200 dark:border-slate-800 pb-4">
          <div className="p-2 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg">
            <Wrench className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider">Dados da manobra</h3>
            <p className="text-xs text-slate-500 dark:text-slate-500">
              Informe o circuito, equipamento e impacto operacional
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className={compactLabelClass}>Alimentador *</label>
            <input required type="text" value={feeder} onChange={(event) => setFeeder(event.target.value)} className={inputClass} placeholder="Ex: AL-04" />
          </div>
          <div>
            <label className={compactLabelClass}>Equipamento *</label>
            <input required type="text" value={equipment} onChange={(event) => setEquipment(event.target.value)} className={inputClass} placeholder="Ex: Religador R-1234" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className={compactLabelClass}>Clientes afetados</label>
            <div className="relative">
              <Users className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input type="number" min="0" value={affectedCustomers} onChange={(event) => setAffectedCustomers(event.target.value)} className={`${inputClass} pl-12`} placeholder="0" />
            </div>
          </div>
          <div>
            <label className={compactLabelClass}>Setor responsável *</label>
            <select required value={responsibleSector} onChange={(event) => setResponsibleSector(event.target.value)} className={inputClass}>
              <option value="">Selecione...</option>
              {sectorOptions.map((sector) => <option key={sector} value={sector}>{sector}</option>)}
            </select>
          </div>
          <div>
            <label className={compactLabelClass}>Causa da manobra *</label>
            <select required value={cause} onChange={(event) => setCause(event.target.value)} className={inputClass}>
              <option value="">Selecione...</option>
              {causeOptions.map((option) => <option key={option} value={option}>{option}</option>)}
            </select>
          </div>
        </div>
      </div>

      <div className="p-8 rounded-2xl border bg-amber-50/50 border-amber-100 dark:bg-amber-950/10 dark:border-amber-900/30 space-y-6">
        <div className="flex items-center gap-3 text-slate-700 dark:text-slate-200">
          <div className="p-2 bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 rounded-lg">
            <CalendarClock className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider">Prazo e histórico</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Atualize o prazo quando a equipe solicitar uma nova previsão
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_1fr_auto] gap-4 items-end">
          <div>
            <label className={labelClass}>Prazo atual *</label>
            <input required type="datetime-local" value={currentDeadline} onChange={(event) => setCurrentDeadline(event.target.value)} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Motivo/observação do prazo</label>
            <input type="text" value={deadlineReason} onChange={(event) => setDeadlineReason(event.target.value)} className={inputClass} placeholder="Ex: Equipe solicitou mais 30 minutos" />
          </div>
          <button type="button" onClick={handleDeadlineChange} className="h-[58px] px-5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold flex items-center justify-center gap-2 transition-colors">
            <FileClock className="w-5 h-5" />
            Registrar prazo
          </button>
        </div>

        <div className="rounded-xl border border-amber-100 dark:border-amber-900/40 bg-white/70 dark:bg-slate-950/40 overflow-hidden">
          <div className="px-5 py-3 border-b border-amber-100 dark:border-amber-900/40 flex items-center gap-2 text-sm font-bold text-slate-700 dark:text-slate-200">
            <Clock3 className="w-4 h-4 text-amber-600" />
            Histórico de prazos
          </div>
          {deadlineHistory.length === 0 ? (
            <div className="p-5 text-sm text-slate-500 dark:text-slate-400">
              Nenhum prazo registrado no histórico. Ao salvar, o prazo atual será guardado como prazo inicial.
            </div>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {deadlineHistory.map((entry, index) => (
                <div key={entry.id} className="p-5 flex flex-col md:flex-row md:items-center gap-3 md:gap-5">
                  <div className="shrink-0 w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 flex items-center justify-center font-bold">
                    {deadlineHistory.length - index}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-slate-800 dark:text-slate-100">{formatDateTime(entry.value)}</p>
                    <p className="text-sm text-slate-500 dark:text-slate-400 break-words">{entry.reason}</p>
                  </div>
                  <span className="text-xs text-slate-400 whitespace-nowrap">
                    Registrado em {formatDateTime(entry.registeredAt)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div>
        <label className={labelClass}>Descrição detalhada *</label>
        <textarea
          required
          rows={5}
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          className={`${inputClass} resize-none`}
          placeholder="Descreva o circuito manobrado, a condição operacional e o motivo do registro..."
        />
      </div>

      <div>
        <label className={labelClass}>Observações</label>
        <textarea rows={6} value={observations} onChange={(event) => setObservations(event.target.value)} className={`${inputClass} resize-none`} placeholder="Inclua detalhes da manobra, tratativas, equipes acionadas e pontos de atenção..." />
      </div>

      <FileAttachmentField attachments={attachments} onAdd={handleFileAdd} onRemove={handleFileRemove} />

      <div className="flex flex-col md:flex-row gap-4 pt-8 border-t border-slate-200 dark:border-slate-800">
        <button type="button" onClick={() => navigate(-1)} disabled={isSubmitting} className="flex-1 py-4 font-bold rounded-xl transition-all bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-800 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 dark:hover:text-white">
          Cancelar
        </button>
        <button type="button" onClick={resetForm} disabled={isSubmitting} className="flex-1 py-4 font-bold rounded-xl transition-all bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-800 dark:bg-slate-900 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800">
          <span className="inline-flex items-center justify-center gap-2">
            <RotateCcw className="w-5 h-5" />
            Limpar
          </span>
        </button>
        <button type="submit" disabled={isSubmitting} className="flex-[2] py-4 font-bold rounded-xl text-white flex items-center justify-center gap-3 transition-all shadow-xl hover:-translate-y-0.5 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 shadow-blue-500/25 hover:shadow-blue-500/40">
          {isSubmitting ? <Loader2 className="w-6 h-6 animate-spin" /> : <Save className="w-6 h-6" />}
          {isSubmitting ? 'Salvando...' : 'Registrar circuito manobrado'}
        </button>
      </div>
    </form>
  );
};
