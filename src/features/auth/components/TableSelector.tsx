import { useMemo, useState } from "react";
import { CheckCircle2 } from "lucide-react";

import { useAuth } from "@/features/auth/hooks/useAuth";

type Mesa = {
  id: string;
  code: string;
  name: string;
  location: string;
};

const MESAS: Mesa[] = [
  { id: "mesa-01", code: "MESA-01", name: "MCZ I", location: "Maceió" },
  { id: "mesa-02", code: "MESA-02", name: "MCZ II", location: "Maceió" },
  { id: "mesa-03", code: "MESA-03", name: "DMG / SDI", location: "Maceió" },
  { id: "mesa-04", code: "MESA-04", name: "RLU / SMC", location: "Maceió" },
  { id: "mesa-05", code: "MESA-05", name: "DMG/SDI/PND", location: "Maceió" },
  { id: "mesa-06", code: "MESA-06", name: "LESTE/OESTE", location: "Maceió" },
  { id: "mesa-07", code: "MESA-07", name: "MCZ I/RLU (RD LESTE 1)", location: "Maceió" },
  { id: "mesa-08", code: "MESA-08", name: "OUTRAS", location: "Maceió" },
];

export function TableSelector() {
  const { selectTable, logout } = useAuth();
  const { user } = useAuth();
  const displayName = user?.name || "Operador";
  const [selectedMesa, setSelectedMesa] = useState<string | null>(null);
  const canConfirm = useMemo(() => Boolean(selectedMesa), [selectedMesa]);

  const handleConfirm = () => {
    if (!selectedMesa) return;
    selectTable(selectedMesa);
  };

  return (
    <div
      className="
        min-h-screen w-full flex flex-col items-center justify-center p-6
        bg-theme-bg text-theme-text
        dark:bg-gradient-to-br dark:from-slate-950 dark:via-slate-900 dark:to-emerald-950
      "
    >
      
    <div className="text-center mb-12">
      <h1 className="text-3xl sm:text-4xl font-bold text-theme-text mb-4">
        Olá, <span className="text-emerald-400">{displayName}</span>
      </h1>

      <p className="text-theme-muted">
        Em qual mesa de operação você assumirá o turno hoje?
      </p>
    </div>


      {/* Grid of Mesas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 max-w-6xl w-full mb-10">
        {MESAS.map((mesa) => {
          const isSelected = selectedMesa === mesa.id;

          return (
            <button
              key={mesa.id}
              onClick={() => setSelectedMesa(mesa.id)}
              aria-pressed={isSelected}
              className={[
                "relative flex flex-col items-center p-6 rounded-xl border transition-all",
                "focus:outline-none focus:ring-2 focus:ring-emerald-500/30",
                isSelected
                  ? "border-emerald-500 bg-emerald-500/10 shadow-lg shadow-emerald-500/10"
                  : "bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50 dark:bg-slate-900/60 dark:border-slate-800 dark:hover:border-slate-700 dark:hover:bg-slate-900/80",
              ].join(" ")}
            >
              {/* Code Badge */}
              <span
                className="
                  px-3 py-1 text-xs font-medium rounded mb-4
                  text-slate-500 bg-slate-100
                  dark:text-slate-300 dark:bg-slate-950/60
                "
              >
                {mesa.code}
              </span>

              {/* Name */}
              <h3 className="font-semibold text-center text-slate-900 dark:text-white mb-1">
                {mesa.name}
              </h3>

              <p className="text-sm text-slate-600 dark:text-slate-300/80">
                {mesa.location}
              </p>

              {/* Selection Indicator */}
              {isSelected && (
                <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-emerald-600 dark:bg-emerald-500 flex items-center justify-center">
                  <CheckCircle2 className="w-4 h-4 text-white" />
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-4">
        {/* Confirm Button */}
        <button
          onClick={handleConfirm}
          disabled={!canConfirm}
          className={[
            "px-10 py-3 rounded-lg font-medium text-base transition-all",
            canConfirm
              ? "bg-emerald-600 hover:bg-emerald-700 text-white dark:bg-emerald-600 dark:hover:bg-emerald-700"
              : "bg-slate-200 text-slate-500 cursor-not-allowed dark:bg-slate-800 dark:text-slate-400",
          ].join(" ")}
        >
          Confirmar Seleção
        </button>
      </div>

      {/* Encerrar sessão */}
      <button
        onClick={logout}
        className="mt-6 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 text-sm underline underline-offset-4"
      >
        Encerrar sessão
      </button>
    </div>
  );
}