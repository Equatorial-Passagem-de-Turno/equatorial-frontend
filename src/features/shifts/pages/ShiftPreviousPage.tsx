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
      } catch (err: unknown) {
        console.error("Erro completo da API:", err);
        const apiError = err as { response?: { status?: number }; message?: string };
        if (apiError.response && apiError.response.status === 404) {
           setError("Não há registro de relatório de turno anterior para a sua sessão atual.");
        } else {
           setError(apiError.message || "Erro desconhecido ao tentar conectar com a API do Laravel.");
        }
      }
    };

    loadData();
  }, []);

  if (error) {
    return (
      <div className="eq-page-content min-h-screen flex items-center justify-center p-4">
        <div className="eq-surface p-8 rounded-2xl flex flex-col items-center max-w-md text-center">
          <AlertTriangle className="w-16 h-16 text-red-500 mb-4" />
          <h2 className="eq-card-title text-xl mb-2">Falha na Comunicação</h2>
          <p className="eq-page-subtitle mb-6">{error}</p>
          <p className="text-sm text-[var(--eq-text-secondary)] mb-6">
            Dica: Verifique se o servidor Laravel está rodando (php artisan serve) e se o CORS está configurado.
          </p>
          <button 
            onClick={() => window.location.reload()} 
            className="flex items-center gap-2 px-6 py-2 bg-[var(--eq-surface)] border border-[var(--eq-border)] rounded-lg transition-colors hover:bg-slate-100"
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
      <div className="eq-page-content min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="eq-page-subtitle animate-pulse">Buscando dados no servidor...</p>
        </div>
      </div>
    );
  }

  const pendencias = data.occurrences.filter(o => o.status !== 'Resolvida' && o.status !== 'Finalizada');
  const resolvidas = data.occurrences.filter(o => o.status === 'Resolvida' || o.status === 'Finalizada');

  return (
    <div className="eq-page-content min-h-screen p-8 max-w-7xl mx-auto animate-fade-in">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate(-1)} 
            className="eq-back-button group"
          >
            <ArrowRight className="w-4 h-4 rotate-180 group-hover:-translate-x-1 transition-transform" /> 
            <span className="font-medium text-sm">Voltar</span>
          </button>
        </div>
      </div>

      <section className="eq-surface rounded-2xl shadow-sm overflow-hidden border border-[var(--eq-border)] flex flex-col">
        <div className="relative bg-[var(--eq-surface-soft)] p-6 border-t-4 border-emerald-500">
          <div className="flex flex-wrap justify-between gap-6 items-center">
            <div className="flex flex-wrap gap-6 text-sm text-[var(--eq-text-secondary)] font-medium uppercase tracking-wider">
              <div>
                <span className="text-[var(--eq-text-muted)] mr-1">Anterior:</span>
                <span className="text-[var(--eq-text-primary)]">{data.previousOperator}</span>
              </div>
              <div>
                <span className="text-[var(--eq-text-muted)] mr-1">Horário:</span>
                <span className="text-[var(--eq-text-primary)]">{data.shiftTime}</span>
              </div>
              <div>
                <span className="text-[var(--eq-text-muted)] mr-1">Data:</span>
                <span className="text-[var(--eq-text-primary)]">{data.date}</span>
              </div>
              <div>
                <span className="text-[var(--eq-text-muted)] mr-1">Total Trabalhado:</span>
                <span className="text-[var(--eq-text-primary)]">{data.tempoTrabalhadoTurnoAnterior || '--'}</span>
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

        <div className="p-6 space-y-8 bg-[var(--eq-surface)] border-t border-[var(--eq-border)]">
          {/* Relatório */}
          <section>
            <h3 className="eq-card-title mb-3 text-lg">
              Relatório do Operador Anterior
            </h3>
            <div className="eq-surface-soft border border-[var(--eq-border)] p-5 rounded-lg">
              <p className="eq-page-subtitle leading-relaxed text-sm">
                "{data.reportText}"
              </p>
            </div>
          </section>

          {/* O QUE ELE DEIXOU PARA TRÁS (PENDÊNCIAS) */}
          {pendencias.length > 0 && (
            <section>
              <h3 className="flex items-center gap-2 text-red-500 font-bold mb-3 text-lg">
                <AlertTriangle className="w-5 h-5" />
                Pendências Deixadas (Atenção Imediata)
              </h3>
              <div className="space-y-3">
                {pendencias.map((occ) => (
                  <div key={occ.id} className="eq-surface-soft border border-red-500/20 rounded-lg p-4 flex items-start gap-4 hover:border-red-500/40 transition-colors">
                    <div className="mt-1">
                      <XCircle className="w-6 h-6 text-red-500" />
                    </div>
                    <div>
                      <span className="text-red-500 text-xs font-mono mb-1 block">
                        {occ.id}
                      </span>
                      <h4 className="text-[var(--eq-text-primary)] font-bold text-base mb-1">
                        {occ.title}
                      </h4>
                      <p className="text-[var(--eq-text-secondary)] text-sm">
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
                  <div key={occ.id} className="eq-surface-soft border border-emerald-500/20 rounded-lg p-4 flex items-start gap-4 hover:border-emerald-500/40 transition-colors opacity-75">
                    <div className="mt-1">
                      <CheckCircle className="w-6 h-6 text-emerald-500" />
                    </div>
                    <div>
                      <span className="text-emerald-500 text-xs font-mono mb-1 block">
                        {occ.id}
                      </span>
                      <h4 className="text-[var(--eq-text-primary)] font-bold text-base mb-1 line-through">
                        {occ.title}
                      </h4>
                      <p className="text-[var(--eq-text-secondary)] text-sm">
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