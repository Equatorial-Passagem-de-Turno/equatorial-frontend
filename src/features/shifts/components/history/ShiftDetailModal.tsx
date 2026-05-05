import React, { useEffect, useState } from 'react';
import { X, FileText, MessageSquare, Printer, MapPin, AlertCircle, CheckCircle, Loader2, ClipboardList, ChevronDown, ChevronUp } from 'lucide-react';
import { type HistoryItem } from './HistoryTable';
import { getShiftDetailsApi, type ShiftDetailResponse, type ShiftDetailComment } from '@/features/occurrences/services/shiftService';
import { generateShiftDetailReportPdf } from '@/features/reports/utils/standardReportPdf';
import { showErrorModal, showWarningModal } from '@/shared/ui/feedbackModal';

interface Props {
  isOpen: boolean;
  onClose: () => void;
    shiftData: HistoryItem | null;
}

export const ShiftDetailModal: React.FC<Props> = ({ isOpen, onClose, shiftData }) => {
    const [details, setDetails] = useState<ShiftDetailResponse | null>(null);
    const [loading, setLoading] = useState(false);
    const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [expandedCommentsByOccurrence, setExpandedCommentsByOccurrence] = useState<Record<string, boolean>>({});

    const normalizeComments = (comments?: ShiftDetailComment[]) => {
        if (!Array.isArray(comments)) return [];

        return comments
            .filter((comment) => comment && typeof comment === 'object')
            .map((comment, index) => {
                const createdAt = String(comment.createdAt ?? '').trim();
                const parsedDate = createdAt ? new Date(createdAt) : null;

                return {
                    id: String(comment.id ?? `comment-${index}`),
                    author: String(comment.author ?? 'Sistema').trim() || 'Sistema',
                    type: String(comment.type ?? 'Geral').trim() || 'Geral',
                    text: String(comment.text ?? '').trim(),
                    createdAt: parsedDate && !Number.isNaN(parsedDate.getTime())
                        ? parsedDate.toLocaleString('pt-BR')
                        : createdAt || '--',
                };
            })
            .filter((comment) => comment.text.length > 0);
    };

    const toggleOccurrenceComments = (occurrenceId: string) => {
        setExpandedCommentsByOccurrence((previous) => ({
            ...previous,
            [occurrenceId]: !previous[occurrenceId],
        }));
    };

    const resolvedShiftId = (() => {
        if (!shiftData) return 0;
        if (Number.isFinite(Number(shiftData.shiftId)) && Number(shiftData.shiftId) > 0) {
            return Number(shiftData.shiftId);
        }

        const parsed = Number(String(shiftData.id ?? '').replace(/\D/g, ''));
        return Number.isFinite(parsed) ? parsed : 0;
    })();

    useEffect(() => {
        if (!isOpen || resolvedShiftId <= 0) {
            setDetails(null);
            setError(null);
            setLoading(false);
            setExpandedCommentsByOccurrence({});
            return;
        }

        let cancelled = false;

        const loadShiftDetails = async () => {
            try {
                setLoading(true);
                setError(null);

                const response = await getShiftDetailsApi(resolvedShiftId);
                if (!cancelled) {
                    setDetails(response);
                    setExpandedCommentsByOccurrence({});
                }
            } catch (requestError) {
                if (!cancelled) {
                    console.error('Erro ao carregar detalhes do turno:', requestError);
                    setError('Não foi possível carregar os detalhes deste turno.');
                    setDetails(null);
                }
            } finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        };

        loadShiftDetails();

        return () => {
            cancelled = true;
        };
    }, [isOpen, resolvedShiftId]);

    if (!isOpen || !shiftData) return null;

    const selectedShiftId = details?.displayId ?? shiftData.id;
    const selectedOperator = details?.operador ?? shiftData.operador;
    const selectedFunction = details?.funcaoLabel ?? shiftData.tipo;
    const selectedStatus = details?.status ?? shiftData.status;
    const selectedWorkedDuration = String(details?.workedDuration ?? details?.tempo_trabalhado ?? shiftData.workedDuration ?? '--');
    const shiftDate = details?.start ?? shiftData.horario.split(' - ')[0];
    const shiftTime = details?.start && details?.end ? `${details.start.split(' ')[1]} - ${details.end.split(' ')[1]}` : shiftData.horario;
    const shiftOccurrences = details?.occurrences ?? [];

    const handleGeneratePdf = () => {
        if (!details) {
            void showWarningModal('Aguarde o carregamento completo dos detalhes do turno para gerar o PDF.');
            return;
        }

        try {
            setIsGeneratingPdf(true);

            generateShiftDetailReportPdf({
                shiftId: String(details.displayId || details.id || '--'),
                operator: String(details.operador || '--'),
                role: String(details.funcaoLabel || details.funcao || '--'),
                desk: String(details.mesa || '--'),
                status: String(details.status || '--'),
                start: details.start,
                end: details.end,
                workedDuration: String(details.workedDuration ?? details.tempo_trabalhado ?? '--'),
                briefing: details.briefing || 'Sem briefing registrado.',
                totalOccurrences: Number(details.totalOccurrences || 0),
                openOccurrences: Number(details.openOccurrences || 0),
                resolvedOccurrences: Number(details.resolvedOccurrences || 0),
                occurrences: details.occurrences.map((occurrence) => ({
                    id: String(occurrence.id),
                    title: String(occurrence.title || 'Sem titulo'),
                    description: occurrence.description || 'Sem observacao adicional.',
                    category: occurrence.category,
                    priority: occurrence.priority,
                    status: occurrence.status,
                    origin: occurrence.origin,
                    createdAt: occurrence.createdAt,
                    commentsCount: occurrence.commentsCount,
                    comments: normalizeComments(occurrence.comments).map((comment) => ({
                        author: comment.author,
                        type: comment.type,
                        text: comment.text,
                        createdAt: comment.createdAt,
                    })),
                })),
            });
        } catch (pdfError) {
            console.error('Erro ao gerar PDF do turno:', pdfError);
            void showErrorModal('Não foi possível gerar o relatório PDF deste turno.');
        } finally {
            setIsGeneratingPdf(false);
        }
    };

  return (
    <div className="fixed inset-0 z-[10020] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in" onClick={onClose} />

      <div className="eq-modal-solid relative flex max-h-[90vh] w-full max-w-3xl animate-slide-up flex-col overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-400 via-teal-500 to-emerald-600" />
        <div className="eq-modal-header flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
             <div className="eq-soft-icon border border-[var(--eq-border)] p-2">
                <FileText className="w-6 h-6 text-emerald-400" />
             </div>
             <div>
                                <h2 className="text-lg font-bold leading-tight text-[var(--eq-text-primary)]">Detalhes do Turno</h2>
                                <p className="eq-card-meta mt-0.5 font-mono">{selectedShiftId}</p>
             </div>
          </div>
          
          <div className="flex items-center gap-3">
            <button
                onClick={handleGeneratePdf}
                disabled={loading || isGeneratingPdf || !details}
                className="flex items-center gap-2 bg-red-600 hover:bg-red-700 disabled:bg-red-400 disabled:cursor-not-allowed text-white px-3 py-1.5 rounded text-xs font-bold transition-colors shadow-sm"
            >
                {isGeneratingPdf ? <Loader2 className="w-4 h-4 animate-spin" /> : <Printer className="w-4 h-4" />}
                {isGeneratingPdf ? 'GERANDO...' : 'VER PDF'}
            </button>
            <button onClick={onClose} className="eq-control flex h-8 w-8 items-center justify-center rounded-lg p-0 transition-colors hover:bg-[var(--eq-bg-surface-soft)]">
                <X className="w-5 h-5 text-[var(--eq-text-secondary)]" />
            </button>
          </div>
        </div>

        <div className="eq-modal-section flex flex-col items-center justify-between gap-4 p-4 sm:flex-row">
            <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-r from-emerald-500 to-teal-600 font-bold text-white shadow-lg shadow-emerald-500/20">
                    {selectedOperator.substring(0, 2).toUpperCase()}
                </div>
                <div>
                    <p className="text-xs font-bold uppercase text-[var(--eq-text-muted)]">Operador Responsável</p>
                    <p className="font-bold text-[var(--eq-text-primary)]">{selectedOperator}</p>
                </div>
            </div>
            <div className="grid grid-cols-2 gap-4 text-right">
                 <div>
                    <p className="text-xs font-bold uppercase text-[var(--eq-text-muted)]">Data do Turno</p>
                    <p className="text-base font-bold text-[var(--eq-text-primary)]">{shiftDate}</p>
                 </div>
                 <div>
                    <p className="text-xs font-bold uppercase text-[var(--eq-text-muted)]">Horário</p>
                    <p className="text-base font-bold text-[var(--eq-text-primary)]">{shiftTime}</p>
                 </div>
            </div>
        </div>

        <div className="eq-modal-body flex-1 space-y-4 overflow-auto p-4">
            {loading && (
                <div className="flex items-center justify-center gap-2 py-16 text-[var(--eq-text-muted)]">
                    <Loader2 className="w-5 h-5 animate-spin text-emerald-500" />
                    Carregando detalhes do turno...
                </div>
            )}

            {error && !loading && (
                <div className="rounded-lg border border-rose-200 dark:border-rose-900/40 bg-rose-50 dark:bg-rose-900/10 p-4 text-sm text-rose-700 dark:text-rose-300">
                    {error}
                </div>
            )}

            {!loading && !error && details && (
                <>
                    <section className="grid grid-cols-1 md:grid-cols-4 gap-3">
                        <div className="eq-surface-soft p-4">
                            <p className="text-[10px] font-bold uppercase text-[var(--eq-text-muted)]">Função</p>
                            <p className="mt-1 text-sm font-semibold text-[var(--eq-text-primary)]">{selectedFunction}</p>
                        </div>
                        <div className="eq-surface-soft p-4">
                            <p className="text-[10px] font-bold uppercase text-[var(--eq-text-muted)]">Mesa</p>
                            <p className="mt-1 text-sm font-semibold text-[var(--eq-text-primary)]">{details.mesa}</p>
                        </div>
                        <div className="eq-surface-soft p-4">
                            <p className="text-[10px] font-bold uppercase text-[var(--eq-text-muted)]">Status</p>
                            <p className={`inline-flex items-center gap-1 mt-1 text-sm font-semibold ${selectedStatus === 'Aberto' ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-600 dark:text-slate-300'}`}>
                                <span className={`w-2 h-2 rounded-full ${selectedStatus === 'Aberto' ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                                {selectedStatus}
                            </p>
                        </div>
                        <div className="eq-surface-soft p-4">
                            <p className="text-[10px] font-bold uppercase text-[var(--eq-text-muted)]">Ocorrências</p>
                            <p className="mt-1 text-sm font-semibold text-[var(--eq-text-primary)]">{details.totalOccurrences}</p>
                        </div>
                        <div className="eq-surface-soft p-4 md:col-span-2">
                            <p className="text-[10px] font-bold uppercase text-[var(--eq-text-muted)]">Total Trabalhado</p>
                            <p className="mt-1 text-sm font-semibold text-[var(--eq-text-primary)]">{selectedWorkedDuration}</p>
                        </div>
                    </section>

                    <section className="eq-surface-soft space-y-3 p-4">
                        <div className="flex items-center gap-2 font-semibold text-[var(--eq-text-primary)]">
                            <ClipboardList className="w-4 h-4 text-emerald-500" />
                            Briefing final
                        </div>
                        <p className="whitespace-pre-line text-sm leading-relaxed text-[var(--eq-text-secondary)]">
                            {details.briefing || 'Nenhum briefing foi registrado para este turno.'}
                        </p>
                    </section>

                    <section className="space-y-3">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 font-semibold text-[var(--eq-text-primary)]">
                                <MessageSquare className="w-4 h-4 text-emerald-500" />
                                Ocorrências do turno
                            </div>
                            <span className="text-xs font-semibold text-[var(--eq-text-muted)]">
                                {details.openOccurrences} em aberto • {details.resolvedOccurrences} resolvidas
                            </span>
                        </div>

                        {shiftOccurrences.length === 0 ? (
                            <div className="eq-empty-state p-6 text-center text-sm text-[var(--eq-text-muted)]">
                                Nenhuma ocorrência vinculada a este turno.
                            </div>
                        ) : (
                            shiftOccurrences.map((event) => {
                                const eventComments = normalizeComments(event.comments);
                                const commentsCount = eventComments.length > 0 ? eventComments.length : event.commentsCount;
                                const isCommentsExpanded = !!expandedCommentsByOccurrence[event.id];

                                return (
                                <div key={event.id} className="eq-surface overflow-hidden rounded-lg shadow-sm">
                                    <div className="grid grid-cols-12 border-b border-[var(--eq-border)]">
                                        <div className="col-span-4 flex flex-col justify-center border-r border-[var(--eq-border)] bg-[var(--eq-bg-surface-soft)] p-2">
                                            <span className="text-[10px] font-bold uppercase text-[var(--eq-text-muted)]">Categoria</span>
                                            <div className="flex items-center gap-1 text-sm font-bold text-[var(--eq-text-primary)]">
                                                <MapPin className="w-3 h-3 text-emerald-500" />
                                                {event.category}
                                            </div>
                                        </div>
                                        <div className="col-span-4 flex flex-col justify-center border-r border-[var(--eq-border)] p-2 text-center">
                                             <span className="text-[10px] font-bold uppercase text-[var(--eq-text-muted)]">Data/Hora</span>
                                             <span className="font-mono text-xs text-[var(--eq-text-secondary)]">{event.createdAt ?? '--'}</span>
                                        </div>
                                        <div className="col-span-4 flex flex-col items-center justify-center bg-[var(--eq-bg-surface-soft)] p-2">
                                             <span className="text-[10px] font-bold uppercase text-[var(--eq-text-muted)] mb-1">Status</span>
                                             <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border flex items-center gap-1 ${
                                                event.isOpen 
                                                ? 'eq-status-warning' 
                                                : 'eq-status-success'
                                             }`}>
                                                {event.isOpen ? <AlertCircle className="w-3 h-3"/> : <CheckCircle className="w-3 h-3"/>}
                                                {event.status}
                                             </span>
                                        </div>
                                    </div>

                                    <div className="p-3 grid grid-cols-1 md:grid-cols-4 gap-4">
                                        <div className="md:col-span-3 space-y-3">
                                            <div>
                                                <span className="text-[10px] font-bold uppercase text-[var(--eq-text-muted)] block mb-1">Atividade</span>
                                                <p className="text-sm font-medium leading-snug text-[var(--eq-text-primary)]">
                                                    {event.title}
                                                </p>
                                            </div>
                                            <div className="rounded border border-[var(--eq-border)] bg-[var(--eq-bg-surface-soft)] p-2">
                                                <span className="text-[10px] font-bold uppercase text-[var(--eq-text-muted)] block mb-1">Observação</span>
                                                <p className="whitespace-pre-line text-xs italic text-[var(--eq-text-secondary)]">
                                                    {event.description || 'Sem observação adicional.'}
                                                </p>
                                            </div>
                                            <div className="flex flex-wrap gap-2 text-[10px] font-bold uppercase text-[var(--eq-text-muted)]">
                                                <span className="rounded-full border border-[var(--eq-border)] px-2 py-1">{event.origin}</span>
                                                <span className="rounded-full border border-[var(--eq-border)] px-2 py-1">{event.priority}</span>
                                                {event.linkType && <span className="rounded-full border border-[var(--eq-border)] px-2 py-1">{event.linkType}</span>}
                                            </div>
                                        </div>

                                        <div className="md:col-span-1 flex flex-col items-center justify-center gap-2 border-l border-[var(--eq-border)] pl-4">
                                            <div className="text-center w-full">
                                                <button
                                                    onClick={() => toggleOccurrenceComments(event.id)}
                                                    className="group flex w-full flex-col items-center justify-center rounded p-2 transition-colors hover:bg-[var(--eq-bg-surface-soft)]"
                                                >
                                                    <MessageSquare className="mb-1 h-5 w-5 text-[var(--eq-text-muted)] group-hover:text-emerald-500" />
                                                    <span className="flex items-center gap-1 text-[10px] font-bold text-[var(--eq-text-muted)]">
                                                        Notas/Coment.
                                                        {isCommentsExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                                                    </span>
                                                </button>
                                                <div className="eq-id-chip mt-1 px-3 py-1 text-xs">
                                                    {commentsCount}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {isCommentsExpanded && (
                                        <div className="space-y-2 border-t border-[var(--eq-border)] bg-[var(--eq-bg-surface-soft)] p-3">
                                            {eventComments.length > 0 ? (
                                                eventComments.map((comment) => (
                                                    <div key={comment.id} className="eq-surface-soft p-3">
                                                        <div className="flex items-center justify-between gap-2 mb-1">
                                                            <div className="text-xs font-bold text-[var(--eq-text-primary)]">
                                                                {comment.author}
                                                            </div>
                                                            <div className="text-[10px] uppercase tracking-wide text-[var(--eq-text-muted)]">
                                                                {comment.type} • {comment.createdAt}
                                                            </div>
                                                        </div>
                                                        <p className="whitespace-pre-wrap text-xs text-[var(--eq-text-secondary)]">
                                                            {comment.text}
                                                        </p>
                                                    </div>
                                                ))
                                            ) : (
                                                <div className="eq-empty-state p-3 text-center text-xs text-[var(--eq-text-muted)]">
                                                    Nenhuma nota/comentário registrado para esta ocorrência.
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                                );
                            })
                        )}
                    </section>
                </>
            )}

            {!loading && !error && !details && (
                <div className="eq-empty-state p-6 text-center text-sm text-[var(--eq-text-muted)]">
                    Nenhum detalhe disponível para este turno.
                </div>
            )}

            <div className="text-center py-4">
                <p className="text-xs uppercase tracking-widest text-[var(--eq-text-muted)]">Fim dos registros</p>
            </div>
        </div>

        <div className="eq-modal-footer flex justify-end p-3">
            <button onClick={onClose} className="eq-control rounded-lg px-5 py-2 text-sm font-bold transition-colors hover:bg-[var(--eq-bg-surface)]">
                Fechar Detalhes
            </button>
        </div>
      </div>
    </div>
  );
};
