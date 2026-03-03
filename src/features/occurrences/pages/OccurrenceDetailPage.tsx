import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowRight, Loader2, MapPin, Clock, Users, FileText } from 'lucide-react';

// Hooks e Stores
import { useOccurrenceStore } from '../stores/useOccurrenceStore';
import { useAuth } from '../../auth/hooks/useAuth';

// Componentes Refatorados
import { StatusSelector } from '../components/StatusSelector';
import { CommentsSection } from '../components/CommentsSection';
import { OccurrenceTimer } from '../components/OccurrenceTimer';
import { OccurrenceActions } from '../components/OccurrenceActions';
import { AttachmentPreview } from '../components/AttachmentPreview'; // Assumindo que você extraiu este também
import { MediaViewerModal } from '../components/MediaViewerModal'; // Assumindo que você extraiu este também

// Componentes UI Genéricos
import { PriorityBadge } from '../../../components/ui/Badge';

// Tipos
import type { OccurrenceLocation, MediaViewerState, OccurrenceStatus } from '../types';

export const OccurrenceDetailPage = () => {
  const params = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { occurrences, updateOccurrence, fetchOccurrences, isLoading } = useOccurrenceStore();
  
  // Estado Global da Página (apenas o que afeta o layout inteiro, como Modais)
  const [viewerState, setViewerState] = useState<MediaViewerState>(null);

  // --- LÓGICA DE BUSCA ---
  const rawParam = params.id ?? params.occurrenceId ?? '';
  const normalize = (s?: string) => decodeURIComponent((s ?? '').toString()).trim();
  const clean = (s: string) => s.replace(/^OC-/, '');
  const paramNormalized = normalize(rawParam);
  const paramClean = clean(paramNormalized);

  useEffect(() => {
    if (fetchOccurrences) fetchOccurrences();
  }, [fetchOccurrences]);

  const occurrence = occurrences.find(o => {
    const id = o.id;
    const idClean = clean(id);
    return (id === paramNormalized || id === rawParam || idClean === paramClean || idClean === paramNormalized || id === decodeURIComponent(rawParam));
  });

  // --- HANDLERS (LÓGICA DE NEGÓCIO) ---

  // 1. Atualizar Status
  const handleStatusChange = async (newStatus: OccurrenceStatus) => {
    await updateOccurrence(occurrence!.id, { status: newStatus });
    await handlePostComment(`Status alterado para "${newStatus}".`, 'Geral'); 
  };

  // 2. Postar Comentário
  const handlePostComment = async (text: string, type: string) => {
    const newComment = { 
        id: `C-${Date.now()}`, 
        author: user?.name ?? 'ANÔNIMO', 
        text: text, 
        type: type, // <--- Salva o tipo recebido
        createdAt: new Date().toISOString() 
    };
    await updateOccurrence(occurrence!.id, { 
        comments: [newComment, ...(occurrence!.comments ?? [])] 
    });
  };

  // 3. Agendar Timer
  const handleScheduleReminder = async (m: number, s: number) => {
    const totalSeconds = (Number(m) || 0) * 60 + (Number(s) || 0);
    const remindAt = new Date(Date.now() + totalSeconds * 1000).toISOString();
    const newRem = { 
        id: `R-${Date.now()}`, 
        minutes: Math.floor(totalSeconds / 60), 
        seconds: totalSeconds % 60, 
        remindAt, 
        createdBy: user?.name ?? 'Sistema', 
        acknowledged: false 
    };
    await updateOccurrence(occurrence!.id, { 
        reminders: [newRem, ...(occurrence!.reminders ?? [])] 
    });
  };

  // 4. Vincular OS
  const handleLinkOs = async (osNumber: string) => {
    await updateOccurrence(occurrence!.id, { linkType: 'OS', linkValue: osNumber });
  };

  // 5. Desvincular OS
  const handleUnlinkOs = async () => {
    await updateOccurrence(occurrence!.id, { linkType: undefined, linkValue: undefined });
  };

  // 6. Notificar (Email)
  const handleSendNotification = () => {
    if (!occurrence) return;
    const to = 'supervisor@demo.com';
    const locText = typeof occurrence.location === 'string' ? occurrence.location : occurrence.location?.address ?? 'N/A';
    const subject = `Notificação: Ocorrência ${occurrence.id}`;
    const body = `Verificar ocorrência:\nID: ${occurrence.id}\nTítulo: ${occurrence.title}\nStatus: ${occurrence.status}\nLocal: ${locText}\n\nLink: ${window.location.href}`;
    window.open(`https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(to)}&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`, '_blank');
  };

  // --- RENDERIZADORES AUXILIARES (Pequenos o suficiente para ficarem aqui) ---
  const renderLocation = () => {
    if (!occurrence?.location) return <span className="text-slate-400">Localização não informada</span>;
    if (typeof occurrence.location === 'string') return <div className="flex items-center gap-2"><MapPin className="w-4 h-4" /> {occurrence.location}</div>;
    const loc = occurrence.location as OccurrenceLocation;
    return (
        <div className="flex items-start gap-2">
            <MapPin className="w-4 h-4 mt-0.5 text-slate-500" />
            <div>
                <span className="font-medium text-slate-700 dark:text-slate-300">{loc.address}, {loc.neighborhood}</span>
                <div className="text-xs text-slate-500 mt-1">
                    {loc.city && <span>{loc.city}</span>}
                    {loc.alimentador && <span className="ml-2 bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded">AL: {loc.alimentador}</span>}
                </div>
            </div>
        </div>
    );
  };

  // --- JSX PRINCIPAL ---
  if (isLoading) return <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950"><Loader2 className="w-10 h-10 text-emerald-500 animate-spin" /></div>;
  
  if (!occurrence) return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center gap-4">
      <div className="text-slate-400">Ocorrência não encontrada.</div>
      <button onClick={() => navigate('/')} className="px-6 py-2 bg-emerald-600 text-white rounded-lg">Voltar</button>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
      <div className="p-8 max-w-7xl mx-auto animate-fade-in">
        
        {/* BOTÃO VOLTAR */}
        <button 
          onClick={() => navigate(-1)} 
          className="inline-flex items-center gap-2 mb-8 px-5 py-2.5 rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-500 hover:text-slate-900 shadow-sm transition-all duration-300 group"
        >
          <ArrowRight className="w-4 h-4 rotate-180 group-hover:-translate-x-1 transition-transform" /> 
          <span className="font-medium text-sm">Voltar</span>
        </button>

        <div className="grid lg:grid-cols-3 gap-6">
          
          {/* --- COLUNA ESQUERDA (Detalhes, Anexos, Comentários) --- */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* CARD DE DETALHES */}
            <div className="rounded-2xl p-8 bg-white border border-slate-200 dark:bg-slate-900/50 dark:border-slate-800 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <span className="text-slate-400 font-mono text-lg">{occurrence.id}</span>
                <PriorityBadge priority={occurrence.priority} />
                <span className="px-3 py-1 rounded-full text-xs border bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300">{occurrence.status}</span>
              </div>
              
              <h1 className="text-3xl font-bold mb-4 text-slate-900 dark:text-white">{occurrence.title}</h1>
              
              <div className="flex flex-col gap-2 mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                <div className="flex flex-wrap items-center gap-6 text-sm text-slate-500">
                  <div className="flex items-center gap-2"><Clock className="w-4 h-4" /> {occurrence.createdAt}</div>
                  <div className="flex items-center gap-2"><Users className="w-4 h-4" /> {occurrence.createdBy}</div>
                </div>
                <div className="mt-2">{renderLocation()}</div>
              </div>

              <div className="border-t border-slate-100 dark:border-slate-800 pt-6 mt-6">
                <h3 className="text-lg font-semibold mb-3 text-slate-900 dark:text-white">Descrição Detalhada</h3>
                <p className="leading-relaxed whitespace-pre-wrap text-slate-600 dark:text-slate-300">{occurrence.description}</p>
              </div>

              {/* LISTA DE ANEXOS */}
              {(occurrence.attachments?.length ?? 0) > 0 && (
                <div className="mt-8 border-t border-slate-100 dark:border-slate-800 pt-6">
                  <div className="flex items-center gap-2 mb-4">
                    <FileText className="w-5 h-5 text-slate-400" />
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Anexos ({occurrence.attachments?.length})</h3>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {occurrence.attachments?.map((att, idx) => (
                        <AttachmentPreview 
                            key={idx} 
                            url={att} 
                            idx={idx} 
                            onPreview={(url, type) => setViewerState({ isOpen: true, url, type })}
                        />
                    ))}
                  </div>
                </div>
              )}
            </div>
            
            {/* SEÇÃO DE COMENTÁRIOS */}
            <CommentsSection 
                comments={occurrence.comments ?? []} 
                onPostComment={handlePostComment} 
            />
          </div>

          {/* --- COLUNA DIREITA (Sidebar: Ações, Timer, Status) --- */}
          <div className="space-y-6">
            
            <OccurrenceActions 
                occurrence={occurrence}
                userEmail={user?.email}
                onLinkOs={handleLinkOs}
                onUnlinkOs={handleUnlinkOs}
                onNotifySupervisor={handleSendNotification}
            />

            <OccurrenceTimer 
                reminders={occurrence.reminders}
                onSchedule={handleScheduleReminder}
            />

            <StatusSelector 
                currentStatus={occurrence.status ?? 'Aberta'} 
                onStatusChange={handleStatusChange} 
            />

          </div>
        </div>

        {/* MODAL GLOBAL (Lightbox) */}
        <MediaViewerModal 
            state={viewerState} 
            onClose={() => setViewerState(null)} 
        />

      </div>
    </div>
  );
};