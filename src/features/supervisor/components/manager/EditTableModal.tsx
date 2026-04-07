import { useState, useEffect } from "react";
import { X, MapPin, FileText } from "lucide-react";
import { createPortal } from "react-dom";
import { showWarningModal } from "@/shared/ui/feedbackModal";

export interface Table {
  name: string;
  description: string;
}

interface EditTableModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (mesaAtualizada: Table, nameOriginal: string) => void;
  table: Table;
}

export function EditTableModal({
  isOpen,
  onClose,
  onSave,
  table,
}: EditTableModalProps) {
  const [name, setname] = useState(table.name);
  const [description, setdescription] = useState(table.description);
  const nameOriginal = table.name;

  // Atualizar estado quando a table mudar
  useEffect(() => {
    setname(table.name);
    setdescription(table.description);
  }, [table]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      void showWarningModal("Por favor, preencha o name da mesa.");
      return;
    }

    onSave(
      {
        name: name.trim(),
        description: description.trim(),
      },
      nameOriginal
    );
  };

  const handleCancel = () => {
    setname(table.name);
    setdescription(table.description);
    onClose();
  };

  return createPortal(
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[9999] p-4">
       <div className="bg-white dark:bg-[#1e293b] border border-zinc-200 dark:border-[#334155] rounded-lg w-full max-w-lg overflow-hidden flex flex-col shadow-xl">
        {/* Header */}
        <div className="p-6 border-b border-zinc-200 dark:border-[#334155]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-500/10 dark:bg-blue-500/20 flex items-center justify-center">
                <MapPin className="w-5 h-5 text-blue-500" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-zinc-900 dark:text-white">
                  Editar Mesa
                </h2>
                <p className="text-sm text-zinc-600 dark:text-[#94a3b8]">
                  Atualize os dados da mesa de trabalho
                </p>
              </div>
            </div>
            <button
              onClick={handleCancel}
              className="w-8 h-8 rounded-lg bg-zinc-100 dark:bg-[#0f172a] hover:bg-zinc-200 dark:hover:bg-[#0f172a]/80 flex items-center justify-center transition-colors"
            >
              <X className="w-5 h-5 text-zinc-600 dark:text-[#94a3b8]" />
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* name */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-900 dark:text-white flex items-center gap-2">
              <MapPin className="w-4 h-4 text-blue-500" />
              Nome da Mesa *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setname(e.target.value)}
              placeholder="Ex: MCZ III"
              className="w-full px-4 py-3 bg-white dark:bg-[#0f172a] border border-zinc-200 dark:border-[#334155] rounded-lg text-zinc-900 dark:text-white placeholder:text-zinc-400 dark:placeholder:text-[#64748b] focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all"
              required
            />
          </div>

          {/* Descrição */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-900 dark:text-white flex items-center gap-2">
              <FileText className="w-4 h-4 text-blue-500" />
              Descrição (opcional)
            </label>
            <textarea
              value={description}
              onChange={(e) => setdescription(e.target.value)}
              placeholder="Ex: Mesa de controle zona central"
              rows={3}
              className="w-full px-4 py-3 bg-white dark:bg-[#0f172a] border border-zinc-200 dark:border-[#334155] rounded-lg text-zinc-900 dark:text-white placeholder:text-zinc-400 dark:placeholder:text-[#64748b] focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all resize-none"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3 pt-4 border-t border-zinc-200 dark:border-[#334155]">
            <button
              type="button"
              onClick={handleCancel}
              className="flex-1 px-4 py-3 bg-white dark:bg-[#0f172a] hover:bg-zinc-50 dark:hover:bg-[#0f172a]/80 border border-zinc-200 dark:border-[#334155] rounded-lg text-zinc-900 dark:text-white font-medium transition-all"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-3 bg-blue-500 hover:bg-blue-600 rounded-lg text-white font-medium transition-all shadow-lg shadow-blue-500/20"
            >
              Salvar Alterações
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}
