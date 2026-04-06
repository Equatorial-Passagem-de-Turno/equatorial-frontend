import { useState, useEffect } from "react";
import { X, User, Mail, Briefcase  } from "lucide-react";
import type { Operator, OperatorProfile } from "../../types";
import { OPERATOR_PROFILES, PROFILE_COLORS } from "../../constants";
import { createPortal } from "react-dom";
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
      alert("Por favor, preencha todos os campos obrigatórios.");
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

  const handleDeactivate = () => {
    const confirmed = window.confirm("Deseja desativar este operador?");
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

  const handleReactivate = () => {
    const confirmed = window.confirm("Deseja reativar este operador?");
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
      <div className="bg-white dark:bg-[#1e293b] border border-zinc-200 dark:border-[#334155] rounded-xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
        {/* HEADER */}
        <div className="p-6 border-b border-zinc-200 dark:border-[#334155] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-500/10 dark:bg-blue-500/20 flex items-center justify-center">
              <User className="w-5 h-5 text-blue-500" />
            </div>

            <div>
              <h2 className="text-xl font-bold text-zinc-900 dark:text-white">
                Edit Operator
              </h2>
              <p className="text-sm text-zinc-600 dark:text-[#94a3b8]">
                Atualize os dados do operator
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

        {/* CONTEÚDO */}
        <div className="flex-1 overflow-y-auto p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* NAME */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-900 dark:text-white flex items-center gap-2">
                <User className="w-4 h-4 text-blue-500" />
                Nome Completo *
              </label>

              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: João da Silva"
                className="w-full px-4 py-3 bg-white dark:bg-[#0f172a] border border-zinc-200 dark:border-[#334155] rounded-lg text-zinc-900 dark:text-white placeholder:text-zinc-400 dark:placeholder:text-[#64748b] focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500"
                required
              />
            </div>

            {/* EMAIL */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-900 dark:text-white flex items-center gap-2">
                <Mail className="w-4 h-4 text-blue-500" />
                Email Corporativo *
              </label>

              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Ex: joao.silva@coi.com.br"
                className="w-full px-4 py-3 bg-white dark:bg-[#0f172a] border border-zinc-200 dark:border-[#334155] rounded-lg text-zinc-900 dark:text-white placeholder:text-zinc-400 dark:placeholder:text-[#64748b] focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500"
                required
              />
            </div>

            {/* PROFILE */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-900 dark:text-white flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-blue-500" />
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
                        : "bg-white dark:bg-[#0f172a] border-zinc-200 dark:border-[#334155] text-zinc-600 dark:text-[#94a3b8] hover:bg-zinc-50 dark:hover:bg-[#1e293b]/50"
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-900 dark:text-white">
                Mesa
              </label>
              <select
                value={table}
                onChange={(event) => setTable(event.target.value)}
                className="w-full px-4 py-3 bg-white dark:bg-[#0f172a] border border-zinc-200 dark:border-[#334155] rounded-lg text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500"
              >
                {availableTables.map((item) => (
                  <option key={item} value={item} className="bg-white dark:bg-[#0f172a]">
                    {item}
                  </option>
                ))}
              </select>
            </div>

            {/* ACTIONS */}
            <div className="flex items-center gap-3 pt-4 border-t border-zinc-200 dark:border-[#334155]">
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
                className="flex-1 px-4 py-3 bg-white dark:bg-[#0f172a] hover:bg-zinc-50 dark:hover:bg-[#0f172a]/80 border border-zinc-200 dark:border-[#334155] rounded-lg text-zinc-900 dark:text-white font-medium"
              >
                Cancelar
              </button>

              <button
                type="submit"
                className="flex-1 px-4 py-3 bg-blue-500 hover:bg-blue-600 rounded-lg text-white font-medium shadow-lg shadow-blue-500/20"
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
