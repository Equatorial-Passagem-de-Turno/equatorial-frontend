import { useState, useEffect, useMemo, useRef } from 'react';
import { 
  ArrowRight, CheckCircle, Calendar as CalendarIcon, History, 
  Clock, User, Eye, AlertTriangle, CheckSquare, 
  ArrowRightCircle, Check, UserPlus, Users, X,
  FileText, RotateCcw, Lock, Mail, Send, Loader2, 
  ChevronDown, LogOut
} from 'lucide-react';
import { format } from 'date-fns';
import { useShiftControl } from '../hooks/useShiftControl';

// Importação dos Componentes Modulares
import { ShiftReportPrintView } from '../components/ShiftReportPrintView';
import { ShiftHistoryModal } from '../components/history/ShiftHistoryModal';
import { ShiftDetailModal } from '../components/history/ShiftDetailModal';
import { type HistoryItem } from '../components/history/HistoryTable';

// Importação do serviço de API
import { finishShiftApi } from '../../occurrences/services/shiftService'; // Ajuste o caminho conforme sua estrutura

export const ShiftControlPage = () => {
  const { 
    user, 
    turnoAtual, 
    setTurnoAtual,
    todaysShifts,
    briefing, 
    setBriefing, 
    encerrarTurno, 
    finalizarNavegacao, 
    imprimirRelatorio,
    logout 
  } = useShiftControl();

  

  // Estados de UI
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [selectedShiftForDetail, setSelectedShiftForDetail] = useState<HistoryItem | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  
  // Estado para o Modal de Confirmação de Encerramento e Loading da API
  const [isFinishModalOpen, setIsFinishModalOpen] = useState(false);
  const [isFinishing, setIsFinishing] = useState(false);

  // Estado para o Modal de Confirmação de Reabertura
  const [isReopenModalOpen, setIsReopenModalOpen] = useState(false);

  // Estado para armazenar o snapshot do turno encerrado localmente
  const [finishedShiftState, setFinishedShiftState] = useState<any | null>(null);

  // === Estados para envio de E-mail (Multi-select) ===
  const [selectedRecipients, setSelectedRecipients] = useState<string[]>([]);
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [isEmailDropdownOpen, setIsEmailDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Estados de Negócio
  const [resolvedItems, setResolvedItems] = useState<string[]>([]);
  const [nextOperator, setNextOperator] = useState<string>(""); 

  // Mock de Operadores do Sistema
  const availableOperators = [
    { id: 'OP-01', name: 'Carlos Oliveira' },
    { id: 'OP-02', name: 'Fernanda Souza' },
    { id: 'OP-03', name: 'Ricardo Mendes' },
    { id: 'OP-04', name: 'Patrícia Lima' },
  ];

  // Lista de Destinatários de E-mail
  const emailRecipients = [
    { id: 'lider_rd_mt', label: 'LÍDER RD_MT' },
    { id: 'lider_at', label: 'LÍDER AT' },
    { id: 'executivo', label: 'EXECUTIVO' },
    { id: 'gerente', label: 'GERENTE' }
  ];

  // Fecha o dropdown se clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsEmailDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const allPendingItems = useMemo(() => {
    if (!turnoAtual) return [];
        
        // Adicionamos ( || [] ) para garantir que o .map não quebre a tela se a API não mandar o array
      return [
        ...(turnoAtual.pendenciasHerdadas || []).map(p => ({ ...p, origem: 'Herdada' })),
        ...(turnoAtual.pendenciasDeixadas || []).map(p => ({ ...p, origem: 'Atual' }))
        ];
  }, [turnoAtual]);

  const toggleResolution = (id: string) => {
    setResolvedItems(prev => 
        prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const resolvedCount = resolvedItems.length;
  const handoverCount = allPendingItems.length - resolvedCount;
  
  const targetName = nextOperator 
    ? availableOperators.find(op => op.id === nextOperator)?.name 
    : "MESA";

  const handleAttemptFinish = () => {
    setIsFinishModalOpen(true);
  };

  // === Ação real de encerramento com a API ===
    const handleConfirmFinish = async () => {
        try {
        setIsFinishing(true);

        await finishShiftApi({
            briefing: briefing,
            proximoOperador: nextOperator || null,
            pendenciasResolvidas: resolvedItems
        });

        setFinishedShiftState({
            ...turnoAtual,
            briefingFinal: briefing,
            pendenciasResolvidas: allPendingItems.filter(i => resolvedItems.includes(i.id)),
            pendenciasRepassadas: allPendingItems.filter(i => !resolvedItems.includes(i.id)),
            proximoOperador: nextOperator || 'MESA',
            dataFechamento: new Date(),
            fim: format(new Date(), 'HH:mm')
        });

        encerrarTurno(); 
        setIsFinishModalOpen(false);
        } catch (error: any) {
            console.error("Erro da API:", error.response?.data);
            
            const mensagemErro = error.response?.data?.message || error.response?.data?.error || "Erro desconhecido no servidor.";
            alert(`Falha ao encerrar turno:\n${mensagemErro}`);
        } finally {
        setIsFinishing(false);
        }
    };

  const handleAttemptReopen = () => {
    setIsReopenModalOpen(true);
  };

  const handleConfirmReopen = () => {
    setFinishedShiftState(null);
    setIsReopenModalOpen(false);
    setSelectedRecipients([]);
    setIsSendingEmail(false);
  };

  const toggleRecipient = (id: string) => {
    setSelectedRecipients(prev => {
        if (prev.includes(id)) {
            return prev.filter(item => item !== id);
        } else {
            return [...prev, id];
        }
    });
  };

  const handleSendEmail = () => {
    if (selectedRecipients.length === 0) return;
    
    setIsSendingEmail(true);
    
    setTimeout(() => {
        setIsSendingEmail(false);
        const names = emailRecipients
            .filter(r => selectedRecipients.includes(r.id))
            .map(r => r.label)
            .join(', ');
            
        alert(`E-mail enviado com sucesso para: ${names}`);
        setSelectedRecipients([]); 
        setIsEmailDropdownOpen(false);
    }, 2000);
  };

  const handleLogoutSystem = () => {
    if (window.confirm("Tem certeza que deseja sair do sistema?")) {
        if (logout) {
            logout();
        } else {
            console.log("Logout function not implemented in hook");
            window.location.reload();
        }
    }
  };

  const calculateDuration = (startTimeStr: string, endDate: Date) => {
    if (!startTimeStr || !endDate) return "0h 00m";
    
    const [startH, startM] = startTimeStr.split(':').map(Number);
    const endH = endDate.getHours();
    const endM = endDate.getMinutes();
    
    let diffMinutes = (endH * 60 + endM) - (startH * 60 + startM);
    
    if (diffMinutes < 0) {
      diffMinutes += 24 * 60;
    }

    const hours = Math.floor(diffMinutes / 60);
    const minutes = diffMinutes % 60;

    return `${hours}h ${minutes.toString().padStart(2, '0')}m`;
  };

  if (!turnoAtual && !finishedShiftState) return null;

  const dadosRelatorio = turnoAtual ? { ...turnoAtual, briefing } : finishedShiftState;
  const isAnyModalOpen = isHistoryOpen || isDetailModalOpen || isFinishModalOpen;

  // --- TELA: TURNO ENCERRADO (Exibida se finishedShiftState existe) ---
  if (finishedShiftState) {
    const durationString = calculateDuration(finishedShiftState.inicio, finishedShiftState.dataFechamento);

    return (
        <>
            <ShiftReportPrintView turno={dadosRelatorio} operatorEmail={user.email} />
            
            <div className={`min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-4 animate-fade-in transition-all duration-300 ${isReopenModalOpen ? 'blur-sm opacity-50' : ''}`}>
                <div className="max-w-lg w-full bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden relative">
                    
                    {/* Header Decorativo */}
                    <div className="h-28 bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center relative">
                        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
                        <div className="bg-white p-3 rounded-full shadow-lg relative z-10 animate-bounce-slow mt-8">
                            <Lock className="w-6 h-6 text-emerald-600" />
                        </div>
                    </div>

                    <div className="px-8 pb-8 pt-4 text-center">
                        <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-1">Turno Encerrado!</h2>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
                            Dados transmitidos para a mesa com sucesso.
                        </p>

                        {/* Card de Resumo */}
                        <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4 mb-6 text-left border border-slate-100 dark:border-slate-700">
                            <div className="flex justify-between items-center mb-2 border-b border-slate-200 dark:border-slate-700 pb-2">
                                <span className="text-xs font-semibold text-slate-400 uppercase">Operador</span>
                                <span className="text-sm font-bold text-slate-700 dark:text-slate-200">{user.name}</span>
                            </div>
                            <div className="flex justify-between items-center mb-2 border-b border-slate-200 dark:border-slate-700 pb-2">
                                <span className="text-xs font-semibold text-slate-400 uppercase">Destino</span>
                                <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                                    {availableOperators.find(o => o.id === finishedShiftState.proximoOperador)?.name || 'MESA'}
                                </span>
                            </div>
                            <div className="flex justify-between items-center pt-1">
                                <span className="text-xs font-semibold text-slate-400 uppercase flex items-center gap-1">
                                    <Clock className="w-3 h-3" /> Duração
                                </span>
                                <span className="text-sm font-bold text-slate-800 dark:text-white bg-slate-200 dark:bg-slate-700 px-2 py-0.5 rounded text-xs">
                                    {durationString}
                                </span>
                            </div>
                        </div>

                        {/* === MULTI-SELECT DE EMAIL === */}
                        <div className="mb-6 bg-slate-50 dark:bg-slate-800/40 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
                            <div className="flex items-center gap-2 mb-3 text-slate-700 dark:text-slate-300 font-bold text-sm">
                                <div className="bg-slate-700 dark:bg-slate-600 text-white p-1 rounded">
                                    <Mail className="w-3 h-3" />
                                </div>
                                <span>Enviar e-mail para :</span>
                            </div>
                            
                            <div className="flex gap-2 items-start" ref={dropdownRef}>
                                <div className="relative flex-1">
                                    <button
                                        onClick={() => setIsEmailDropdownOpen(!isEmailDropdownOpen)}
                                        disabled={isSendingEmail}
                                        className="w-full bg-white dark:bg-slate-900 border border-amber-300 dark:border-amber-700 rounded-lg px-3 py-2.5 text-sm text-left flex justify-between items-center focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all"
                                    >
                                        <span className={`truncate ${selectedRecipients.length === 0 ? 'text-slate-400' : 'text-slate-800 dark:text-white font-medium'}`}>
                                            {selectedRecipients.length === 0 
                                                ? "Selecione os destinatários..." 
                                                : `${selectedRecipients.length} selecionado(s)`}
                                        </span>
                                        <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${isEmailDropdownOpen ? 'rotate-180' : ''}`} />
                                    </button>

                                    {isEmailDropdownOpen && (
                                        <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-slate-900 border border-amber-200 dark:border-amber-800 rounded-lg shadow-xl z-50 max-h-48 overflow-y-auto animate-fade-in-up">
                                            {emailRecipients.map(recipient => {
                                                const isSelected = selectedRecipients.includes(recipient.id);
                                                return (
                                                    <div 
                                                        key={recipient.id}
                                                        onClick={() => toggleRecipient(recipient.id)}
                                                        className={`px-3 py-2 cursor-pointer flex items-center gap-2 text-sm transition-colors hover:bg-amber-50 dark:hover:bg-amber-900/20
                                                            ${isSelected ? 'text-amber-700 dark:text-amber-400 bg-amber-50/50' : 'text-slate-600 dark:text-slate-300'}
                                                        `}
                                                    >
                                                        <div className={`w-4 h-4 rounded border flex items-center justify-center transition-all ${isSelected ? 'bg-amber-500 border-amber-500' : 'border-slate-300 dark:border-slate-600'}`}>
                                                            {isSelected && <Check className="w-3 h-3 text-white" />}
                                                        </div>
                                                        {recipient.label}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>

                                <button
                                    onClick={handleSendEmail}
                                    disabled={selectedRecipients.length === 0 || isSendingEmail}
                                    className={`
                                        px-4 py-2.5 rounded-lg font-bold text-white transition-all flex items-center justify-center gap-2
                                        ${selectedRecipients.length === 0 || isSendingEmail 
                                            ? 'bg-amber-300 cursor-not-allowed' 
                                            : 'bg-amber-600 hover:bg-amber-700 shadow-md shadow-amber-500/20 active:scale-95'
                                        }
                                    `}
                                    title="Enviar para selecionados"
                                >
                                    {isSendingEmail ? (
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                    ) : (
                                        <>
                                            <Send className="w-4 h-4" />
                                            <span className="hidden sm:inline">{selectedRecipients.length > 0 && selectedRecipients.length}</span>
                                        </>
                                    )}
                                </button>
                            </div>
                            
                            {selectedRecipients.length > 0 && (
                                <div className="mt-2 flex flex-wrap gap-1">
                                    {selectedRecipients.map(id => (
                                        <span key={id} className="text-[10px] font-bold bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-400 px-2 py-0.5 rounded-full border border-amber-200 dark:border-amber-800/50 flex items-center gap-1">
                                            {emailRecipients.find(r => r.id === id)?.label}
                                            <button onClick={() => toggleRecipient(id)} className="hover:text-red-500"><X className="w-2.5 h-2.5" /></button>
                                        </span>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Botões de Ação */}
                        <div className="space-y-3">
                            <button 
                                onClick={imprimirRelatorio}
                                className="w-full py-3 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-white font-medium flex items-center justify-center gap-2 transition-all group"
                            >
                                <FileText className="w-4 h-4 text-slate-500 group-hover:text-slate-800 dark:text-slate-400 dark:group-hover:text-white" />
                                Gerar Relatório PDF
                            </button>

                            <button 
                                onClick={handleAttemptReopen}
                                className="w-full py-3 px-4 rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-700 text-slate-500 hover:text-emerald-600 hover:border-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-900/10 transition-all flex items-center justify-center gap-2 text-sm"
                            >
                                <RotateCcw className="w-4 h-4" />
                                Reabrir Turno (Correção)
                            </button>
                        </div>
                    </div>

                    <div className="bg-slate-50 dark:bg-slate-950/50 p-3 flex justify-between items-center border-t border-slate-100 dark:border-slate-800">
                        <button 
                            onClick={finalizarNavegacao}
                            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-xs font-medium transition-colors"
                        >
                            Voltar para o Dashboard
                        </button>

                        <button 
                            onClick={handleLogoutSystem}
                            className="text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5"
                        >
                            <LogOut className="w-3.5 h-3.5" />
                            Sair do Sistema
                        </button>
                    </div>
                </div>
            </div>

            {/* === MODAL DE CONFIRMAÇÃO DE REABERTURA === */}
            {isReopenModalOpen && (
                <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
                    <div 
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm" 
                        onClick={() => setIsReopenModalOpen(false)}
                    />
                    <div className="relative bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-sm border border-slate-200 dark:border-slate-800 animate-fade-in-up overflow-hidden">
                        
                        {/* Header do Modal */}
                        <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-amber-50 dark:bg-amber-900/10">
                            <h3 className="text-lg font-bold text-amber-800 dark:text-amber-500 flex items-center gap-2">
                                <RotateCcw className="w-5 h-5" />
                                Reabrir Turno?
                            </h3>
                            <button 
                                onClick={() => setIsReopenModalOpen(false)}
                                className="p-1 rounded-full hover:bg-amber-100 dark:hover:bg-amber-900/30 transition-colors text-amber-700/50"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Conteúdo */}
                        <div className="p-6">
                            <div className="flex gap-4">
                                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-amber-100 dark:bg-amber-900/20 flex items-center justify-center">
                                    <AlertTriangle className="w-6 h-6 text-amber-600 dark:text-amber-500" />
                                </div>
                                <div>
                                    <p className="text-sm text-slate-600 dark:text-slate-300 mb-2">
                                        Você está prestes a reabrir um turno já encerrado.
                                    </p>
                                    <p className="text-xs text-slate-500 dark:text-slate-400">
                                        O relatório final atual será descartado e você voltará para a tela de edição. Você precisará finalizar o turno novamente após as correções.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 flex gap-3">
                            <button 
                                onClick={() => setIsReopenModalOpen(false)}
                                className="flex-1 px-4 py-2.5 rounded-lg font-medium text-slate-600 bg-white border border-slate-300 hover:bg-slate-50 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700 dark:hover:bg-slate-700 transition-colors"
                            >
                                Cancelar
                            </button>
                            <button 
                                onClick={handleConfirmReopen}
                                className="flex-1 px-4 py-2.5 rounded-lg font-bold text-white bg-amber-500 hover:bg-amber-600 shadow-lg shadow-amber-500/20 transition-all"
                            >
                                Sim, Reabrir
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
  }

  // --- TELA NORMAL (TURNO EM ANDAMENTO) ---
  return (
    <>
      {dadosRelatorio && (
        <ShiftReportPrintView turno={dadosRelatorio} operatorEmail={user.email} />
      )}

      <div className="print:hidden min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-300 font-sans relative">
        <div className="p-6 lg:p-8 max-w-7xl mx-auto animate-fade-in relative">
          
          {/* TOPO */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
            <button onClick={finalizarNavegacao} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white shadow-sm transition-all group">
              <ArrowRight className="w-4 h-4 rotate-180 group-hover:-translate-x-1 transition-transform" /> 
              <span className="font-medium text-sm">Voltar ao Dashboard</span>
            </button>
            
            <div className="flex items-center gap-3">
                <button onClick={() => setIsHistoryOpen(true)} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white dark:bg-slate-900 border border-emerald-200 dark:border-emerald-800/50 text-emerald-700 dark:text-emerald-400 font-medium text-sm hover:bg-emerald-50 dark:hover:bg-emerald-900/20 hover:shadow-md transition-all group">
                <CalendarIcon className="w-4 h-4 text-emerald-500 group-hover:scale-110 transition-transform" />
                <span>Ver Histórico Completo</span>
                </button>
            </div>
          </div>

          <div className={`transition-all duration-300 ${isAnyModalOpen ? 'blur-sm opacity-50' : ''}`}>
            
            <header className="rounded-2xl p-8 text-center border relative overflow-hidden bg-white border-emerald-100 shadow-sm dark:bg-slate-900/80 dark:border-emerald-500/30 mb-8">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-400 via-teal-500 to-emerald-600" />
              <div className="relative z-10">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 text-xs font-bold uppercase tracking-wider mb-3">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /> Em Andamento
                </div>
                <h1 className="text-3xl lg:text-4xl font-bold mb-2 text-slate-800 dark:text-white tracking-tight">Painel de Controle • {turnoAtual?.funcao}</h1>
                <p className="text-lg text-slate-500 dark:text-slate-400">Operador: <strong className="text-slate-800 dark:text-slate-200">{user.name}</strong> • Início às {turnoAtual?.inicio}</p>
              </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
              
              {/* === COLUNA PRINCIPAL (ESQUERDA) === */}
              <div className="lg:col-span-2 space-y-6">
                <main className="rounded-2xl shadow-sm border bg-white border-slate-200 dark:bg-slate-900/70 dark:border-slate-800 h-full overflow-hidden">
                  
                  {/* CHECKLIST DE RESOLUÇÃO */}
                  <div className="bg-slate-50 dark:bg-slate-950/50 border-b border-slate-200 dark:border-slate-800 p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
                            <CheckSquare className="w-5 h-5 text-emerald-500" />
                            Resolução de Pendências
                        </h2>
                        
                        <div className="flex gap-2">
                           <span className="text-xs font-bold px-2 py-1 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
                                {resolvedCount} Resolvidos
                           </span>
                           {handoverCount > 0 && (
                               <span className="text-xs font-bold px-2 py-1 rounded-full bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400">
                                    {handoverCount} Repassados
                               </span>
                           )}
                        </div>
                    </div>

                    <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
                        Marque as pendências que você <strong>resolveu</strong>. Itens não marcados serão repassados automaticamente para o próximo turno.
                    </p>

                    <div className="space-y-2">
                        {allPendingItems.map((item) => {
                            const isResolved = resolvedItems.includes(item.id);
                            return (
                                <div 
                                    key={item.id} 
                                    onClick={() => toggleResolution(item.id)}
                                    className={`
                                        group flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-all duration-200 select-none
                                        ${isResolved 
                                            ? 'bg-emerald-50/50 border-emerald-200 dark:bg-emerald-900/10 dark:border-emerald-900/50' 
                                            : 'bg-white border-slate-200 shadow-sm dark:bg-slate-900 dark:border-slate-800 hover:border-orange-300 dark:hover:border-orange-700'}
                                    `}
                                >
                                    <div className="mt-0.5 transition-colors">
                                        {isResolved ? (
                                            <div className="bg-emerald-500 rounded text-white p-0.5">
                                                <Check className="w-4 h-4" />
                                            </div>
                                        ) : (
                                            <div className="border-2 border-slate-300 rounded w-5 h-5 group-hover:border-orange-400 flex items-center justify-center">
                                                <ArrowRightCircle className="w-3 h-3 text-transparent group-hover:text-orange-400" />
                                            </div>
                                        )}
                                    </div>
                                    
                                    <div className="flex-1">
                                        <div className="flex justify-between items-start">
                                            <span className={`text-sm font-medium transition-all ${isResolved ? 'text-emerald-700 dark:text-emerald-400 line-through decoration-emerald-500/30' : 'text-slate-800 dark:text-white'}`}>
                                                {item.descricao}
                                            </span>
                                            <span className={`text-[10px] uppercase font-bold px-1.5 py-0.5 rounded ${
                                                item.origem === 'Herdada' 
                                                ? 'bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400' 
                                                : 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400'
                                            }`}>
                                                {item.origem}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2 mt-1">
                                            <span className={`text-[10px] font-bold uppercase flex items-center gap-1 ${isResolved ? 'text-emerald-600' : 'text-orange-500'}`}>
                                                {isResolved ? '✓ Concluído' : '→ Próximo Turno'}
                                            </span>
                                            <span className="text-[10px] text-slate-300">•</span>
                                            <span className={`text-[10px] font-bold uppercase ${item.prioridade === 'crítica' ? 'text-red-500' : 'text-slate-400'}`}>
                                                {item.prioridade}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                        
                        {allPendingItems.length === 0 && (
                            <div className="text-sm text-slate-400 italic p-4 text-center border border-dashed border-slate-200 rounded">
                                <CheckCircle className="w-5 h-5 mx-auto mb-1 text-slate-300" />
                                Nenhuma pendência registrada neste turno.
                            </div>
                        )}
                    </div>
                  </div>

                  {/* ÁREA DE BRIEFING E ENCERRAMENTO */}
                  <div className="p-8">
                    <div className="mb-4">
                        <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <History className="w-5 h-5 text-slate-400" />
                        Briefing Final
                        </h2>
                    </div>

                    <textarea
                        value={briefing}
                        onChange={e => setBriefing(e.target.value)}
                        rows={8}
                        className="w-full rounded-xl px-5 py-4 resize-none leading-relaxed bg-white border border-slate-300 text-slate-900 placeholder-slate-400 dark:bg-slate-950/50 dark:border-slate-700 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                        placeholder="Descreva aqui o resumo do turno, manobras realizadas..."
                    />
                    
                    <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800">
                        
                        {/* SELEÇÃO DO PRÓXIMO OPERADOR */}
                        <div className="mb-6 bg-slate-50 dark:bg-slate-900/40 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
                            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3 flex items-center gap-2">
                                <UserPlus className="w-4 h-4 text-emerald-500" />
                                Passar turno para:
                            </label>
                            
                            <div className="relative">
                                <select
                                    value={nextOperator}
                                    onChange={(e) => setNextOperator(e.target.value)}
                                    className={`w-full appearance-none rounded-lg border px-4 py-3 pr-10 bg-white dark:bg-slate-950 focus:outline-none focus:ring-2 transition-all cursor-pointer
                                    ${nextOperator 
                                        ? 'border-emerald-300 ring-emerald-100 text-slate-800 dark:text-white font-medium' 
                                        : 'border-slate-300 text-slate-500 dark:border-slate-700 italic'
                                    }`}
                                >
                                    <option value="">-- Ninguém selecionado (Enviar para Mesa) --</option>
                                    {availableOperators.map(op => (
                                        <option key={op.id} value={op.id}>
                                            {op.name}
                                        </option>
                                    ))}
                                </select>
                                <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none text-slate-500">
                                    <Users className="w-4 h-4" />
                                </div>
                            </div>

                            {/* Feedback Visual do destino */}
                            <div className="mt-2 text-xs">
                                {nextOperator ? (
                                    <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                                        <CheckCircle className="w-3 h-3" /> 
                                        O turno será assumido por <strong>{availableOperators.find(o => o.id === nextOperator)?.name}</strong>
                                    </span>
                                ) : (
                                    <span className="text-slate-400 flex items-center gap-1">
                                        <AlertTriangle className="w-3 h-3" /> 
                                        Nenhum operador selecionado. O turno será passado para a <strong>MESA</strong>.
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* Aviso Informativo sobre Repasse */}
                        {handoverCount > 0 && (
                            <div className="mb-4 flex items-center gap-3 text-sm text-orange-700 dark:text-orange-400 bg-orange-50 dark:bg-orange-900/20 p-4 rounded-lg border border-orange-100 dark:border-orange-900/50">
                                <AlertTriangle className="w-5 h-5 flex-shrink-0" />
                                <span>
                                    <strong>Atenção:</strong> Você está deixando <u>{handoverCount} item(s)</u> sem resolver. Eles serão adicionados automaticamente à lista do próximo operador.
                                </span>
                            </div>
                        )}

                        <button
                            onClick={handleAttemptFinish}
                            className="w-full sm:w-auto ml-auto px-8 py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-3 shadow-lg transition-all bg-gradient-to-r from-emerald-600 to-teal-700 text-white hover:from-emerald-500 hover:to-teal-600 shadow-emerald-500/20 transform active:scale-[0.98]"
                        >
                            <CheckCircle className="w-6 h-6" />
                            Finalizar Turno
                        </button>
                    </div>
                  </div>
                </main>
              </div>

              {/* === COLUNA LATERAL (WIDGET TURNOS HOJE) === */}
              <div className="lg:col-span-1">
                  <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden sticky top-8">
                  <div className="bg-slate-50 dark:bg-slate-800/50 p-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
                    <div>
                        <h3 className="font-bold text-slate-700 dark:text-white">Turnos de Hoje</h3>
                        <p className="text-xs text-slate-400">{format(new Date(), 'dd/MM/yyyy')}</p>
                    </div>
                    <div className="bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 text-xs font-bold px-2 py-1 rounded">{todaysShifts.length}</div>
                  </div>
                  <div className="divide-y divide-slate-100 dark:divide-slate-800 max-h-[500px] overflow-y-auto">
                    {todaysShifts.map((shift) => (
                      <div key={shift.id} className="p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group">
                        <div className="flex justify-between items-start mb-2">
                            <span className="text-[10px] font-mono text-slate-400 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">{shift.id}</span>
                            <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full flex items-center gap-1 ${shift.status === 'Aberto' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'}`}>
                                <span className={`w-1.5 h-1.5 rounded-full ${shift.status === 'Aberto' ? 'bg-emerald-500 animate-pulse' : 'bg-slate-500'}`} />{shift.status}
                            </span>
                        </div>
                        <div className="flex items-center gap-2 mb-1"><User className="w-3.5 h-3.5 text-slate-400" /><p className="text-sm font-bold text-slate-700 dark:text-slate-200 truncate">{shift.operador}</p></div>
                        <div className="flex items-center gap-2 mb-3"><Clock className="w-3.5 h-3.5 text-slate-400" /><p className="text-xs text-slate-500 dark:text-slate-400">{shift.horario} • {shift.tipo}</p></div>
                        <button onClick={() => { setSelectedShiftForDetail(shift); setIsDetailModalOpen(true); }} className="w-full py-1.5 text-xs font-medium border border-slate-200 dark:border-slate-700 rounded text-slate-600 dark:text-slate-400 hover:border-emerald-500 hover:text-emerald-600 transition-colors flex items-center justify-center gap-2 group-hover:bg-white dark:group-hover:bg-slate-700"><Eye className="w-3 h-3" /> Visualizar Detalhes</button>
                      </div>
                    ))}
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-800/30 p-3 text-center border-t border-slate-100 dark:border-slate-800">
                      <button onClick={() => setIsHistoryOpen(true)} className="text-xs text-emerald-600 font-medium hover:underline">Ver datas anteriores</button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <ShiftHistoryModal isOpen={isHistoryOpen} onClose={() => setIsHistoryOpen(false)} />
          <ShiftDetailModal isOpen={isDetailModalOpen} onClose={() => setIsDetailModalOpen(false)} shiftData={selectedShiftForDetail} />
          
          {/* === MODAL DE CONFIRMAÇÃO DE ENCERRAMENTO === */}
          {isFinishModalOpen && (
            <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
              <div 
                className="absolute inset-0 bg-black/50 backdrop-blur-sm" 
                onClick={() => !isFinishing && setIsFinishModalOpen(false)}
              />
              <div className="relative bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-md border border-slate-200 dark:border-slate-800 animate-fade-in-up overflow-hidden">
                
                {/* Header do Modal */}
                <div className="p-6 pb-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-900">
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-emerald-600" />
                    Confirmar Encerramento
                  </h3>
                  <button 
                    onClick={() => setIsFinishModalOpen(false)}
                    disabled={isFinishing}
                    className="p-1 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors text-slate-500 disabled:opacity-50"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Conteúdo do Modal */}
                <div className="p-6 space-y-4">
                  <div className="p-4 bg-emerald-50 dark:bg-emerald-900/10 rounded-xl border border-emerald-100 dark:border-emerald-900/30">
                    <p className="text-sm text-emerald-800 dark:text-emerald-200 font-medium mb-1">Destino do Turno</p>
                    <div className="flex items-center gap-2 text-lg font-bold text-emerald-900 dark:text-emerald-100">
                        <User className="w-5 h-5" />
                        {targetName?.toUpperCase()}
                        {!nextOperator && <span className="text-xs font-normal opacity-70 ml-1">(Ninguém selecionado)</span>}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg text-center">
                        <span className="block text-2xl font-bold text-slate-700 dark:text-white">{resolvedCount}</span>
                        <span className="text-xs text-slate-500 font-medium uppercase tracking-wide">Pendências Resolvidas</span>
                    </div>
                    <div className={`p-3 rounded-lg text-center ${handoverCount > 0 ? 'bg-orange-50 dark:bg-orange-900/20' : 'bg-slate-50 dark:bg-slate-800'}`}>
                        <span className={`block text-2xl font-bold ${handoverCount > 0 ? 'text-orange-600 dark:text-orange-400' : 'text-slate-700 dark:text-white'}`}>{handoverCount}</span>
                        <span className={`text-xs font-medium uppercase tracking-wide ${handoverCount > 0 ? 'text-orange-700 dark:text-orange-400' : 'text-slate-500'}`}>Repassadas ao Próximo</span>
                    </div>
                  </div>

                  <p className="text-sm text-slate-500 dark:text-slate-400 text-center mt-2">
                    Deseja confirmar o encerramento e gerar o relatório final?
                  </p>
                </div>

                {/* Footer do Modal */}
                <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 flex gap-3">
                  <button 
                    onClick={() => setIsFinishModalOpen(false)}
                    disabled={isFinishing}
                    className="flex-1 px-4 py-2.5 rounded-lg font-medium text-slate-600 bg-white border border-slate-300 hover:bg-slate-50 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700 dark:hover:bg-slate-700 transition-colors disabled:opacity-50"
                  >
                    Cancelar
                  </button>
                  <button 
                    onClick={handleConfirmFinish}
                    disabled={isFinishing}
                    className="flex-1 px-4 py-2.5 rounded-lg font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {isFinishing ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <><Check className="w-4 h-4" /> Confirmar</>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </>
  );
};