import { useState } from "react";
import { X, MapPin, FileText } from "lucide-react";
import { createPortal } from "react-dom";
import { showWarningModal } from "@/shared/ui/feedbackModal";

interface AddTableModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (mesa: { name: string; description: string }) => void;
}

export function AddTableModal({
  isOpen,
  onClose,
  onSave,
}: AddTableModalProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      void showWarningModal("Por favor, preencha o name da mesa.");
      return;
    }

    onSave({
      name: name.trim(),
      description: description.trim(),
    });

    // Reset form
    setName("");
    setDescription("");
  };

  const handleCancel = () => {
    setName("");
    setDescription("");
    onClose();
  };

  return createPortal (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[9999] p-4">
      <div className="eq-modal-solid relative flex w-full max-w-lg flex-col overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-400 via-teal-500 to-emerald-600" />
        {/* Header */}
        <div className="eq-modal-header p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="eq-soft-icon flex h-10 w-10 items-center justify-center rounded-lg">
                <MapPin className="w-5 h-5 text-theme-accent" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-[var(--eq-text-primary)]">
                  Cadastrar mesa
                </h2>
                <p className="eq-page-subtitle text-sm">
                  Cadastre uma nova mesa de trabalho
                </p>
              </div>
            </div>
            <button
              onClick={handleCancel}
              className="eq-control flex h-8 w-8 items-center justify-center rounded-lg p-0 transition-colors hover:bg-[var(--eq-bg-surface-soft)]"
            >
              <X className="h-5 w-5 text-[var(--eq-text-secondary)]" />
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="eq-modal-body space-y-6 p-6">
          {/* Name */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-medium text-[var(--eq-text-primary)]">
              <MapPin className="w-4 h-4 text-theme-accent" />
              Nome da Mesa *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: MCZ III"
              className="eq-control w-full px-4 py-3 placeholder:text-[var(--eq-text-muted)] focus:ring-2 focus:ring-emerald-500/40"
              required
            />
          </div>

          {/* Descrição */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-medium text-[var(--eq-text-primary)]">
              <FileText className="w-4 h-4 text-theme-accent" />
              Descrição (opcional)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Ex: Mesa de controle zona central"
              rows={3}
              className="eq-control w-full resize-none px-4 py-3 placeholder:text-[var(--eq-text-muted)] focus:ring-2 focus:ring-emerald-500/40"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3 border-t border-[var(--eq-border)] pt-4">
            <button
              type="button"
              onClick={handleCancel}
              className="flex-1 px-4 py-3 eq-control rounded-lg font-medium transition-all hover:bg-[var(--eq-bg-surface-soft)]"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="eq-primary-action flex-1 px-4 py-3"
            >
              Cadastrar Mesa
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body,
  );
}
