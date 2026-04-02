import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, AlertTriangle, XCircle } from "lucide-react";
import type { ShiftHandoverData } from "@/features/occurrences/services/occurrenceService";
import { getShiftHandoverData } from "@/features/occurrences/services/occurrenceService";

export const ShiftPreviousPage = () => {
  const navigate = useNavigate();
  const [data, setData] = useState<ShiftHandoverData | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const result = await getShiftHandoverData();
        setData(result);
      } catch (error) {
        console.error("Erro ao carregar turno anterior:", error);
      }
    };

    loadData();
  }, []);

  if (!data) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-theme-bg text-theme-text">
        <p>Carregando passagem de turno anterior...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-theme-bg text-theme-text p-8 max-w-7xl mx-auto animate-fade-in">
      {/* HEADER DA PÁGINA */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
         <button 
              onClick={() => navigate(-1)} 
              className="flex-shrink-0 inline-flex items-center gap-2 px-4 py-2 sm:px-5 sm:py-2.5 rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white shadow-sm hover:shadow-md transition-all duration-300 group"
            >
              <ArrowRight className="w-4 h-4 rotate-180 group-hover:-translate-x-1 transition-transform" /> 
              <span className="font-medium text-sm">Voltar</span>
            </button>
          <div>
          </div>
        </div>
      </div>

      {/* BLOCO DE PASSAGEM DE TURNO */}
      <section className="bg-theme-panel rounded-xl shadow-2xl overflow-hidden border border-theme-border flex flex-col">

        {/* CABEÇALHO */}
        <div className="relative bg-theme-input p-6 border-t-4 border-red-500">
          <div className="flex justify-between items-center">
            {/* Metadados (Operador, Horário, Data) */}
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
                  {data.criticalCount} CRÍTICAS
                </span>
              </div>
            )}
          </div>
        </div>

        {/* CONTEÚDO */}
        <div className="p-6 space-y-8 bg-theme-panel border-t border-theme-border">
          {/* 1. Relatório do Operador Anterior */}
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

          {/* 2. Pendências Críticas */}
          <section>
            <h3 className="flex items-center gap-2 text-red-400 font-bold mb-3 text-lg">
              <AlertTriangle className="w-5 h-5" />
              Pendências Críticas (Atenção Imediata)
            </h3>

            <div className="space-y-3">
              {data.occurrences.map((occ) => (
                <div
                  key={occ.id}
                  className="bg-theme-panel border border-red-500/20 rounded-lg p-4 flex items-start gap-4 hover:border-red-500/40 transition-colors"
                >
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
        </div>
      </section>
    </div>
  );
};
