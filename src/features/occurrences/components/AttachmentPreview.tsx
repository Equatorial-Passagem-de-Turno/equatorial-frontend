import { useState } from 'react';
import { Film, ImageIcon, FileText, Music } from 'lucide-react';

export const AttachmentPreview = ({ url, idx, onPreview }: { url: string; idx: number; onPreview: (url: string, type: 'image' | 'video' | 'pdf') => void }) => {

  const [loadError, setLoadError] = useState(false);
  const safeUrl = url || '';
  const lower = safeUrl.toLowerCase();

  const isPdf = lower.includes('application/pdf') || lower.includes('.pdf');
  const isVideo = lower.includes('data:video') || /\.(mp4|webm|ogg|mov)$/.test(lower);
  const isAudio = lower.includes('data:audio') || /\.(mp3|wav|ogg)$/.test(lower);
  const isImagePotential = !isPdf && !isVideo && !isAudio && !loadError;
  const commonBorder = "border border-slate-200 dark:border-slate-800 transition-all hover:border-emerald-500/50";

  // Lógica de nome do arquivo
  let name = `Arquivo ${idx + 1}`;
  if (!url.startsWith('data:') && !url.startsWith('blob:')) {
      const parts = url.split('/');
      name = parts[parts.length - 1].split('?')[0]; 
  } else if (isPdf) {
      name = `Documento PDF ${idx + 1}`;
  } else if (isAudio) {
      name = `Áudio ${idx + 1}`;
  }

  // Visualização de Vídeo
  if (isVideo) {
    return (
      <button 
        onClick={() => onPreview(url, 'video')}
        className={`rounded-xl overflow-hidden h-32 bg-black ${commonBorder} group relative w-full`}
      >
        <video src={url} className="w-full h-full object-cover pointer-events-none" />
        <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/40 transition-colors">
          <Film className="w-8 h-8 text-white opacity-90 group-hover:scale-110 transition-transform" />
        </div>
      </button>
    );
  }

  // Visualização de Imagem
  if (isImagePotential) {
    return (
      <button 
        onClick={() => onPreview(url, 'image')}
        className="block group relative overflow-hidden rounded-xl h-32 w-full text-left bg-slate-100 dark:bg-slate-900"
      >
        <img 
          src={url} 
          alt={`anexo-${idx}`} 
          className={`w-full h-full object-cover ${commonBorder} transition-transform duration-500 group-hover:scale-110`} 
          onError={() => setLoadError(true)} 
        />
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
            <ImageIcon className="text-white opacity-0 group-hover:opacity-100 drop-shadow-md transition-opacity" />
        </div>
      </button>
    );
  }

  // --- NOVA LÓGICA PARA PDF (Botão de Preview) ---
  if (isPdf) {
    return (
      <button 
        onClick={() => onPreview(url, 'pdf')}
        className={`flex flex-col items-center justify-center h-32 p-4 rounded-xl text-center gap-2 group bg-slate-50 text-slate-600 hover:bg-slate-100 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 ${commonBorder}`}
      >
         <FileText className="w-8 h-8 text-red-500 group-hover:scale-110 transition-transform duration-200" />
         <span className="text-xs font-medium truncate w-full px-2">{name}</span>
         <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider opacity-0 group-hover:opacity-100 transition-opacity">
            Visualizar
         </span>
      </button>
    );
  }

  // Outros arquivos (Áudio/Genérico) - Mantém link direto
  return (
    <a href={url} target="_blank" rel="noreferrer" className={`flex flex-col items-center justify-center h-32 p-4 rounded-xl text-center gap-2 group bg-slate-50 text-slate-600 hover:bg-slate-100 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 ${commonBorder}`}>
      {isAudio ? (
        <Music className="w-8 h-8 text-purple-500 group-hover:text-purple-600 transition-colors" />
      ) : (
        <FileText className="w-8 h-8 text-slate-400 group-hover:text-emerald-500 transition-colors" />
      )}
      
      <span className="text-xs font-medium truncate w-full px-2">{name}</span>
      <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider opacity-0 group-hover:opacity-100 transition-opacity">Baixar</span>
    </a>
  );
};
