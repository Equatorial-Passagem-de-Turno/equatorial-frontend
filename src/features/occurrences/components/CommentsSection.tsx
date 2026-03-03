import { useState } from 'react';
import { 
  Send, 
  Loader2, 
  User as UserIcon,
  MessageSquare, // Geral
  Wrench,        // Técnico
  Phone,         // Contato
  AlertTriangle, // Alerta
} from 'lucide-react';
import type { Comment } from '../types';

// --- 1. CONFIGURAÇÃO VISUAL DOS TIPOS ---
const commentTypesConfig: Record<string, { label: string, icon: any, color: string, bg: string, border: string }> = {
  "Geral": { 
    label: "Geral", 
    icon: MessageSquare, 
    color: "text-slate-600 dark:text-slate-300", 
    bg: "bg-slate-100 dark:bg-slate-800",
    border: "border-slate-200 dark:border-slate-700"
  },
  "Técnico": { 
    label: "Técnico", 
    icon: Wrench, 
    color: "text-blue-600 dark:text-blue-400", 
    bg: "bg-blue-50 dark:bg-blue-900/30",
    border: "border-blue-200 dark:border-blue-800"
  },
  "Contato": { 
    label: "Contato", 
    icon: Phone, 
    color: "text-purple-600 dark:text-purple-400", 
    bg: "bg-purple-50 dark:bg-purple-900/30",
    border: "border-purple-200 dark:border-purple-800"
  },
  "Alerta": { 
    label: "Alerta", 
    icon: AlertTriangle, 
    color: "text-red-600 dark:text-red-400", 
    bg: "bg-red-50 dark:bg-red-900/30",
    border: "border-red-200 dark:border-red-800"
  }
};

interface CommentsSectionProps {
  comments: Comment[];
  // --- 2. ATUALIZAÇÃO NA PROP: Agora aceita (text, type) ---
  onPostComment: (text: string, type: string) => Promise<void>; 
}

export const CommentsSection = ({ comments, onPostComment }: CommentsSectionProps) => {
  const [commentText, setCommentText] = useState('');
  // --- 3. NOVO ESTADO PARA O TIPO ---
  const [selectedType, setSelectedType] = useState('Geral'); 
  const [isPosting, setIsPosting] = useState(false);

  const handleSendClick = async () => {
    if (!commentText.trim()) return;
    
    setIsPosting(true);
    try {
      // Passa o texto E o tipo selecionado
      await onPostComment(commentText.trim(), selectedType);
      
      setCommentText('');
      setSelectedType('Geral'); // Reseta para o padrão após enviar
    } catch (error) {
      console.error("Erro ao postar comentário", error);
    } finally {
      setIsPosting(false);
    }
  };

  // Pega a configuração do tipo selecionado para usar nas cores da UI
  const currentTypeConfig = commentTypesConfig[selectedType];

  return (
    <div className="rounded-2xl p-6 bg-white border border-slate-200 dark:bg-slate-900/50 dark:border-slate-800 shadow-sm">
      <h3 className="text-lg font-bold mb-4 text-slate-900 dark:text-white">Atualizações</h3>
      
      {/* LISTA DE COMENTÁRIOS */}
      <div className="space-y-4 max-h-64 overflow-y-auto mb-6 scrollbar-thin pr-2">
        {comments?.length > 0 ? (
          comments.map(c => {
            // Recupera o estilo baseado no tipo salvo no comentário (ou usa Geral como fallback)
            const typeConfig = commentTypesConfig[c.type || 'Geral'] || commentTypesConfig['Geral'];
            const TypeIcon = typeConfig.icon;

            return (
              <div key={c.id} className={`rounded-xl p-4 border transition-all hover:border-slate-300 dark:hover:border-slate-700 ${typeConfig.bg} bg-opacity-40 dark:bg-opacity-20 ${typeConfig.border}`}>
                <div className="flex items-center justify-between text-sm mb-2">
                  <div className="flex items-center gap-2">
                    <div className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                        <UserIcon size={12} className="text-slate-400"/>
                        {c.author}
                    </div>

                    {/* Badge do Tipo no Histórico */}
                    <span className={`flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] uppercase font-bold tracking-wide border bg-white/60 dark:bg-black/20 ${typeConfig.color} border-current opacity-80`}>
                      <TypeIcon size={10} />
                      {typeConfig.label}
                    </span>
                  </div>
                  <div className="text-xs text-slate-400">{new Date(c.createdAt).toLocaleString()}</div>
                </div>
                <div className="text-sm whitespace-pre-wrap text-slate-700 dark:text-slate-300">{c.text}</div>
              </div>
            );
          })
        ) : (
          <p className="text-sm text-slate-400 text-center py-4 italic">Nenhum comentário ainda.</p>
        )}
      </div>

      {/* ÁREA DE INPUT */}
      <div className="relative bg-slate-50 dark:bg-slate-900/50 p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
        
        {/* --- 4. SELETOR DE TIPOS (CHIPS) --- */}
        <div className="flex flex-wrap gap-2 mb-3">
          {Object.keys(commentTypesConfig).map((typeKey) => {
            const config = commentTypesConfig[typeKey];
            const Icon = config.icon;
            const isSelected = selectedType === typeKey;

            return (
              <button
                key={typeKey}
                onClick={() => setSelectedType(typeKey)}
                className={`
                  flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wide border transition-all duration-200
                  ${isSelected 
                    ? `${config.bg} ${config.color} ${config.border} shadow-sm scale-105` 
                    : 'bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-700 text-slate-400 hover:border-slate-300 dark:hover:border-slate-600'
                  }
                `}
              >
                <Icon size={12} />
                {config.label}
              </button>
            );
          })}
        </div>

        <textarea 
          value={commentText} 
          onChange={(e) => setCommentText(e.target.value)} 
          placeholder={`Escreva um comentário ${selectedType.toLowerCase()}...`} 
          disabled={isPosting}
          className="w-full rounded-xl p-3 h-24 bg-white border border-slate-200 dark:bg-slate-950 dark:border-slate-700 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500/50 resize-none transition-all disabled:opacity-50 placeholder:text-slate-400" 
        />
        
        <div className="flex justify-between items-center mt-3">
          <span className="text-xs text-slate-400 font-medium ml-1 hidden sm:inline-block">
            Tipo: <strong className={currentTypeConfig.color}>{selectedType}</strong>
          </span>

          <button 
            onClick={handleSendClick} 
            disabled={isPosting || !commentText.trim()} 
            className="px-6 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-lg shadow-emerald-500/20 transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed ml-auto"
          >
              {isPosting ? <Loader2 className="w-4 h-4 animate-spin"/> : <Send className="w-4 h-4" />}
              Postar
          </button>
        </div>
      </div>
    </div>
  );
};