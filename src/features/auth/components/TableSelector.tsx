import { useMemo, useState, useEffect, useRef } from "react";
import { CheckCircle2, Loader2, AlertCircle } from "lucide-react";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { startShiftApi, getOperationDesksApi } from "../../occurrences/services/shiftService";
import { showConfirmModal, showErrorModal, showWarningModal } from "@/shared/ui/feedbackModal";

// Tipo da Mesa baseado no que vem do banco de dados
type Mesa = {
  id: number | string; // O Laravel geralmente retorna número
  code: string;
  name: string;
  location: string;
};

type StartConfirmation = {
  mode: "started" | "existing";
  mesaName: string;
  roleName: string;
  startedAt: string;
};

export function TableSelector() {
  const { user, role, selectRole, selectTable, logout } = useAuth();
  const displayName = user?.name || "Operador";

  const handleLogout = async () => {
    const shouldLogout = await showConfirmModal(
      "Importante: recomendamos encerrar o turno antes de sair do sistema para evitar pendencias sem repasse.\n\nDeseja sair mesmo assim?",
      "Sair do Sistema?",
      "Sair mesmo assim",
      "Continuar no sistema"
    );

    if (!shouldLogout) return;
    await logout();
  };
  
  // Estados
  const [mesas, setMesas] = useState<Mesa[]>([]);
  const [selectedMesa, setSelectedMesa] = useState<number | string | null>(null);
  const [isLoadingMesas, setIsLoadingMesas] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [isStarting, setIsStarting] = useState(false); 
  const [startConfirmation, setStartConfirmation] = useState<StartConfirmation | null>(null);
  const confirmationTimeoutRef = useRef<number | null>(null);

  const getBrasiliaCurrentTime = () => {
    return new Intl.DateTimeFormat("pt-BR", {
      timeZone: "America/Sao_Paulo",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    }).format(new Date());
  };

  const canConfirm = useMemo(() => Boolean(selectedMesa && role), [selectedMesa, role]);

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

  useEffect(() => {
    if (!mesas.length || selectedMesa) {
      return;
    }

    const userDefaultDeskId = user?.operation_desk_id;
    if (userDefaultDeskId === null || userDefaultDeskId === undefined) {
      return;
    }

    const normalizedDefault = String(userDefaultDeskId);
    const matchingDesk = mesas.find((mesa) => String(mesa.id) === normalizedDefault);

    if (matchingDesk) {
      setSelectedMesa(matchingDesk.id);
    }
  }, [mesas, selectedMesa, user?.operation_desk_id]);

  useEffect(() => {
    return () => {
      if (confirmationTimeoutRef.current) {
        window.clearTimeout(confirmationTimeoutRef.current);
      }
    };
  }, []);

  const handleConfirm = async () => {
    if (!selectedMesa || !role) {
      await showWarningModal("Selecione uma mesa e confirme o perfil para iniciar o turno.");
      return;
    }

    // 1. Encontramos o objeto COMPLETO da mesa dentro do array 'mesas'
    const mesaCompleta = mesas.find((mesa) => String(mesa.id) === String(selectedMesa));
    
    // Verificação de segurança
    if (!mesaCompleta) {
      await showWarningModal("Mesa selecionada inválida. Selecione novamente.");
      return;
    }

    // 2. Pré-montamos o objeto para uso local/fallback
    const mesaParaSalvarBase = {
      id: String(mesaCompleta.id),
      name: mesaCompleta.name,
      code: mesaCompleta.code,
    };

    try {
      setIsStarting(true);
      setStartConfirmation(null);
      const startedShift = await startShiftApi(String(selectedMesa), String(role));

      // 3. Se o backend retornar a mesa do turno, priorizamos esse payload para manter consistência
      const mesaParaSalvar = startedShift?.desk
        ? {
            id: String(startedShift.desk.id ?? mesaParaSalvarBase.id),
            name: String(startedShift.desk.name ?? mesaParaSalvarBase.name),
            code: String(startedShift.desk.code ?? mesaParaSalvarBase.code),
          }
        : mesaParaSalvarBase;

      setStartConfirmation({
        mode: "started",
        mesaName: mesaParaSalvar.name,
        roleName: String(role),
        startedAt: getBrasiliaCurrentTime(),
      });

      if (confirmationTimeoutRef.current) {
        window.clearTimeout(confirmationTimeoutRef.current);
      }

      confirmationTimeoutRef.current = window.setTimeout(() => {
        selectTable(mesaParaSalvar as any); // (o 'as any' previne erros se o TS ainda estiver lendo o cache antigo)
      }, 1200);
      
      // 4. Só liberamos o app após confirmar início de turno com sucesso.
      
    } catch (error: any) {
      const errorMessage = error?.response?.data?.error || error?.response?.data?.message || "";

      if (String(errorMessage).includes('Já existe um turno em andamento para este operador.')) {
        setStartConfirmation({
          mode: "existing",
          mesaName: mesaParaSalvarBase.name,
          roleName: String(role),
          startedAt: getBrasiliaCurrentTime(),
        });

        if (confirmationTimeoutRef.current) {
          window.clearTimeout(confirmationTimeoutRef.current);
        }

        confirmationTimeoutRef.current = window.setTimeout(() => {
          // Se já houver turno ativo, seguimos para o painel com a mesa escolhida.
          selectTable(mesaParaSalvarBase as any);
        }, 1200);
        return;
      }
      
      await showErrorModal(errorMessage || "Erro ao iniciar turno.");
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
        <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-2 font-medium">
          Ao confirmar a mesa, o turno será iniciado automaticamente.
        </p>
        {!!user?.operation_desk_name && (
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
            Mesa padrão cadastrada: {user.operation_desk_name}. Você pode manter ou escolher outra.
          </p>
        )}
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
          disabled={isStarting || Boolean(startConfirmation)}
          className="px-6 py-3 rounded-lg font-medium text-base text-slate-500 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Voltar
        </button>

        <button
          onClick={handleConfirm}
          disabled={!canConfirm || isStarting || isLoadingMesas || mesas.length === 0 || Boolean(startConfirmation)}
          className={[
            "px-10 py-3 rounded-lg font-medium text-base transition-all flex items-center justify-center gap-2",
            canConfirm && !isStarting && !isLoadingMesas && !startConfirmation
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

      {startConfirmation && (
        <div className="mt-6 max-w-xl w-full rounded-xl border border-emerald-300/40 dark:border-emerald-700/50 bg-emerald-50 dark:bg-emerald-900/20 px-4 py-3">
          <div className="flex items-start gap-3">
            <div className="mt-0.5">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <p className="text-sm font-semibold text-emerald-800 dark:text-emerald-300">
                {startConfirmation.mode === "started"
                  ? "Turno iniciado com sucesso."
                  : "Turno já estava em andamento e foi confirmado para acesso."}
              </p>
              <p className="text-xs text-emerald-700/90 dark:text-emerald-300/90 mt-1">
                Mesa: {startConfirmation.mesaName} • Perfil: {startConfirmation.roleName}
              </p>
              <p className="text-xs text-emerald-700/90 dark:text-emerald-300/90">
                Horário de Brasília: {startConfirmation.startedAt}
              </p>
            </div>
          </div>
        </div>
      )}

      <button
        onClick={handleLogout}
        disabled={isStarting || Boolean(startConfirmation)}
        className="mt-6 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 text-sm underline underline-offset-4 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Encerrar sessão
      </button>
    </div>
  );
}