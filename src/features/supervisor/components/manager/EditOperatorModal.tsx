import { useState, useEffect } from "react";
import { X, User, Mail, Briefcase  } from "lucide-react";
import type { Operator, OperatorProfile } from "../../types";
import { OPERATOR_PROFILES, PROFILE_COLORS } from "../../constants";
import { createPortal } from "react-dom";
import { showConfirmModal, showWarningModal } from "@/shared/ui/feedbackModal";
interface EditOperatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (operatorAtualizado: Operator) => void;
  onDeactivate: (operatorAtualizado: Operator) => void;
  onReactivate: (operatorAtualizado: Operator) => void;
  operator: Operator;
  tables: string[];
}

export function EditOperatorModal({
  isOpen,
  onClose,
  onSave,
  onDeactivate,
  onReactivate,
  operator,
  tables,
}: EditOperatorModalProps) {
  const [name, setName] = useState(operator.name);
  const [email, setEmail] = useState(operator.email);
  const [profile, setProfile] = useState<OperatorProfile>(operator.profile);
  const [table, setTable] = useState(operator.table);

  const availableTables = tables.length > 0 ? tables : ["Sem mesa"];

  // Atualizar estado quando o operator mudar
  useEffect(() => {
    setName(operator.name);
    setEmail(operator.email);
    setProfile(operator.profile);
    setTable(operator.table);
  }, [operator]);

  if (!isOpen) return null;

  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim() || !email.trim()) {
      void showWarningModal("Por favor, preencha todos os campos obrigatórios.");
      return;
    }

    onSave({
      ...operator,
      name: name.trim(),
      email: email.trim(),
      profile,
      table,
    });
  };

  const handleCancel = () => {
    setName(operator.name);
    setEmail(operator.email);
    setProfile(operator.profile);
    setTable(operator.table);
    onClose();
  };

  const handleDeactivate = async () => {
    const confirmed = await showConfirmModal(
      "Deseja desativar este operador?",
      "Desativar operador",
      "Desativar",
      "Cancelar"
    );
    if (!confirmed) {
      return;
    }

    onDeactivate({
      ...operator,
      name: name.trim(),
      email: email.trim(),
      profile,
      table,
      accountActive: false,
    });
  };

  const handleReactivate = async () => {
    const confirmed = await showConfirmModal(
      "Deseja reativar este operador?",
      "Reativar operador",
      "Reativar",
      "Cancelar"
    );
    if (!confirmed) {
      return;
    }

    onReactivate({
      ...operator,
      name: name.trim(),
      email: email.trim(),
      profile,
      table,
      accountActive: true,
    });
  };
  return createPortal(
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[9999] p-4">
      <div className="eq-modal-solid relative flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-400 via-teal-500 to-emerald-600" />
        {/* HEADER */}
        <div className="eq-modal-header flex items-center justify-between p-6">
          <div className="flex items-center gap-3">
            <div className="eq-soft-icon flex h-10 w-10 items-center justify-center rounded-lg">
              <User className="w-5 h-5 text-theme-accent" />
            </div>

            <div>
              <h2 className="text-xl font-bold text-[var(--eq-text-primary)]">
                Edit Operator
              </h2>
              <p className="eq-page-subtitle text-sm">
                Atualize os dados do operator
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

        {/* CONTEÚDO */}
        <div className="eq-modal-body flex-1 overflow-y-auto p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* NAME */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-medium text-[var(--eq-text-primary)]">
                <User className="w-4 h-4 text-theme-accent" />
                Nome Completo *
              </label>

              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: João da Silva"
                className="eq-control w-full px-4 py-3 placeholder:text-[var(--eq-text-muted)] focus:ring-2 focus:ring-emerald-500/40"
                required
              />
            </div>

            {/* EMAIL */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-medium text-[var(--eq-text-primary)]">
                <Mail className="w-4 h-4 text-theme-accent" />
                Email Corporativo *
              </label>

              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Ex: joao.silva@coi.com.br"
                className="eq-control w-full px-4 py-3 placeholder:text-[var(--eq-text-muted)] focus:ring-2 focus:ring-emerald-500/40"
                required
              />
            </div>

            {/* PROFILE */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-medium text-[var(--eq-text-primary)]">
                <Briefcase className="w-4 h-4 text-theme-accent" />
                Profile Operacional
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
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-[var(--eq-text-primary)]">
                Mesa
              </label>
              <select
                value={table}
                onChange={(event) => setTable(event.target.value)}
                className="eq-control w-full px-4 py-3 focus:ring-2 focus:ring-emerald-500/40"
              >
                {availableTables.map((item) => (
                  <option key={item} value={item} className="bg-[var(--eq-bg-surface)] text-[var(--eq-text-primary)]">
                    {item}
                  </option>
                ))}
              </select>
            </div>

            {/* ACTIONS */}
            <div className="flex items-center gap-3 border-t border-[var(--eq-border)] pt-4">
              {operator.accountActive === false ? (
                <button
                  type="button"
                  onClick={handleReactivate}
                  className="px-4 py-3 bg-emerald-500 hover:bg-emerald-600 rounded-lg text-white font-medium shadow-lg shadow-emerald-500/20"
                >
                  Reativar operador
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleDeactivate}
                  className="px-4 py-3 bg-red-500 hover:bg-red-600 rounded-lg text-white font-medium shadow-lg shadow-red-500/20"
                >
                  Desativar operador
                </button>
              )}

              <button
                type="button"
                onClick={handleCancel}
                className="flex-1 px-4 py-3 eq-control rounded-lg font-medium hover:bg-[var(--eq-bg-surface-soft)]"
              >
                Cancelar
              </button>

              <button
                type="submit"
                className="eq-primary-action flex-1 px-4 py-3"
              >
                Salvar Alterações
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>,
    document.body,
  );
}
