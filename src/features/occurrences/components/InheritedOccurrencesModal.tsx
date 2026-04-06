import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { 
  Radio, CheckCircle2, MapPin, Clock, 
  CheckSquare, Square, MousePointerClick // Novos ícones importados
} from 'lucide-react';
import { type ShiftHandoverData } from '../services/occurrenceService'; 

interface Props {
  isOpen: boolean;
  data: ShiftHandoverData | null;
  // ATUALIZADO: Agora recebe também a lista de IDs selecionados
  onAcknowledge: (observation: string, selectedIds: string[]) => void;
}

export const InheritedOccurrencesModal = ({ isOpen, data, onAcknowledge }: Props) => {
  const [observation, setObservation] = useState('');
  const [mounted, setMounted] = useState(false);
  
  // NOVO: Estado para armazenar os IDs das ocorrências selecionadas
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Garante montagem do componente
  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  // Bloqueio de scroll
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      // Quando abrir, podemos pré-selecionar todos (opcional, mas recomendado)
      // ou deixar vazio para o usuário selecionar manualmente.
      // Aqui estou deixando vazio para forçar a seleção manual conforme seu pedido.
      if (data) {
         setSelectedIds([]); 
      }
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen, data]);

  // NOVO: Função para alternar a seleção de uma ocorrência
  const toggleSelection = (id: string) => {
    setSelectedIds(prev => {
      if (prev.includes(id)) {
        return prev.filter(item => item !== id); // Remove se já existe
      } else {
        return [...prev, id]; // Adiciona se não existe
      }
    });
  };

  // NOVO: Selecionar ou Desmarcar tudo
  const toggleAll = () => {
    if (!data) return;
    if (selectedIds.length === data.occurrences.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(data.occurrences.map(o => o.id));
    }
  };

  if (!isOpen || !data || !mounted) return null;

  const getLocationString = (loc: any) => {
    if (!loc) return 'Local não informado';
    if (typeof loc === 'string') return loc;
    const parts = [];
    if (loc.subestacao) parts.push(`SE: ${loc.subestacao}`);
    if (loc.alimentador) parts.push(`AL: ${loc.alimentador}`);
    if (loc.reference) parts.push(loc.reference);
    if (loc.city) parts.push(loc.city);
    return parts.join(' • ');
  };

  const getPriorityColor = (priority: string) => {
    switch (priority?.toLowerCase()) {
        case 'crítica': return 'text-red-500 border-red-500/30 bg-red-500/10';
        case 'alta': return 'text-orange-500 border-orange-500/30 bg-orange-500/10';
        case 'média': return 'text-yellow-500 border-yellow-500/30 bg-yellow-500/10';
        default: return 'text-blue-500 border-blue-500/30 bg-blue-500/10';
    }
  };

  const modalContent = (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 dark:bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-300">
      <div className="bg-theme-panel text-theme-text w-full max-w-3xl rounded-xl shadow-2xl overflow-hidden border border-theme-border flex flex-col max-h-[95vh] relative z-[10000]">

        {/* --- CABEÇALHO --- */}
        <div className="relative bg-theme-input p-6 border-t-4 border-emerald-500 shadow-md z-10">
          <div className="flex justify-between items-start mb-4">
            <div className="flex items-center gap-3">
              <Radio className="w-6 h-6 text-theme-text animate-pulse" />
              <div>
                <h2 className="text-2xl font-bold text-theme-text">Passagem de Turno</h2>
                <p className="text-xs text-theme-muted">Selecione as ocorrências para assumir</p>
              </div>
            </div>
            
            <div className="text-right">
               {selectedIds.length > 0 && (
                <span className="text-emerald-500 font-bold text-sm bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
                  {selectedIds.length} Selecionados
                </span>
               )}
            </div>
          </div>

          <div className="flex flex-wrap gap-6 text-xs text-theme-muted font-medium uppercase tracking-wider">
              <div><span className="text-theme-muted mr-1">Anterior:</span><span className="text-theme-text bg-theme-panel px-2 py-0.5 rounded">{data.previousOperator}</span></div>
              <div><span className="text-theme-muted mr-1">Horário:</span><span className="text-theme-text bg-theme-panel px-2 py-0.5 rounded">{data.shiftTime}</span></div>
              <div><span className="text-theme-muted mr-1">Data:</span><span className="text-theme-text bg-theme-panel px-2 py-0.5 rounded">{data.date}</span></div>
          </div>
        </div>

        {/* --- CONTEÚDO SCROLLÁVEL --- */}
        <div className="flex-1 overflow-y-auto p-6 space-y-8 bg-theme-panel scrollbar-thin scrollbar-thumb-theme-border/70 scrollbar-track-transparent"> 
          
          {/* Relatório Anterior */}
          <section>
           <h3 className="text-theme-text font-bold mb-3 text-lg flex items-center gap-2">
              <span className="w-1 h-6 bg-blue-500 rounded-full"></span>
              Relatório Geral
            </h3>
           <div className="bg-theme-input border border-theme-border p-4 rounded-lg shadow-inner">
            <p className="text-theme-muted leading-relaxed text-sm whitespace-pre-wrap font-sans">"{data.reportText}"</p>
           </div>
          </section>

          {/* Lista de Ocorrências Selecionáveis */}
          <section>
            <div className="flex justify-between items-center mb-3">
                <h3 className="flex items-center gap-2 text-theme-text font-bold text-lg">
                    <span className="w-1 h-6 bg-yellow-500 rounded-full"></span>
                    Ocorrências Pendentes ({data.occurrences.length})
                </h3>
                <button 
                    onClick={toggleAll}
                    className="text-xs font-bold text-emerald-500 hover:text-emerald-400 uppercase tracking-wide flex items-center gap-1"
                >
                    {selectedIds.length === data.occurrences.length ? 'Desmarcar Todos' : 'Selecionar Todos'}
                </button>
            </div>
            
            <div className="space-y-3">
              {data.occurrences.map((occ) => {
                const badgeStyle = getPriorityColor(occ.priority);
                const isSelected = selectedIds.includes(occ.id);
                
                return (
                  // ATUALIZADO: Card agora é clicável e muda de estilo
                  <div 
                    key={occ.id} 
                    onClick={() => toggleSelection(occ.id)}
                    className={`
                        relative border rounded-lg p-4 flex items-start gap-4 transition-all cursor-pointer group select-none
                        ${isSelected 
                            ? 'bg-emerald-500/5 border-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.1)]' 
                            : 'bg-theme-input border-theme-border hover:border-theme-border/80 opacity-80 hover:opacity-100'}
                    `}
                  >
                    {/* Checkbox Visual */}
                    <div className="mt-1">
                        {isSelected ? (
                            <CheckSquare className="w-6 h-6 text-emerald-500 fill-emerald-500/20" />
                        ) : (
                            <Square className="w-6 h-6 text-theme-muted group-hover:text-theme-text transition-colors" />
                        )}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className="text-theme-muted text-xs font-mono bg-theme-panel px-1.5 py-0.5 rounded border border-theme-border/60">{occ.id}</span>
                        <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded border ${badgeStyle}`}>{occ.priority}</span>
                        <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded border border-theme-border bg-theme-panel text-theme-muted">{occ.status}</span>
                        <span className="ml-auto text-xs text-theme-muted flex items-center gap-1"><Clock className="w-3 h-3" /> {occ.timestamp}</span>
                      </div>

                      <h4 className={`font-bold text-base mb-1 truncate ${isSelected ? 'text-emerald-400' : 'text-theme-text'}`}>
                        {occ.title}
                      </h4>
                      
                      <div className="flex items-center gap-1.5 text-xs text-teal-400 mb-2 font-medium">
                        <MapPin className="w-3.5 h-3.5" />
                        {getLocationString(occ.location)}
                      </div>

                      <p className="text-theme-muted text-sm line-clamp-2">{occ.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        </div>

        {/* --- RODAPÉ DE AÇÃO --- */}
        <div className="p-6 bg-theme-input border-t border-theme-border space-y-4 z-10 shadow-[0_-5px_15px_rgba(0,0,0,0.3)]">
          <div>
            <label className="block text-theme-text font-bold mb-2 text-sm uppercase tracking-wide">Observações do Recebimento</label>
            <input 
              type="text"
              value={observation}
              onChange={(e) => setObservation(e.target.value)}
              placeholder="Alguma observação sobre a troca de turno?"
              className="w-full bg-theme-panel border border-theme-border rounded-lg p-4 text-theme-text placeholder:text-theme-muted focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
            />
          </div>

          <button 
            // ATUALIZADO: Passa a observação E os IDs selecionados
            onClick={() => onAcknowledge(observation, selectedIds)}
            disabled={selectedIds.length === 0} // Impede assumir se não selecionar nada? (opcional)
            className={`w-full font-bold py-4 rounded-lg flex items-center justify-center gap-2 transition-all shadow-lg text-lg
              ${selectedIds.length > 0 
                ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-900/20 active:scale-[0.99] cursor-pointer' 
                : 'bg-theme-panel border border-theme-border text-theme-muted cursor-not-allowed opacity-50'}
            `}
          >
            {selectedIds.length > 0 ? (
                <>
                    <CheckCircle2 className="w-6 h-6" />
                    Assumir {selectedIds.length} Evento{selectedIds.length !== 1 && 's'}
                </>
            ) : (
                <>
                    <MousePointerClick className="w-6 h-6" />
                    Selecione os eventos para assumir
                </>
            )}
          </button>
        </div>

      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};