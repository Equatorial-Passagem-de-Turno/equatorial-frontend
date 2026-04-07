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
      <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm animate-fade-in" onClick={onClose} />

      <div className="relative w-full max-w-3xl bg-slate-100 dark:bg-slate-900 rounded-xl shadow-2xl border border-slate-300 dark:border-slate-700 overflow-hidden animate-slide-up flex flex-col max-h-[90vh]">
        <div className="bg-slate-800 text-white p-4 flex items-center justify-between border-b border-slate-700">
          <div className="flex items-center gap-3">
             <div className="p-2 bg-slate-700 rounded-lg border border-slate-600">
                <FileText className="w-6 h-6 text-emerald-400" />
             </div>
             <div>
                                <h2 className="text-lg font-bold leading-tight">Detalhes do Turno</h2>
                                <p className="text-xs text-slate-400 font-mono mt-0.5">{selectedShiftId}</p>
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
            <button onClick={onClose} className="p-1.5 hover:bg-slate-700 rounded-full transition-colors">
                <X className="w-5 h-5 text-slate-400 hover:text-white" />
            </button>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 p-4 border-b border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center font-bold text-slate-600 dark:text-slate-300">
                    {selectedOperator.substring(0, 2).toUpperCase()}
                </div>
                <div>
                    <p className="text-xs text-slate-500 uppercase font-bold">Operador Responsável</p>
                    <p className="font-bold text-slate-800 dark:text-white">{selectedOperator}</p>
                </div>
            </div>
            <div className="grid grid-cols-2 gap-4 text-right">
                 <div>
                    <p className="text-xs text-slate-500 uppercase font-bold">Data do Turno</p>
                    <p className="font-bold text-slate-800 dark:text-white text-base">{shiftDate}</p>
                 </div>
                 <div>
                    <p className="text-xs text-slate-500 uppercase font-bold">Horário</p>
                    <p className="font-bold text-slate-800 dark:text-white text-base">{shiftTime}</p>
                 </div>
            </div>
        </div>

        <div className="flex-1 overflow-auto p-4 space-y-4">
            {loading && (
                <div className="flex items-center justify-center py-16 text-slate-500 dark:text-slate-400 gap-2">
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
                        <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-4">
                            <p className="text-[10px] uppercase text-slate-400 font-bold">Função</p>
                            <p className="text-sm font-semibold text-slate-800 dark:text-white mt-1">{selectedFunction}</p>
                        </div>
                        <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-4">
                            <p className="text-[10px] uppercase text-slate-400 font-bold">Mesa</p>
                            <p className="text-sm font-semibold text-slate-800 dark:text-white mt-1">{details.mesa}</p>
                        </div>
                        <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-4">
                            <p className="text-[10px] uppercase text-slate-400 font-bold">Status</p>
                            <p className={`inline-flex items-center gap-1 mt-1 text-sm font-semibold ${selectedStatus === 'Aberto' ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-600 dark:text-slate-300'}`}>
                                <span className={`w-2 h-2 rounded-full ${selectedStatus === 'Aberto' ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                                {selectedStatus}
                            </p>
                        </div>
                        <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-4">
                            <p className="text-[10px] uppercase text-slate-400 font-bold">Ocorrências</p>
                            <p className="text-sm font-semibold text-slate-800 dark:text-white mt-1">{details.totalOccurrences}</p>
                        </div>
                        <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-4 md:col-span-2">
                            <p className="text-[10px] uppercase text-slate-400 font-bold">Total Trabalhado</p>
                            <p className="text-sm font-semibold text-slate-800 dark:text-white mt-1">{selectedWorkedDuration}</p>
                        </div>
                    </section>

                    <section className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-4 space-y-3">
                        <div className="flex items-center gap-2 text-slate-700 dark:text-slate-200 font-semibold">
                            <ClipboardList className="w-4 h-4 text-emerald-500" />
                            Briefing final
                        </div>
                        <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-line">
                            {details.briefing || 'Nenhum briefing foi registrado para este turno.'}
                        </p>
                    </section>

                    <section className="space-y-3">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 text-slate-700 dark:text-white font-semibold">
                                <MessageSquare className="w-4 h-4 text-emerald-500" />
                                Ocorrências do turno
                            </div>
                            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                                {details.openOccurrences} em aberto • {details.resolvedOccurrences} resolvidas
                            </span>
                        </div>

                        {shiftOccurrences.length === 0 ? (
                            <div className="rounded-lg border border-dashed border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 p-6 text-center text-sm text-slate-500 dark:text-slate-400">
                                Nenhuma ocorrência vinculada a este turno.
                            </div>
                        ) : (
                            shiftOccurrences.map((event) => {
                                const eventComments = normalizeComments(event.comments);
                                const commentsCount = eventComments.length > 0 ? eventComments.length : event.commentsCount;
                                const isCommentsExpanded = !!expandedCommentsByOccurrence[event.id];

                                return (
                                <div key={event.id} className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
                                    <div className="grid grid-cols-12 border-b border-slate-100 dark:border-slate-700">
                                        <div className="col-span-4 bg-slate-50 dark:bg-slate-900/50 p-2 border-r border-slate-100 dark:border-slate-700 flex flex-col justify-center">
                                            <span className="text-[10px] font-bold text-slate-400 uppercase">Categoria</span>
                                            <div className="flex items-center gap-1 font-bold text-slate-700 dark:text-slate-200 text-sm">
                                                <MapPin className="w-3 h-3 text-emerald-500" />
                                                {event.category}
                                            </div>
                                        </div>
                                        <div className="col-span-4 p-2 border-r border-slate-100 dark:border-slate-700 flex flex-col justify-center text-center">
                                             <span className="text-[10px] font-bold text-slate-400 uppercase">Data/Hora</span>
                                             <span className="text-xs font-mono text-slate-600 dark:text-slate-300">{event.createdAt ?? '--'}</span>
                                        </div>
                                        <div className="col-span-4 p-2 flex flex-col justify-center items-center bg-slate-50 dark:bg-slate-900/50">
                                             <span className="text-[10px] font-bold text-slate-400 uppercase mb-1">Status</span>
                                             <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border flex items-center gap-1 ${
                                                event.isOpen 
                                                ? 'bg-orange-50 text-orange-700 border-orange-100 dark:bg-orange-900/20 dark:text-orange-400 dark:border-orange-800' 
                                                : 'bg-emerald-50 text-emerald-700 border-emerald-100 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800'
                                             }`}>
                                                {event.isOpen ? <AlertCircle className="w-3 h-3"/> : <CheckCircle className="w-3 h-3"/>}
                                                {event.status}
                                             </span>
                                        </div>
                                    </div>

                                    <div className="p-3 grid grid-cols-1 md:grid-cols-4 gap-4">
                                        <div className="md:col-span-3 space-y-3">
                                            <div>
                                                <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Atividade</span>
                                                <p className="text-sm font-medium text-slate-800 dark:text-white leading-snug">
                                                    {event.title}
                                                </p>
                                            </div>
                                            <div className="bg-slate-50 dark:bg-slate-950 p-2 rounded border border-slate-100 dark:border-slate-800">
                                                <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Observação</span>
                                                <p className="text-xs text-slate-600 dark:text-slate-400 italic whitespace-pre-line">
                                                    {event.description || 'Sem observação adicional.'}
                                                </p>
                                            </div>
                                            <div className="flex flex-wrap gap-2 text-[10px] font-bold uppercase text-slate-500">
                                                <span className="rounded-full border border-slate-200 dark:border-slate-700 px-2 py-1">{event.origin}</span>
                                                <span className="rounded-full border border-slate-200 dark:border-slate-700 px-2 py-1">{event.priority}</span>
                                                {event.linkType && <span className="rounded-full border border-slate-200 dark:border-slate-700 px-2 py-1">{event.linkType}</span>}
                                            </div>
                                        </div>

                                        <div className="md:col-span-1 flex flex-col justify-center items-center gap-2 border-l border-slate-100 dark:border-slate-700 pl-4">
                                            <div className="text-center w-full">
                                                <button
                                                    onClick={() => toggleOccurrenceComments(event.id)}
                                                    className="w-full flex flex-col items-center justify-center p-2 rounded hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors group"
                                                >
                                                    <MessageSquare className="w-5 h-5 text-slate-400 group-hover:text-blue-500 mb-1" />
                                                    <span className="text-[10px] font-bold text-slate-500 flex items-center gap-1">
                                                        Notas/Coment.
                                                        {isCommentsExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                                                    </span>
                                                </button>
                                                <div className="mt-1 bg-slate-800 text-white text-xs font-bold py-1 px-3 rounded shadow-sm">
                                                    {commentsCount}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {isCommentsExpanded && (
                                        <div className="border-t border-slate-100 dark:border-slate-700 bg-slate-50/60 dark:bg-slate-900/40 p-3 space-y-2">
                                            {eventComments.length > 0 ? (
                                                eventComments.map((comment) => (
                                                    <div key={comment.id} className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-3">
                                                        <div className="flex items-center justify-between gap-2 mb-1">
                                                            <div className="text-xs font-bold text-slate-700 dark:text-slate-200">
                                                                {comment.author}
                                                            </div>
                                                            <div className="text-[10px] text-slate-400 uppercase tracking-wide">
                                                                {comment.type} • {comment.createdAt}
                                                            </div>
                                                        </div>
                                                        <p className="text-xs text-slate-600 dark:text-slate-300 whitespace-pre-wrap">
                                                            {comment.text}
                                                        </p>
                                                    </div>
                                                ))
                                            ) : (
                                                <div className="rounded-lg border border-dashed border-slate-300 dark:border-slate-700 bg-white/60 dark:bg-slate-900/40 p-3 text-xs text-slate-500 dark:text-slate-400 text-center">
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
                <div className="rounded-lg border border-dashed border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 p-6 text-center text-sm text-slate-500 dark:text-slate-400">
                    Nenhum detalhe disponível para este turno.
                </div>
            )}

            <div className="text-center py-4">
                <p className="text-xs text-slate-400 uppercase tracking-widest">Fim dos registros</p>
            </div>
        </div>

        <div className="bg-slate-50 dark:bg-slate-900 p-3 border-t border-slate-200 dark:border-slate-700 flex justify-end">
            <button onClick={onClose} className="px-5 py-2 bg-white border border-slate-300 text-slate-700 text-sm font-bold rounded hover:bg-slate-50 transition-colors shadow-sm">
                Fechar Detalhes
            </button>
        </div>
      </div>
    </div>
  );
};