import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  AlertTriangle, 
  Plus, 
  CheckCircle, 
  Loader2, 
  FileText, 
  AlertCircle, 
  MapPin, 
  X, 
  Eye, 
  Download, 
  Video, 
  Play,
  Signal,       
  Zap,         
  Activity,    
  Flame,       
  Layers,
  Hash,
  Check,
  ChevronDown,
  CircleDashed,
  PlayCircle
} from 'lucide-react';
import { useOccurrenceForm } from '../hooks/useOccurrenceForm';

// --- TIPO DO VIEWER ---
type ViewerState = {
  isOpen: boolean;
  url: string;
  type: 'image' | 'pdf' | 'video'; 
  name?: string;
} | null;

// --- CONFIGURAÇÕES VISUAIS (MOVIDAS PARA FORA DO COMPONENTE) ---
// Isso evita recriação a cada render e melhora performance
const priorityConfig: any = {
  'baixa':   { label: 'Baixa',   icon: Signal,   color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
  'média':   { label: 'Média',   icon: Zap,      color: 'text-amber-600',   bg: 'bg-amber-50 dark:bg-amber-900/20' },
  'alta':    { label: 'Alta',    icon: Activity, color: 'text-orange-600',  bg: 'bg-orange-50 dark:bg-orange-900/20' },
  'crítica': { label: 'Crítica', icon: Flame,    color: 'text-red-600',     bg: 'bg-red-50 dark:bg-red-900/20' }
};

const statusConfig: any = {
  'Aberta':       { icon: AlertCircle, color: 'text-slate-600', bg: 'bg-slate-100 dark:bg-slate-800' },
  'Em Andamento': { icon: PlayCircle,  color: 'text-blue-600',  bg: 'bg-blue-50 dark:bg-blue-900/20' },
  'Resolvida':    { icon: CheckCircle, color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-900/20' }
};

const categorias = ['Atendimento ao Cliente', 'Manobra Programada', 'Incidente de Rede', 'Falta de Energia', 'Segurança do Trabalho'];
const zonas = ['Urbana', 'Rural', 'Industrial', 'Expansão']; 

// --- COMPONENTE ITEM DE PREVIEW (MEMOIZADO) ---
// O React.memo impede re-renderização desnecessária da lista de arquivos ao digitar no form
const FilePreviewItem = React.memo(({ url, name, index, onRemove, onView }: { url: string, name: string, index: number, onRemove?: (i: number) => void, onView: (url: string, type: 'image'|'pdf'|'video', name: string) => void }) => {
  const [loadError, setLoadError] = useState(false);
  
  // Memoizando cálculos pesados de string
  const { isPdf, isVideo, showIcon } = useMemo(() => {
      const lowerUrl = url.toLowerCase();
      const lowerName = name.toLowerCase();
      const _isPdf = lowerUrl.includes('application/pdf') || lowerUrl.includes('.pdf') || lowerName.endsWith('.pdf');
      const _isVideo = lowerUrl.includes('video') || lowerName.match(/\.(mp4|webm|ogg|mov)$/);
      return { isPdf: _isPdf, isVideo: _isVideo, showIcon: _isPdf || loadError };
  }, [url, name, loadError]);

  const handleView = () => {
    let type: 'image' | 'pdf' | 'video' = 'image';
    if (isPdf) type = 'pdf';
    if (isVideo) type = 'video';
    onView(url, type, name);
  };

  return (
    <div className="group relative aspect-square rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-sm transition-all hover:shadow-lg hover:-translate-y-1 duration-300">
      <div 
        onClick={handleView}
        className="cursor-pointer w-full h-full relative"
        title={name}
      >
          {showIcon ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 p-4 text-center bg-slate-50 dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
               <FileText className="w-10 h-10 text-red-500/80" />
               <span className="text-[10px] font-bold tracking-tight text-slate-600 dark:text-slate-300 line-clamp-2 w-full break-words leading-tight">
                 {name}
               </span>
               <span className="text-[9px] bg-red-100 text-red-600 px-1.5 rounded dark:bg-red-900/30 dark:text-red-400 font-medium">PDF</span>
            </div>
          ) : isVideo ? (
            <>
                <video 
                  src={url} 
                  className="w-full h-full object-cover opacity-90 transition-transform duration-500 group-hover:scale-105"
                  muted
                  preload="metadata" // CRUCIAL: Carrega apenas metadados para não travar o scroll
                  playsInline
                />
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/10 group-hover:bg-black/20 transition-colors">
                    <div className="bg-black/40 rounded-full p-2 backdrop-blur-sm border border-white/20">
                        <Play className="w-6 h-6 text-white fill-white" />
                    </div>
                </div>
                <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/80 to-transparent p-2 pt-4 text-center">
                    <p className="text-[10px] text-white truncate px-1 flex items-center justify-center gap-1">
                        <Video className="w-3 h-3" /> {name}
                    </p>
                </div>
            </>
          ) : (
            <>
                <img 
                  src={url} 
                  alt={name} 
                  loading="lazy" // Performance: carrega imagem só quando visível
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  onError={() => setLoadError(true)} 
                />
                <div className="absolute bottom-0 inset-x-0 bg-black/60 p-1 text-center">
                    <p className="text-[10px] text-white truncate px-2">{name}</p>
                </div>
            </>
          )}

          <div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
             {!isVideo && <Eye className="w-8 h-8 text-white drop-shadow-lg" />}
          </div>
      </div>

      <button
        type="button"
        onClick={(e) => { 
            e.stopPropagation(); 
            if (onRemove) { onRemove(index); }
        }}
        className="absolute top-2 right-2 p-1.5 rounded-full bg-red-500 text-white opacity-0 group-hover:opacity-100 transition-all hover:bg-red-600 shadow-lg hover:shadow-red-500/40 transform scale-90 hover:scale-110 z-20"
        title="Remover anexo"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
});

export const OccurrenceForm = () => {
  const navigate = useNavigate();
  const [viewerState, setViewerState] = useState<ViewerState>(null);
  const [fileNames, setFileNames] = useState<string[]>([]);
  
  const [openDropdown, setOpenDropdown] = useState<'category' | 'priority' | 'status' | null>(null);

  const { 
    formData, previewUrls, isSubmitting, isCritical,
    isSupervisorCreator, targetOperators, targetDesks, isLoadingTargets,
    handleChange, handleLocationChange, handleFileAdd, handleRemoveFile, handleSubmit 
  } = useOccurrenceForm();

  useEffect(() => {
    const handleClickOutside = () => setOpenDropdown(null);
    window.addEventListener('click', handleClickOutside);
    return () => window.removeEventListener('click', handleClickOutside);
  }, []);

  const toggleDropdown = useCallback((e: React.MouseEvent, name: 'category' | 'priority' | 'status') => {
    e.stopPropagation();
    setOpenDropdown(prev => prev === name ? null : name);
  }, []);

  const onFileAdd = (files: FileList | null) => {
    if (!files) return;
    const newNames = Array.from(files).map(f => f.name);
    setFileNames(prev => [...prev, ...newNames]);
    handleFileAdd(files);
  };

  // useCallback para evitar recriação da função e re-render dos filhos
  const onFileRemove = useCallback((index: number) => {
    setFileNames(prev => prev.filter((_, i) => i !== index));
    if(handleRemoveFile) handleRemoveFile(index);
  }, [handleRemoveFile]);

  const onViewFile = useCallback((url: string, type: 'image'|'pdf'|'video', name: string) => {
    setViewerState({ isOpen: true, url, type, name });
  }, []);

  const [generatedId] = useState(() => {
    const now = new Date();
    const random = Math.floor(1000 + Math.random() * 9000);
    return `OC-${now.getFullYear()}${(now.getMonth() + 1).toString().padStart(2, '0')}-${random}`;
  });

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await handleSubmit(e); 
  };

  const inputClass = "w-full rounded-xl px-5 py-4 transition-all outline-none border focus:ring-2 focus:ring-emerald-500/50 bg-white border-slate-300 text-slate-900 placeholder:text-slate-400 dark:bg-slate-950/70 dark:border-slate-700 dark:text-white dark:placeholder:text-slate-500";
  const labelClass = "block text-sm font-semibold mb-2 text-slate-700 dark:text-slate-300";
  const locationLabelClass = "block text-xs font-semibold mb-2 uppercase text-slate-500 dark:text-slate-400";
  const locationInputClass = "w-full rounded-lg px-4 py-3 border outline-none focus:ring-2 focus:ring-blue-500/50 transition-colors bg-white border-slate-300 text-slate-900 dark:bg-slate-900 dark:border-slate-700 dark:text-white";

  return (
    <>
    <form onSubmit={onSubmit} className="space-y-7 animate-fade-in relative z-10 pb-10">
       
       {/* HEADER DO FORMULÁRIO */}
       <div className="flex items-center gap-5 mb-8 p-6 bg-white dark:bg-slate-900/50 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className={`
             p-4 rounded-2xl transition-all duration-500 border-2
             ${isCritical 
                ? 'bg-red-50 border-red-100 text-red-600 dark:bg-red-950/30 dark:border-red-900/50 dark:text-red-400 animate-pulse shadow-lg shadow-red-500/20' 
                : 'bg-emerald-50 border-emerald-100 text-emerald-600 dark:bg-emerald-950/30 dark:border-emerald-900/50 dark:text-emerald-400'
             }
          `}>
            {isCritical ? <AlertTriangle className="w-10 h-10" /> : <Plus className="w-10 h-10" />}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-3">
               <h2 className="text-3xl font-bold text-slate-900 dark:text-white uppercase tracking-tight">{generatedId}</h2>
               {isCritical && (
                 <div className="flex items-center gap-1.5 px-3 py-1 rounded-full border bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800">
                   <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400" />
                   <span className="font-bold text-xs text-red-700 dark:text-red-400 tracking-wide">CRÍTICA</span>
                 </div>
               )}
            </div>
            <p className="text-slate-500 dark:text-slate-400 text-lg font-medium mt-1 truncate">
               {formData.title || "Nova Ocorrência"}
            </p>
          </div>
       </div>

      <div className="group">
        <label className={labelClass}>Assunto / Resumo da Ocorrência *</label>
        <input type="text" required value={formData.title} onChange={e => handleChange('title', e.target.value)} className={inputClass} placeholder="Ex: Falha no religador R-1234" />
      </div>

      {/* --- GRID DE SELEÇÃO (CUSTOM DROPDOWNS) --- */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-20">
        
        {/* CATEGORIA */}
        <div>
          <label className={labelClass}>Categoria</label>
          <div className="relative">
            <button
              type="button"
              onClick={(e) => toggleDropdown(e, 'category')}
              className={`w-full flex items-center justify-between px-5 py-4 rounded-xl border bg-white dark:bg-slate-950/70 text-black dark:text-white transition-all duration-200 outline-none
                ${openDropdown === 'category' 
                  ? 'border-emerald-500 ring-2 ring-emerald-500/20 shadow-lg' 
                  : 'border-slate-300 dark:border-slate-700 hover:border-emerald-400'
                }`}
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg text-slate-500">
                  <Layers size={18} />
                </div>
                <span className={!formData.category ? 'text-slate-400' : 'font-medium'}>
                  {formData.category || 'Selecione a Categoria'}
                </span>
              </div>
              <ChevronDown size={18} className={`text-slate-400 transition-transform duration-300 ${openDropdown === 'category' ? 'rotate-180' : ''}`} />
            </button>

            {/* Dropdown Menu - Renderização Condicional Otimizada */}
            {openDropdown === 'category' && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-700 rounded-xl shadow-xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200 origin-top">
                <div className="max-h-60 overflow-y-auto p-1.5 scrollbar-thin">
                  {categorias.map(cat => (
                    <div
                      key={cat}
                      onClick={() => { handleChange('category', cat); setOpenDropdown(null); }}
                      className={`flex items-center gap-3 px-3 py-3 rounded-lg cursor-pointer transition-colors ${formData.category === cat ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400' : 'hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300'}`}
                    >
                      <Hash size={16} className="opacity-50" />
                      <span className="font-medium text-sm">{cat}</span>
                      {formData.category === cat && <Check size={16} className="ml-auto" />}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* PRIORIDADE */}
        <div>
          <label className={labelClass}>Prioridade</label>
          <div className="relative">
             <button
              type="button"
              onClick={(e) => toggleDropdown(e, 'priority')}
              className={`w-full flex items-center justify-between px-5 py-4 rounded-xl border bg-white dark:bg-slate-950/70 text-black dark:text-white transition-all duration-200 outline-none
                ${openDropdown === 'priority' ? 'ring-2 shadow-lg' : 'hover:border-slate-400'}
                ${formData.priority === 'crítica' 
                  ? 'border-red-500 ring-red-500/20 text-red-600 bg-red-50/10' 
                  : openDropdown === 'priority' ? 'border-emerald-500 ring-emerald-500/20' : 'border-slate-300 dark:border-slate-700'
                }`}
            >
              <div className="flex items-center gap-3">
                {formData.priority ? (
                  <>
                    <div className={`p-2 rounded-lg ${priorityConfig[formData.priority]?.bg} ${priorityConfig[formData.priority]?.color}`}>
                      {priorityConfig[formData.priority]?.icon && React.createElement(priorityConfig[formData.priority].icon, { size: 18 })}
                    </div>
                    <span className="font-bold capitalize">{formData.priority}</span>
                  </>
                ) : (
                  <span className="text-slate-400">Selecione...</span>
                )}
              </div>
              <ChevronDown size={18} className={`text-slate-400 transition-transform duration-300 ${openDropdown === 'priority' ? 'rotate-180' : ''}`} />
            </button>

             {/* Dropdown Menu */}
             {openDropdown === 'priority' && (
               <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-700 rounded-xl shadow-xl z-50 p-1.5 animate-in fade-in zoom-in-95 duration-200 origin-top">
                  {Object.keys(priorityConfig).map((key) => {
                     const conf = priorityConfig[key];
                     const Icon = conf.icon;
                     return (
                       <div
                         key={key}
                         onClick={() => { handleChange('priority', key); setOpenDropdown(null); }}
                         className={`flex items-center gap-3 px-3 py-3 rounded-lg cursor-pointer transition-colors mb-1 last:mb-0
                           ${formData.priority === key ? 'bg-slate-50 dark:bg-slate-800 ring-1 ring-slate-200 dark:ring-slate-700' : 'hover:bg-slate-50 dark:hover:bg-slate-800'}
                         `}
                       >
                          <div className={`p-2 rounded-md ${conf.bg} ${conf.color}`}>
                             <Icon size={16} />
                          </div>
                          <span className={`font-bold capitalize text-sm ${formData.priority === key ? 'text-slate-900 dark:text-white' : 'text-slate-600 dark:text-slate-400'}`}>
                            {key}
                          </span>
                          {formData.priority === key && <Check size={16} className="ml-auto text-slate-400" />}
                       </div>
                     )
                  })}
               </div>
             )}
          </div>
        </div>

        {/* STATUS */}
        <div>
           <label className={labelClass}>Status Inicial</label>
           <div className="relative">
              <button
                type="button"
                onClick={(e) => toggleDropdown(e, 'status')}
                className={`w-full flex items-center justify-between px-5 py-4 rounded-xl border bg-white dark:bg-slate-950/70 text-black dark:text-white transition-all duration-200 outline-none
                  ${openDropdown === 'status' 
                    ? 'border-emerald-500 ring-2 ring-emerald-500/20 shadow-lg' 
                    : 'border-slate-300 dark:border-slate-700 hover:border-emerald-400'
                  }`}
              >
                <div className="flex items-center gap-3">
                  {formData.status && statusConfig[formData.status] ? (
                     <div className={`p-2 rounded-lg ${statusConfig[formData.status].bg} ${statusConfig[formData.status].color}`}>
                        {React.createElement(statusConfig[formData.status].icon, { size: 18 })}
                     </div>
                  ) : (
                     <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg text-slate-500">
                        <CircleDashed size={18} />
                     </div>
                  )}
                  <span className="font-medium">{formData.status}</span>
                </div>
                <ChevronDown size={18} className={`text-slate-400 transition-transform duration-300 ${openDropdown === 'status' ? 'rotate-180' : ''}`} />
              </button>

              {/* Dropdown Menu */}
              {openDropdown === 'status' && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-700 rounded-xl shadow-xl z-50 p-1.5 animate-in fade-in zoom-in-95 duration-200 origin-top">
                   {Object.keys(statusConfig).map((key) => {
                      const conf = statusConfig[key];
                      const Icon = conf.icon;
                      return (
                        <div
                          key={key}
                          onClick={() => { handleChange('status', key); setOpenDropdown(null); }}
                          className={`flex items-center gap-3 px-3 py-3 rounded-lg cursor-pointer transition-colors
                            ${formData.status === key ? 'bg-slate-50 dark:bg-slate-800' : 'hover:bg-slate-50 dark:hover:bg-slate-800'}
                          `}
                        >
                           <div className={`p-2 rounded-md ${conf.bg} ${conf.color}`}>
                              <Icon size={16} />
                           </div>
                           <span className="font-medium text-sm text-slate-700 dark:text-slate-200">{key}</span>
                           {formData.status === key && <Check size={16} className="ml-auto text-emerald-500" />}
                        </div>
                      )
                   })}
                </div>
              )}
           </div>
        </div>

      </div>

      {isSupervisorCreator && (
        <div className="p-6 rounded-2xl border bg-blue-50/60 border-blue-100 dark:bg-blue-950/20 dark:border-blue-900/40 space-y-4">
          <div className="flex items-center gap-2 text-blue-700 dark:text-blue-300 font-semibold text-sm">
            <MapPin className="w-4 h-4" />
            Direcionamento da Ocorrência (Supervisor)
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Encaminhar para</label>
              <select
                value={formData.assignmentMode}
                onChange={(e) => handleChange('assignmentMode', e.target.value)}
                className={inputClass}
              >
                <option value="operator">Operador</option>
                <option value="desk">Mesa</option>
              </select>
            </div>

            {formData.assignmentMode === 'operator' ? (
              <div>
                <label className={labelClass}>Operador de destino</label>
                <select
                  value={formData.targetOperatorId}
                  onChange={(e) => handleChange('targetOperatorId', e.target.value)}
                  className={inputClass}
                  disabled={isLoadingTargets || targetOperators.length === 0}
                >
                  {targetOperators.length === 0 && <option value="">Nenhum operador disponível</option>}
                  {targetOperators.map((operator) => (
                    <option key={operator.id} value={operator.id}>
                      {operator.name}{operator.deskName ? ` - ${operator.deskName}` : ''}
                    </option>
                  ))}
                </select>
              </div>
            ) : (
              <div>
                <label className={labelClass}>Mesa de destino</label>
                <select
                  value={formData.targetDeskId}
                  onChange={(e) => handleChange('targetDeskId', e.target.value)}
                  className={inputClass}
                  disabled={isLoadingTargets || targetDesks.length === 0}
                >
                  {targetDesks.length === 0 && <option value="">Nenhuma mesa disponível</option>}
                  {targetDesks.map((desk) => (
                    <option key={desk.id} value={desk.id}>
                      {desk.name} - {desk.code}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          <p className="text-xs text-blue-700/80 dark:text-blue-300/80">
            A ocorrência será entregue para o turno em andamento do destino selecionado.
          </p>
        </div>
      )}

      {/* BLOCO LOCALIZACAO */}
      <div className="p-8 rounded-2xl border bg-slate-50 border-slate-200 dark:bg-slate-900/30 dark:border-slate-800/50 space-y-6 shadow-inner">
         <div className="flex items-center gap-3 mb-4 text-slate-600 dark:text-slate-300 border-b border-slate-200 dark:border-slate-800 pb-4">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg">
               <MapPin className="w-5 h-5" />
            </div>
            <div>
               <h3 className="text-sm font-bold uppercase tracking-wider">Dados de Localização</h3>
               <p className="text-xs text-slate-500 dark:text-slate-500">Informe onde a ocorrência aconteceu</p>
            </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div><label className={locationLabelClass}>Alimentador</label><input type="text" value={formData.location.alimentador} onChange={e => handleLocationChange('alimentador', e.target.value)} className={locationInputClass} placeholder="Ex: AL-04" /></div>
            <div><label className={locationLabelClass}>Subestação</label><input type="text" value={formData.location.subestacao} onChange={e => handleLocationChange('subestacao', e.target.value)} className={locationInputClass} placeholder="Ex: SE-CENTRO" /></div>
            <div><label className={locationLabelClass}>Nº OS</label><input type="text" value={formData.osNumero} onChange={e => handleChange('osNumero', e.target.value)} className={locationInputClass} placeholder="000000" /></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div><label className={locationLabelClass}>Cidade</label><input type="text" value={formData.location.city || ''} onChange={e => handleLocationChange('city', e.target.value)} className={locationInputClass} placeholder="Nome da Cidade" /></div>
            <div><label className={locationLabelClass}>Bairro</label><input type="text" value={formData.location.neighborhood || ''} onChange={e => handleLocationChange('neighborhood', e.target.value)} className={locationInputClass} placeholder="Nome do Bairro" /></div>
            <div><label className={locationLabelClass}>Zona</label><select value={formData.location.zone || ''} onChange={e => handleLocationChange('zone', e.target.value)} className={locationInputClass}><option value="">Selecione...</option>{zonas.map(z => <option key={z} value={z}>{z}</option>)}</select></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             <div><label className={locationLabelClass}>Endereço / Logradouro</label><input type="text" value={formData.location.address || ''} onChange={e => handleLocationChange('address', e.target.value)} className={locationInputClass} placeholder="Rua, Número, Complemento" /></div>
            <div><label className={locationLabelClass}>Ponto de Referência</label><input type="text" value={formData.location.reference || ''} onChange={e => handleLocationChange('reference', e.target.value)} className={locationInputClass} placeholder="Ex: Próximo ao mercado..." /></div>
        </div>
      </div>

      <div>
        <label className={labelClass}>Descrição Detalhada</label>
        <textarea required rows={6} value={formData.description} onChange={e => handleChange('description', e.target.value)} className={`${inputClass} resize-none`} placeholder="Descreva em detalhes o que aconteceu, as causas prováveis e observações importantes..." />
      </div>

      {/* ÁREA DE ANEXOS */}
      <div className="space-y-4">
         <div className="flex items-center justify-between">
            <label className={labelClass}>Anexos e Evidências</label>
            <span className="text-xs text-slate-500 font-medium bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-md">{previewUrls.length} {previewUrls.length === 1 ? 'arquivo' : 'arquivos'}</span>
         </div>
         
         <div className="p-8 rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/30 transition-all hover:bg-slate-100 dark:hover:bg-slate-900 hover:border-emerald-400 dark:hover:border-emerald-700/50 group">
            <div className="flex flex-col items-center justify-center gap-4">
                <div className="p-4 bg-white dark:bg-slate-800 rounded-full shadow-sm group-hover:scale-110 transition-transform duration-300">
                    <FileText className="w-8 h-8 text-emerald-500"/>
                </div>
                <div className="text-center">
                    <label className="cursor-pointer inline-flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-sm transition-all shadow-lg bg-emerald-600 text-white hover:bg-emerald-500 shadow-emerald-500/20 hover:shadow-emerald-500/40">
                       Selecionar Arquivos
                       <input type="file" multiple accept="image/*,.pdf,.doc,.docx,video/*" onChange={e => onFileAdd(e.target.files)} className="hidden" />
                    </label>
                    <p className="text-xs text-slate-400 mt-3 font-medium">Suporta: IMG, PDF, VIDEO (Max 10MB)</p>
                </div>
            </div>

            {previewUrls.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 mt-8 animate-fade-in">
                    {previewUrls.map((url, index) => (
                        <FilePreviewItem 
                            key={`${index}-${url.substring(0, 10)}`}
                            url={url}
                            index={index}
                            name={fileNames[index] || `Arquivo ${index + 1}`} 
                            onRemove={onFileRemove}
                            onView={onViewFile}
                        />
                    ))}
                </div>
            )}
         </div>
      </div>

      {/* BOTÕES DE AÇÃO - PREMIUM UI */}
      <div className="flex flex-col md:flex-row gap-4 pt-8 border-t border-slate-200 dark:border-slate-800">
        <button 
            type="button" 
            onClick={() => navigate(-1)} 
            disabled={isSubmitting} 
            className="flex-1 py-4 font-bold rounded-xl transition-all bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-800 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 dark:hover:text-white"
        >
            Cancelar
        </button>
        
        <button 
            type="submit" 
            disabled={isSubmitting} 
            className={`
                flex-[2] py-4 font-bold rounded-xl text-white flex items-center justify-center gap-3 transition-all shadow-xl hover:-translate-y-0.5
                ${isCritical 
                    ? 'bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-500 hover:to-orange-500 shadow-red-500/25 hover:shadow-red-500/40' 
                    : 'bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 shadow-emerald-500/25 hover:shadow-emerald-500/40'
                }
            `}
        >
          {isSubmitting ? <Loader2 className="w-6 h-6 animate-spin" /> : isCritical ? <AlertTriangle className="w-6 h-6" /> : <CheckCircle className="w-6 h-6" />}
          {isSubmitting ? 'Salvando...' : 'Registrar Ocorrência'}
        </button>
      </div>
    </form>

    {/* MODAL DE PREVIEW */}
    {viewerState && (
        <div className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-sm flex items-center justify-center animate-fade-in" onClick={() => setViewerState(null)}>
            <div className="absolute top-0 left-0 right-0 p-4 bg-gradient-to-b from-black/60 to-transparent flex justify-between items-center z-50">
                <span className="text-white font-medium text-sm truncate max-w-[70%] pl-4 drop-shadow-md">{viewerState.name}</span>
                <div className="flex items-center gap-4">
                      <a href={viewerState.url} download={viewerState.name} target="_blank" rel="noreferrer" onClick={(e) => e.stopPropagation()} className="p-2 bg-white/10 hover:bg-emerald-600 rounded-full text-white transition-colors" title="Baixar">
                          <Download className="w-6 h-6" />
                      </a>
                    <button onClick={() => setViewerState(null)} className="p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors"><X className="w-6 h-6" /></button>
                </div>
            </div>

            <div className="w-full h-full p-4 md:p-10 flex items-center justify-center pt-16" onClick={(e) => e.stopPropagation()}>
                {viewerState.type === 'image' && (
                    <img src={viewerState.url} alt="Preview" className="max-w-full max-h-full object-contain rounded-lg shadow-2xl" />
                )}
                {viewerState.type === 'pdf' && (
                    <iframe src={viewerState.url} title="PDF Preview" className="w-full h-[85vh] md:w-[80vw] bg-white rounded-lg shadow-2xl border-none" />
                )}
                {viewerState.type === 'video' && (
                    <video 
                      src={viewerState.url} 
                      controls 
                      autoPlay 
                      className="max-w-full max-h-[85vh] rounded-lg shadow-2xl outline-none" 
                    />
                )}
            </div>
        </div>
    )}
    </>
  );
};