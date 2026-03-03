import { X, Download } from 'lucide-react';
import type { MediaViewerState } from '../types/index';

interface MediaViewerModalProps {
  state: MediaViewerState; // Recebe o estado completo (null ou o objeto com url/type)
  onClose: () => void;     // Função para fechar (setViewerState(null))
}

export const MediaViewerModal = ({ state, onClose }: MediaViewerModalProps) => {
  // Se não houver estado (null) ou isOpen for falso, não renderiza nada
  if (!state || !state.isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-sm flex items-center justify-center animate-fade-in" 
      onClick={onClose}
    >
      {/* Botão Fechar (X) */}
      <button 
        onClick={onClose} 
        className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors z-50"
      >
        <X className="w-6 h-6" />
      </button>

      {/* Botão Download */}
      <a 
        href={state.url} 
        download
        target="_blank"
        rel="noreferrer"
        onClick={(e) => e.stopPropagation()}
        className="absolute top-4 right-16 p-2 bg-white/10 hover:bg-emerald-600 rounded-full text-white transition-colors z-50 flex items-center gap-2"
        title="Baixar arquivo"
      >
        <Download className="w-6 h-6" />
      </a>

      {/* Área de Conteúdo Central */}
      <div 
        className="w-full h-full p-4 md:p-10 flex items-center justify-center" 
        onClick={(e) => e.stopPropagation()}
      >
        {state.type === 'image' ? (
          <img 
            src={state.url} 
            alt="Visualização em tela cheia" 
            className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
          />
        ) : state.type === 'video' ? (
          <video 
            src={state.url} 
            controls 
            autoPlay
            className="max-w-full max-h-full rounded-lg shadow-2xl"
          />
        ) : (
          // Visualizador de PDF
          <div className="w-full h-full max-w-5xl bg-white rounded-lg shadow-2xl overflow-hidden">
             <iframe 
               src={state.url} 
               className="w-full h-full"
               title="Visualizador de PDF"
             />
          </div>
        )}
      </div>
    </div>
  );
};