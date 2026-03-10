import { useMemo, useState, useEffect } from "react";
import { CheckCircle2, Loader2, AlertCircle } from "lucide-react";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { startShiftApi, getOperationDesksApi } from "../../occurrences/services/shiftService";

// Tipo da Mesa baseado no que vem do banco de dados
type Mesa = {
  id: number | string; // O Laravel geralmente retorna número
  code: string;
  name: string;
  location: string;
};

export function TableSelector() {
  const { user, role, selectRole, selectTable, logout } = useAuth();
  const displayName = user?.name || "Operador";
  
  // Estados
  const [mesas, setMesas] = useState<Mesa[]>([]);
  const [selectedMesa, setSelectedMesa] = useState<number | string | null>(null);
  const [isLoadingMesas, setIsLoadingMesas] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [isStarting, setIsStarting] = useState(false); 

  const canConfirm = useMemo(() => Boolean(selectedMesa), [selectedMesa]);

  // Busca as mesas do banco de dados quando a tela carrega
  useEffect(() => {
    const fetchMesas = async () => {
      try {
        setIsLoadingMesas(true);
        setFetchError(null);
        const data = await getOperationDesksApi();
        setMesas(data);
      } catch (error) {
        console.error("Erro ao buscar mesas:", error);
        setFetchError("Não foi possível carregar as mesas de operação. Verifique sua conexão.");
      } finally {
        setIsLoadingMesas(false);
      }
    };

    fetchMesas();
  }, []);

  const handleConfirm = async () => {
    if (!selectedMesa || !role) return;

    // 1. Encontramos o objeto COMPLETO da mesa dentro do array 'mesas'
    const mesaCompleta = mesas.find(m => m.id === selectedMesa);
    
    // Verificação de segurança
    if (!mesaCompleta) return; 

    // 2. Montamos o objeto exatamente como a sua interface Table espera
    const mesaParaSalvar = {
      id: mesaCompleta.id.toString(),
      name: mesaCompleta.name,
      code: mesaCompleta.code,
    };

    try {
      setIsStarting(true);
      await startShiftApi(selectedMesa.toString(), role);
      
      // 3. AGORA SIM: Enviamos o objeto completo para o Zustand!
      selectTable(mesaParaSalvar as any); // (o 'as any' previne erros se o TS ainda estiver lendo o cache antigo)
      
    } catch (error: any) {
      const errorMessage = error.response?.data?.error;

      if (errorMessage === 'Já existe um turno em andamento para este operador.') {
        // Lembre-se de atualizar aqui também para o caso de "fingir" o sucesso
        selectTable(mesaParaSalvar as any); 
        return;
      }
      
      alert(errorMessage || "Erro ao iniciar turno.");
    } finally {
      setIsStarting(false);
    }
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

      {/* Tratamento de Estados: Carregando ou Erro */}
      {isLoadingMesas ? (
        <div className="flex flex-col items-center justify-center py-12 mb-10">
          <Loader2 className="w-10 h-10 text-emerald-500 animate-spin mb-4" />
          <p className="text-slate-500 dark:text-slate-400">Carregando mesas disponíveis...</p>
        </div>
      ) : fetchError ? (
        <div className="flex flex-col items-center justify-center py-12 mb-10 bg-red-50 dark:bg-red-900/10 p-6 rounded-2xl border border-red-200 dark:border-red-800/50 max-w-lg text-center">
          <AlertCircle className="w-10 h-10 text-red-500 mb-4" />
          <p className="text-red-700 dark:text-red-400 mb-4">{fetchError}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-4 py-2 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors"
          >
            Tentar Novamente
          </button>
        </div>
      ) : mesas.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 mb-10 text-slate-500 dark:text-slate-400">
          <p>Nenhuma mesa de operação ativa encontrada no sistema.</p>
        </div>
      ) : (
        /* Grid of Mesas vindo do Banco */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 max-w-6xl w-full mb-10">
          {mesas.map((mesa) => {
            const isSelected = selectedMesa === mesa.id;

            return (
              <button
                key={mesa.id}
                onClick={() => setSelectedMesa(mesa.id)}
                disabled={isStarting}
                aria-pressed={isSelected}
                className={[
                  "relative flex flex-col items-center p-6 rounded-xl border transition-all",
                  "focus:outline-none focus:ring-2 focus:ring-emerald-500/30",
                  isStarting ? "opacity-70 cursor-not-allowed" : "",
                  isSelected
                    ? "border-emerald-500 bg-emerald-500/10 shadow-lg shadow-emerald-500/10"
                    : "bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50 dark:bg-slate-900/60 dark:border-slate-800 dark:hover:border-slate-700 dark:hover:bg-slate-900/80",
                ].join(" ")}
              >
                {/* Code Badge */}
                <span className="px-3 py-1 text-xs font-medium rounded mb-4 text-slate-500 bg-slate-100 dark:text-slate-300 dark:bg-slate-950/60">
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
      )}

      {/* Actions */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => selectRole(null)} 
          disabled={isStarting}
          className="px-6 py-3 rounded-lg font-medium text-base text-slate-500 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Voltar
        </button>

        <button
          onClick={handleConfirm}
          disabled={!canConfirm || isStarting || isLoadingMesas || mesas.length === 0}
          className={[
            "px-10 py-3 rounded-lg font-medium text-base transition-all flex items-center justify-center gap-2",
            canConfirm && !isStarting && !isLoadingMesas
              ? "bg-emerald-600 hover:bg-emerald-700 text-white dark:bg-emerald-600 dark:hover:bg-emerald-700 shadow-lg shadow-emerald-500/20"
              : "bg-slate-200 text-slate-500 cursor-not-allowed dark:bg-slate-800 dark:text-slate-400",
          ].join(" ")}
        >
          {isStarting ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Iniciando...
            </>
          ) : (
            "Confirmar Seleção"
          )}
        </button>
      </div>

      <button
        onClick={logout}
        disabled={isStarting}
        className="mt-6 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 text-sm underline underline-offset-4 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Encerrar sessão
      </button>
    </div>
  );
}