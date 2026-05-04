import { FileText, Image, Play, Video, X } from 'lucide-react';
import type { CircuitAttachment } from '../types';

interface FileAttachmentFieldProps {
  attachments: CircuitAttachment[];
  onAdd: (files: FileList | null) => void;
  onRemove: (id: string) => void;
}

const getIcon = (type: CircuitAttachment['type']) => {
  if (type === 'image') return Image;
  if (type === 'video') return Video;
  return FileText;
};

export const FileAttachmentField = ({ attachments, onAdd, onRemove }: FileAttachmentFieldProps) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
          Arquivos e documentos
        </label>
        <span className="shrink-0 text-xs text-slate-500 font-medium bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-md">
          {attachments.length} {attachments.length === 1 ? 'arquivo' : 'arquivos'}
        </span>
      </div>

      <div className="p-8 rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/30 transition-all hover:bg-slate-100 dark:hover:bg-slate-900 hover:border-emerald-400 dark:hover:border-emerald-700/50">
        <div className="flex flex-col items-center justify-center gap-4">
          <div className="p-4 bg-white dark:bg-slate-800 rounded-full shadow-sm">
            <FileText className="w-8 h-8 text-emerald-500" />
          </div>
          <div className="text-center">
            <label className="cursor-pointer inline-flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-sm transition-all shadow-lg bg-emerald-600 text-white hover:bg-emerald-500 shadow-emerald-500/20 hover:shadow-emerald-500/40">
              Selecionar arquivos
              <input
                type="file"
                multiple
                accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,video/*"
                onChange={(event) => onAdd(event.target.files)}
                className="hidden"
              />
            </label>
            <p className="text-xs text-slate-400 mt-3 font-medium">
              Suporta imagens, PDF, documentos e vídeos
            </p>
          </div>
        </div>

        {attachments.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-8 animate-fade-in">
            {attachments.map((attachment) => {
              const Icon = getIcon(attachment.type);

              return (
                <div
                  key={attachment.id}
                  className="group relative rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-sm overflow-hidden"
                >
                  <a
                    href={attachment.url}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-3 min-w-0 p-4 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
                    title={attachment.name}
                  >
                    <div className="shrink-0 w-12 h-12 rounded-lg bg-slate-100 dark:bg-slate-900 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                      {attachment.type === 'video' ? <Play className="w-5 h-5" /> : <Icon className="w-5 h-5" />}
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-sm text-slate-800 dark:text-slate-100 truncate">
                        {attachment.name}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 uppercase">
                        {attachment.type}
                      </p>
                    </div>
                  </a>

                  <button
                    type="button"
                    onClick={() => onRemove(attachment.id)}
                    className="absolute top-2 right-2 p-1.5 rounded-full bg-red-500 text-white opacity-0 group-hover:opacity-100 transition-all hover:bg-red-600 shadow-lg"
                    title="Remover arquivo"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
