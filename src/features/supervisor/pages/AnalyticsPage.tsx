import {
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Users,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { OperatorsOverview } from "@/features/supervisor/components/analytics/OperatorsOverview";
import {
  // ANALYTICS_INCIDENTES_MENSAIS,
  ANALYTICS_TEMPO_POR_PERFIL,
  // ANALYTICS_DISTRIBUICAO_TURNO,
  // ANALYTICS_PERFORMANCE_OPERATORS,
  // ANALYTICS_STATUS_DISTRIBUICAO,
  ANALYTICS_KPIS,
  getTempoMedioResolucaoPorMesa,
} from "../mocks/mocks.ts";
import { OperationsChart } from "../components/analytics/OperationsChart";

/* =========================
   DADOS (mock)
========================= */

// const incidentesDate = ANALYTICS_INCIDENTES_MENSAIS;
const resolucaoTempoMesaData = getTempoMedioResolucaoPorMesa();
const resolucaoTempoPerfilData = ANALYTICS_TEMPO_POR_PERFIL;
// const distribuicaoTurnoData = ANALYTICS_DISTRIBUICAO_TURNO;
// const performanceOperadoresData = ANALYTICS_PERFORMANCE_OPERATORS;
// const statusDistribuicao = ANALYTICS_STATUS_DISTRIBUICAO;
const kpis = ANALYTICS_KPIS;

// Calcular trends
const calcularTrend = (atual: number, anterior: number) => {
  const diff = ((atual - anterior) / anterior) * 100;
  return {
    valor: `${diff > 0 ? "+" : ""}${diff.toFixed(1)}%`,
    positivo: diff > 0,
  };
};

const kpisArray = [
  {
    label: "Taxa de Resolução",
    value: `${kpis.taxaResolucao.toFixed(1)}%`,
    icon: CheckCircle2,
    trend: calcularTrend(kpis.taxaResolucao, kpis.taxaResolucaoMesAnterior)
      .valor,
    trendUp: calcularTrend(kpis.taxaResolucao, kpis.taxaResolucaoMesAnterior)
      .positivo,
    danger: false,
  },
  {
    label: "Tempo Médio",
    value: `${kpis.tempoMedioGeral} min`,
    icon: Clock,
    trend: calcularTrend(kpis.tempoMedioMesAnterior, kpis.tempoMedioGeral)
      .valor, // Invertido pois menor é melhor
    trendUp: kpis.tempoMedioGeral < kpis.tempoMedioMesAnterior,
    danger: false,
  },
  {
    label: "Incidentes Críticos",
    value: kpis.incidentesCriticos.toString(),
    icon: AlertTriangle,
    trend: calcularTrend(
      kpis.incidentesCriticosMesAnterior,
      kpis.incidentesCriticos,
    ).valor, // Invertido pois menor é melhor
    trendUp: kpis.incidentesCriticos < kpis.incidentesCriticosMesAnterior,
    danger: true,
  },
  {
    label: "Operadores Ativos",
    value: kpis.activeOperators.toString(),
    icon: Users,
    trend: calcularTrend(
      kpis.activeOperators,
      kpis.activeOperatorsLastMonth,
    ).valor,
    trendUp: calcularTrend(
      kpis.activeOperators,
      kpis.activeOperatorsLastMonth,
    ).positivo,
    danger: false,
  },
];

// const tooltipStyle = {
//   backgroundColor: "var(--bg-card)",
//   border: "1px solid var(--border-primary)",
//   borderRadius: "8px",
//   color: "var(--text-primary)",
//   fontSize: "12px",
// };

/* =========================
   COMPONENTE
========================= */

export function AnalyticsPage() {
  return (
    <div className="p-6 space-y-6 pb-12 bg-slate-100 dark:bg-slate-950 min-h-screen transition-colors">

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
          Analytics & Relatórios
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Análise detalhada de desempenho e métricas do COI
        </p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-4 gap-4">
        {kpisArray.map((kpi) => {
          const Icon = kpi.icon;

          return (
            <div
              key={kpi.label}
              className="bg-white dark:bg-theme-panel border border-slate-200 dark:border-slate-800 rounded-lg p-5 transition-colors"
            >
              <div className="flex items-center justify-between mb-3">

                {/* Ícone */}
                <div className="w-10 h-10 rounded-lg bg-slate-200 dark:bg-slate-800 flex items-center justify-center">
                  <Icon
                    className={`w-5 h-5 ${
                      kpi.danger
                        ? "text-red-500"
                        : "text-blue-500"
                    }`}
                  />
                </div>

                {/* Trend */}
                {kpi.trend && (
                  <div
                    className={`flex items-center gap-1 text-xs font-medium ${
                      kpi.danger
                        ? "text-red-500"
                        : kpi.trendUp
                        ? "text-emerald-500"
                        : "text-red-500"
                    }`}
                  >
                    {kpi.trendUp ? (
                      <TrendingUp className="w-3 h-3" />
                    ) : (
                      <TrendingDown className="w-3 h-3" />
                    )}
                    {kpi.trend}
                  </div>
                )}
              </div>

              <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                {kpi.value}
              </div>
              <div className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                {kpi.label}
              </div>
            </div>
          );
        })}
      </div>

      <OperationsChart />
      <OperatorsOverview />

      {/* Tempo Médio */}
      <div className="grid grid-cols-2 gap-6">

        {/* Por Mesa */}
        <div className="bg-white dark:bg-theme-panel border border-slate-200 dark:border-slate-800 rounded-lg p-6 transition-colors">
          <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-1">
            Tempo Médio de Resolução por Mesa
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
            Em minutos - Meta: 60 min
          </p>

          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={resolucaoTempoMesaData} layout="horizontal">
              <CartesianGrid
                stroke="#cbd5e1"
                strokeDasharray="3 3"
                className="dark:stroke-slate-800"
              />
              <XAxis
                type="number"
                stroke="#64748b"
                domain={[0, 70]}
              />
              <YAxis
                type="category"
                dataKey="mesa"
                stroke="#64748b"
                width={120}
                tick={{ fontSize: 11 }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "white",
                  border: "1px solid #e2e8f0",
                  borderRadius: "8px",
                  color: "#0f172a",
                  fontSize: "12px",
                }}
              />
              <Legend />

              <Bar
                dataKey="meta"
                fill="rgba(100,116,139,0.3)"
                name="Meta (60 min)"
              />

              <Bar
                dataKey="tempoMedio"
                fill="#10b981"
                name="Tempo Médio"
                radius={[0, 4, 4, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Por Perfil */}
        <div className="bg-white dark:bg-theme-panel border border-slate-200 dark:border-slate-800 rounded-lg p-6 transition-colors">
          <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-1">
            Tempo Médio de Resolução por Perfil
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
            Em minutos - Meta: 60 min
          </p>

          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={resolucaoTempoPerfilData}>
              <CartesianGrid
                stroke="#cbd5e1"
                strokeDasharray="3 3"
              />
              <XAxis dataKey="perfil" stroke="#64748b" />
              <YAxis stroke="#64748b" domain={[0, 70]} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "white",
                  border: "1px solid #e2e8f0",
                  borderRadius: "8px",
                  color: "#0f172a",
                  fontSize: "12px",
                }}
              />
              <Legend />

              <Bar
                dataKey="meta"
                fill="rgba(100,116,139,0.3)"
                name="Meta (60 min)"
              />

              <Bar
                dataKey="tempoMedio"
                fill="#10b981"
                name="Tempo Médio"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}