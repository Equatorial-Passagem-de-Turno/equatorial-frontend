import { useState } from "react";
import { X, User, Mail} from "lucide-react";
import type { OperatorProfile } from "../../types/index";
import { showWarningModal } from "@/shared/ui/feedbackModal";
import { createPortal } from "react-dom";

interface RegisterOperatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  tables: string[];
  onSave: (operator: {
    name: string;
    email: string;
    profile: OperatorProfile;
    table: string;
  }) => void;
}

export function RegisterOperatorModal({
  isOpen,
  onClose,
  tables,
  onSave,
}: RegisterOperatorModalProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [profile, setProfile] = useState<OperatorProfile>("AT");
  const [table, setDesk] = useState(tables[0] || "");

  const availableTables = tables.length > 0 ? tables : ["Sem mesa"];

  if (!isOpen) return null;

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();

    if (!name.trim() || !email.trim()) {
      void showWarningModal("Por favor, preencha todos os campos obrigatórios.");
      return;
    }

    onSave({
      name: name.trim(),
      email: email.trim(),
      profile,
      table,
    });

    resetForm();
  };

  const resetForm = () => {
    setName("");
    setEmail("");
    setProfile("AT");
    setDesk(availableTables[0] || "");
  };

  const handleCancel = () => {
    resetForm();
    onClose();
  };

  return createPortal(
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[9999] p-4">
      <div className="eq-modal-solid relative flex w-full max-w-2xl flex-col overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-400 via-teal-500 to-emerald-600" />
        
        {/* Header */}
        <div className="eq-modal-header p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="eq-soft-icon flex h-10 w-10 items-center justify-center rounded-lg">
                <User className="w-5 h-5 text-theme-accent" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-[var(--eq-text-primary)]">
                  Cadastrar Operador
                </h2>
                <p className="eq-page-subtitle text-sm">
                  Adicione um novo operador ao sistema
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

          {/* Nome */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-medium text-[var(--eq-text-primary)]">
              <User className="w-4 h-4 text-theme-accent" />
              Nome Completo *
            </label>
            <input
              type="text"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Ex: João da Silva"
              className="eq-control w-full px-4 py-3 placeholder:text-[var(--eq-text-muted)] focus:ring-2 focus:ring-emerald-500/40"
              required
            />
          </div>

          {/* Email */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-medium text-[var(--eq-text-primary)]">
              <Mail className="w-4 h-4 text-theme-accent" />
              Email Corporativo *
            </label>
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="Ex: joao.silva@coi.com.br"
              className="eq-control w-full px-4 py-3 placeholder:text-[var(--eq-text-muted)] focus:ring-2 focus:ring-emerald-500/40"
              required
            />
          </div>

          {/* Perfil */}
          {/* <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-medium text-[var(--eq-text-primary)]">
              <Briefcase className="w-4 h-4 text-theme-accent" />
              Perfil Operacional
            </label>

            <div className="grid grid-cols-2 gap-3">
              {OPERATOR_PROFILES.map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setProfile(p)}
                  className={`px-4 py-3 rounded-lg border text-sm font-medium transition-all ${
                    profile === p
                      ? PROFILE_COLORS[p] + " border-2"
                      : "eq-control text-[var(--eq-text-secondary)] hover:bg-[var(--eq-bg-surface-soft)]"
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div> */}

          {/* Mesa */}
          <div className="space-y-2">
              <label className="text-sm font-medium text-[var(--eq-text-primary)]">
                Mesa
              </label>
              <select
                value={table}
                onChange={(event) => setDesk(event.target.value)}
                className="eq-control w-full px-4 py-3 focus:ring-2 focus:ring-emerald-500/40"
              >
                {availableTables.map((m) => (
                  <option key={m} value={m} className="bg-[var(--eq-bg-surface)] text-[var(--eq-text-primary)]">
                    {m}
                  </option>
                ))}
              </select>
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
              Cadastrar Operador
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body,
  );
}
