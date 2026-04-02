import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, AlertTriangle, XCircle, RefreshCcw, CheckCircle } from "lucide-react";
import type { ShiftHandoverData } from "@/features/occurrences/services/occurrenceService";
import { api } from "@/services/api";

export const ShiftPreviousPage = () => {
  const navigate = useNavigate();
  const [data, setData] = useState<ShiftHandoverData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setError(null);
        const response = await api.get('/shifts/previous-details');
        setData(response.data);
      } catch (err: any) {
        console.error("Erro completo da API:", err);
        if (err.response && err.response.status === 404) {
           setError("Não há registro de relatório de turno anterior para a sua sessão atual.");
        } else {
           setError(err.message || "Erro desconhecido ao tentar conectar com a API do Laravel.");
        }
      }
    };

    loadData();
  }, []);

  if (error) {
    return (
      <div className="min-h-screen w-full flex flex-col items-center justify-center bg-theme-bg text-theme-text p-4">
        <div className="bg-red-500/10 border border-red-500/20 p-8 rounded-2xl flex flex-col items-center max-w-md text-center">
          <AlertTriangle className="w-16 h-16 text-red-500 mb-4" />
          <h2 className="text-xl font-bold text-red-500 mb-2">Falha na Comunicação</h2>
          <p className="text-theme-muted mb-6">{error}</p>
          <p className="text-sm text-theme-muted mb-6">
            Dica: Verifique se o servidor Laravel está rodando (php artisan serve) e se o CORS está configurado.
          </p>
          <button 
            onClick={() => window.location.reload()} 
            className="flex items-center gap-2 px-6 py-2 bg-theme-panel border border-theme-border hover:bg-slate-800 rounded-lg transition-colors"
          >
            <RefreshCcw className="w-4 h-4" />
            Tentar Novamente
          </button>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-theme-bg text-theme-text">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-theme-muted animate-pulse">Buscando dados no servidor...</p>
        </div>
      </div>
    );
  }

  const pendencias = data.occurrences.filter(o => o.status !== 'Resolvida' && o.status !== 'Finalizada');
  const resolvidas = data.occurrences.filter(o => o.status === 'Resolvida' || o.status === 'Finalizada');

  return (
    <div className="min-h-screen bg-theme-bg text-theme-text p-8 max-w-7xl mx-auto animate-fade-in">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate(-1)} 
            className="flex-shrink-0 inline-flex items-center gap-2 px-4 py-2 sm:px-5 sm:py-2.5 rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white shadow-sm hover:shadow-md transition-all duration-300 group"
          >
            <ArrowRight className="w-4 h-4 rotate-180 group-hover:-translate-x-1 transition-transform" /> 
            <span className="font-medium text-sm">Voltar</span>
          </button>
        </div>
      </div>

      <section className="bg-theme-panel rounded-xl shadow-2xl overflow-hidden border border-theme-border flex flex-col">
        <div className="relative bg-theme-input p-6 border-t-4 border-red-500">
          <div className="flex justify-between items-center">
            <div className="flex flex-wrap gap-6 text-sm text-theme-muted font-medium uppercase tracking-wider">
              <div>
                <span className="text-theme-muted mr-1">Anterior:</span>
                <span className="text-theme-text">{data.previousOperator}</span>
              </div>
              <div>
                <span className="text-theme-muted mr-1">Horário:</span>
                <span className="text-theme-text">{data.shiftTime}</span>
              </div>
              <div>
                <span className="text-theme-muted mr-1">Data:</span>
                <span className="text-theme-text">{data.date}</span>
              </div>
            </div>

            {data.criticalCount > 0 && (
              <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 px-4 py-2 rounded-full">
                <AlertTriangle className="w-5 h-5 text-red-500" />
                <span className="text-red-500 font-bold text-sm">
                  {data.criticalCount} CRÍTICAS PENDENTES
                </span>
              </div>
            )}
          </div>
        </div>

        <div className="p-6 space-y-8 bg-theme-panel border-t border-theme-border">
          {/* Relatório */}
          <section>
            <h3 className="text-theme-text font-bold mb-3 text-lg">
              Relatório do Operador Anterior
            </h3>
            <div className="bg-theme-panel border border-theme-border p-5 rounded-lg">
              <p className="text-theme-muted leading-relaxed text-sm">
                "{data.reportText}"
              </p>
            </div>
          </section>

          {/* O QUE ELE DEIXOU PARA TRÁS (PENDÊNCIAS) */}
          {pendencias.length > 0 && (
            <section>
              <h3 className="flex items-center gap-2 text-red-400 font-bold mb-3 text-lg">
                <AlertTriangle className="w-5 h-5" />
                Pendências Deixadas (Atenção Imediata)
              </h3>
              <div className="space-y-3">
                {pendencias.map((occ) => (
                  <div key={occ.id} className="bg-theme-panel border border-red-500/20 rounded-lg p-4 flex items-start gap-4 hover:border-red-500/40 transition-colors">
                    <div className="mt-1">
                      <XCircle className="w-6 h-6 text-red-500" />
                    </div>
                    <div>
                      <span className="text-red-400 text-xs font-mono mb-1 block">
                        {occ.id}
                      </span>
                      <h4 className="text-theme-text font-bold text-base mb-1">
                        {occ.title}
                      </h4>
                      <p className="text-slate-400 text-sm">
                        {occ.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* O QUE ELE CONCLUIU NO TURNO (RESOLVIDAS) */}
          {resolvidas.length > 0 && (
            <section>
              <h3 className="flex items-center gap-2 text-emerald-500 font-bold mb-3 text-lg">
                <CheckCircle className="w-5 h-5" />
                Ocorrências Concluídas pelo Operador
              </h3>
              <div className="space-y-3">
                {resolvidas.map((occ) => (
                  <div key={occ.id} className="bg-theme-panel border border-emerald-500/20 rounded-lg p-4 flex items-start gap-4 hover:border-emerald-500/40 transition-colors opacity-75">
                    <div className="mt-1">
                      <CheckCircle className="w-6 h-6 text-emerald-500" />
                    </div>
                    <div>
                      <span className="text-emerald-500 text-xs font-mono mb-1 block">
                        {occ.id}
                      </span>
                      <h4 className="text-theme-text font-bold text-base mb-1 line-through">
                        {occ.title}
                      </h4>
                      <p className="text-slate-400 text-sm">
                        {occ.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      </section>
    </div>
  );
};