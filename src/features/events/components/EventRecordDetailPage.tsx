import { useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowRight,
  CalendarClock,
  CircuitBoard,
  Clock3,
  FileText,
  Hash,
  MapPin,
  Paperclip,
  User,
  Users,
  Wrench,
} from 'lucide-react';
import type { CircuitSwitchingRecord } from '@/features/circuit-switching/types';
import type { UnavailableEquipmentRecord } from '@/features/unavailable-equipment/types';
import { useAuth } from '@/features/auth/hooks/useAuth';

type DetailKind = 'circuit-switching' | 'unavailable-equipment';
type EventRecord = CircuitSwitchingRecord | UnavailableEquipmentRecord;

interface EventRecordDetailPageProps {
  kind: DetailKind;
}

const config = {
  'circuit-switching': {
    storageKey: 'circuit_switching_records_v1',
    label: 'Circuito manobrado',
    notFound: 'Circuito manobrado não encontrado.',
    icon: CircuitBoard,
    accent: 'blue',
  },
  'unavailable-equipment': {
    storageKey: 'unavailable_equipment_records_v1',
    label: 'Equipamento indisponível',
    notFound: 'Equipamento indisponível não encontrado.',
    icon: Wrench,
    accent: 'purple',
  },
} as const;

const getLocalRecords = <T,>(key: string): T[] => {
  try {
    const raw = localStorage.getItem(key);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const formatDateTime = (value: string) => {
  if (!value) return '--';
  return new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(new Date(value));
};

const isEquipmentRecord = (record: EventRecord): record is UnavailableEquipmentRecord => {
  return 'equipmentNumber' in record || 'equipmentType' in record;
};

const InfoTile = ({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
}) => (
  <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/40 p-4">
    <div className="flex items-center gap-2 text-xs uppercase font-bold tracking-wide text-slate-500 dark:text-slate-400 mb-2">
      <Icon className="w-4 h-4" />
      {label}
    </div>
    <div className="font-semibold text-slate-900 dark:text-slate-100 break-words">
      {value || '--'}
    </div>
  </div>
);

export const EventRecordDetailPage = ({ kind }: EventRecordDetailPageProps) => {
  const params = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const currentConfig = config[kind];
  const Icon = currentConfig.icon;

  const record = useMemo(() => {
    const id = decodeURIComponent(params.id ?? '').trim();
    return getLocalRecords<EventRecord>(currentConfig.storageKey).find((item) => item.id === id);
  }, [currentConfig.storageKey, params.id]);

  if (!record) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center gap-4">
        <div className="text-slate-400">{currentConfig.notFound}</div>
        <button onClick={() => navigate(-1)} className="px-6 py-2 bg-emerald-600 text-white rounded-lg">
          Voltar
        </button>
      </div>
    );
  }

  const isEquipment = isEquipmentRecord(record);
  const authorName = record.createdBy || user?.name?.trim() || user?.email || 'Autor não informado';
  const title = isEquipment
    ? (record.description || `${record.equipmentType} ${record.equipmentNumber}`)
    : (record.description || `${record.feeder} - ${record.equipment}`);
  const accentClasses = currentConfig.accent === 'purple'
    ? 'bg-purple-50 border-purple-200 text-purple-700 dark:bg-purple-900/20 dark:border-purple-800 dark:text-purple-400'
    : 'bg-blue-50 border-blue-200 text-blue-700 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-400';
  const iconClasses = currentConfig.accent === 'purple'
    ? 'bg-purple-50 border-purple-100 text-purple-600 dark:bg-purple-950/30 dark:border-purple-900/50 dark:text-purple-400'
    : 'bg-blue-50 border-blue-100 text-blue-600 dark:bg-blue-950/30 dark:border-blue-900/50 dark:text-blue-400';

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
      <div className="p-8 max-w-7xl mx-auto animate-fade-in">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 mb-8 px-5 py-2.5 rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white shadow-sm transition-all duration-300 group"
        >
          <ArrowRight className="w-4 h-4 rotate-180 group-hover:-translate-x-1 transition-transform" />
          <span className="font-medium text-sm">Voltar</span>
        </button>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="rounded-2xl p-8 bg-white border border-slate-200 dark:bg-slate-900/50 dark:border-slate-800 shadow-sm">
              <div className="flex items-start gap-5 mb-6">
                <div className={`p-4 rounded-2xl border-2 ${iconClasses}`}>
                  <Icon className="w-10 h-10" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-3 mb-3">
                    <span className="text-slate-400 font-mono text-lg">{record.id}</span>
                    <span className={`px-3 py-1 rounded-full text-xs border font-bold ${accentClasses}`}>
                      {currentConfig.label}
                    </span>
                  </div>
                  <h1 className="text-3xl font-bold text-slate-900 dark:text-white break-words">
                    {title || currentConfig.label}
                  </h1>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-6 border-t border-slate-100 dark:border-slate-800">
                <InfoTile icon={User} label="Cadastrado por" value={authorName} />
                <InfoTile icon={User} label="Setor responsável" value={record.responsibleSector} />
                {isEquipment && (
                  <>
                    <InfoTile icon={Hash} label="Número do equipamento" value={record.equipmentNumber} />
                    <InfoTile icon={Wrench} label="Tipo do equipamento" value={record.equipmentType} />
                  </>
                )}
                <InfoTile icon={MapPin} label="Alimentador" value={record.feeder} />
                <InfoTile icon={Wrench} label={isEquipment ? 'Descrição complementar' : 'Equipamento'} value={record.equipment} />
                <InfoTile icon={Users} label="Clientes afetados" value={record.affectedCustomers} />
              </div>

              <div className="border-t border-slate-100 dark:border-slate-800 pt-6 mt-6">
                <h3 className="text-lg font-semibold mb-3 text-slate-900 dark:text-white">
                  Descrição detalhada
                </h3>
                <p className="leading-relaxed whitespace-pre-wrap text-slate-600 dark:text-slate-300">
                  {record.description || 'Descrição não informada.'}
                </p>
              </div>

              <div className="border-t border-slate-100 dark:border-slate-800 pt-6 mt-6">
                <h3 className="text-lg font-semibold mb-3 text-slate-900 dark:text-white">
                  Causa
                </h3>
                <p className="leading-relaxed whitespace-pre-wrap text-slate-600 dark:text-slate-300">
                  {record.cause || 'Causa não informada.'}
                </p>
              </div>

              <div className="border-t border-slate-100 dark:border-slate-800 pt-6 mt-6">
                <h3 className="text-lg font-semibold mb-3 text-slate-900 dark:text-white">
                  Observações
                </h3>
                <p className="leading-relaxed whitespace-pre-wrap text-slate-600 dark:text-slate-300">
                  {record.observations || 'Nenhuma observação registrada.'}
                </p>
              </div>

              {(record.attachments?.length ?? 0) > 0 && (
                <div className="mt-8 border-t border-slate-100 dark:border-slate-800 pt-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Paperclip className="w-5 h-5 text-slate-400" />
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                      Anexos ({record.attachments.length})
                    </h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {record.attachments.map((attachment) => (
                      <a
                        key={attachment.id}
                        href={attachment.url}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/40 p-4 hover:border-emerald-500/50 transition-colors"
                      >
                        <FileText className="w-5 h-5 text-emerald-500 shrink-0" />
                        <div className="min-w-0">
                          <p className="font-semibold text-sm text-slate-800 dark:text-slate-100 truncate">
                            {attachment.name}
                          </p>
                          <p className="text-xs text-slate-500 dark:text-slate-400 uppercase">
                            {attachment.type}
                          </p>
                        </div>
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-2xl p-6 bg-white border border-slate-200 dark:bg-slate-900/50 dark:border-slate-800 shadow-sm">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4">
                Prazos
              </h2>
              <div className="rounded-xl border border-amber-100 dark:border-amber-900/40 bg-amber-50/50 dark:bg-amber-950/10 p-4 mb-4">
                <div className="flex items-center gap-2 text-xs uppercase font-bold tracking-wide text-amber-700 dark:text-amber-400 mb-2">
                  <CalendarClock className="w-4 h-4" />
                  Prazo atual
                </div>
                <div className="font-semibold text-slate-900 dark:text-slate-100">
                  {formatDateTime(record.currentDeadline)}
                </div>
              </div>

              <div className="space-y-3">
                {(record.deadlineHistory ?? []).map((entry) => (
                  <div key={entry.id} className="rounded-xl border border-slate-200 dark:border-slate-800 p-4">
                    <div className="flex items-center gap-2 text-sm font-bold text-slate-800 dark:text-slate-100">
                      <Clock3 className="w-4 h-4 text-amber-600" />
                      {formatDateTime(entry.value)}
                    </div>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
                      {entry.reason}
                    </p>
                    <p className="text-xs text-slate-400 mt-2">
                      Registrado em {formatDateTime(entry.registeredAt)}
                    </p>
                  </div>
                ))}
                {(record.deadlineHistory ?? []).length === 0 && (
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    Nenhum histórico de prazo registrado.
                  </p>
                )}
              </div>
            </div>

            <div className="rounded-2xl p-6 bg-white border border-slate-200 dark:bg-slate-900/50 dark:border-slate-800 shadow-sm">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4">
                Resumo
              </h2>
              <div className="space-y-3 text-sm text-slate-600 dark:text-slate-300">
                <div className="flex justify-between gap-3">
                  <span className="text-slate-400">Criado em</span>
                  <span className="font-semibold text-right">{formatDateTime(record.createdAt)}</span>
                </div>
                <div className="flex justify-between gap-3">
                  <span className="text-slate-400">Arquivos</span>
                  <span className="font-semibold">{record.attachments?.length ?? 0}</span>
                </div>
                <div className="flex justify-between gap-3">
                  <span className="text-slate-400">Alterações de prazo</span>
                  <span className="font-semibold">{record.deadlineHistory?.length ?? 0}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
