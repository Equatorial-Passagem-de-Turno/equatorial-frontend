import { useState } from "react";
import { X, User, Mail} from "lucide-react";
import type { OperatorProfile } from "../../types/index";

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
      alert("Por favor, preencha todos os campos obrigatórios.");
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

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
      <div className="bg-white dark:bg-[#1e293b] border border-zinc-200 dark:border-[#334155] rounded-lg w-full max-w-2xl overflow-hidden flex flex-col shadow-xl">
        
        {/* Header */}
        <div className="p-6 border-b border-zinc-200 dark:border-[#334155]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-[#10b981]/10 dark:bg-[#10b981]/20 flex items-center justify-center">
                <User className="w-5 h-5 text-[#10b981]" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-zinc-900 dark:text-white">
                  Cadastrar Operador
                </h2>
                <p className="text-sm text-zinc-600 dark:text-[#94a3b8]">
                  Adicione um novo operador ao sistema
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

          {/* Nome */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-900 dark:text-white flex items-center gap-2">
              <User className="w-4 h-4 text-[#10b981]" />
              Nome Completo *
            </label>
            <input
              type="text"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Ex: João da Silva"
              className="w-full px-4 py-3 bg-white dark:bg-[#0f172a] border border-zinc-200 dark:border-[#334155] rounded-lg text-zinc-900 dark:text-white placeholder:text-zinc-400 dark:placeholder:text-[#64748b] focus:outline-none focus:ring-2 focus:ring-[#10b981]/50 focus:border-[#10b981] transition-all"
              required
            />
          </div>

          {/* Email */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-900 dark:text-white flex items-center gap-2">
              <Mail className="w-4 h-4 text-[#10b981]" />
              Email Corporativo *
            </label>
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="Ex: joao.silva@coi.com.br"
              className="w-full px-4 py-3 bg-white dark:bg-[#0f172a] border border-zinc-200 dark:border-[#334155] rounded-lg text-zinc-900 dark:text-white placeholder:text-zinc-400 dark:placeholder:text-[#64748b] focus:outline-none focus:ring-2 focus:ring-[#10b981]/50 focus:border-[#10b981] transition-all"
              required
            />
          </div>

          {/* Perfil */}
          {/* <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-900 dark:text-white flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-[#10b981]" />
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
                      : "bg-white dark:bg-[#0f172a] border-zinc-200 dark:border-[#334155] text-zinc-600 dark:text-[#94a3b8] hover:bg-zinc-50 dark:hover:bg-[#1e293b]/50"
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div> */}

          {/* Mesa */}
          <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-900 dark:text-white">
                Mesa
              </label>
              <select
                value={table}
                onChange={(event) => setDesk(event.target.value)}
                className="w-full px-4 py-3 bg-white dark:bg-[#0f172a] border border-zinc-200 dark:border-[#334155] rounded-lg text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#10b981]/50 focus:border-[#10b981] transition-all"
              >
                {availableTables.map((m) => (
                  <option key={m} value={m} className="bg-white dark:bg-[#0f172a]">
                    {m}
                  </option>
                ))}
              </select>
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
              className="flex-1 px-4 py-3 bg-[#10b981] hover:bg-[#10b981]/90 rounded-lg text-white font-medium transition-all shadow-lg shadow-[#10b981]/20"
            >
              Cadastrar Operador
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}