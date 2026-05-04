import { useEffect, useMemo, useState } from "react";
import {
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
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { OperatorsOverview } from "@/features/supervisor/components/analytics/OperatorsOverview";
import { OperationsChart } from "../components/analytics/OperationsChart";
import { useSupervisorStore } from "../stores/useSupervisorStore";

type TooltipValue = number | string | ReadonlyArray<number | string> | undefined;
type TooltipName = string | number | undefined;

function formatTooltipValue(value: TooltipValue): string {
  if (Array.isArray(value)) {
    return value.join(" / ");
  }

  return value === undefined ? "-" : String(value);
}

function formatTooltipName(name: TooltipName): string {
  return name === undefined ? "" : String(name);
}

export function AnalyticsPage() {
  const [tempoFiltro, setTempoFiltro] = useState<"all" | "within" | "above">("all");

  const loadData = useSupervisorStore((state) => state.loadData);
  const isLoading = useSupervisorStore((state) => state.isLoading);
  const loadError = useSupervisorStore((state) => state.loadError);
  const hydratedAt = useSupervisorStore((state) => state.hydratedAt);
  const operators = useSupervisorStore((state) => state.operators);
  const occurrences = useSupervisorStore((state) => state.occurrences);

  useEffect(() => {
    if (!hydratedAt) {
      void loadData();
    }
  }, [hydratedAt, loadData]);

  const kpis = useMemo(() => {
    const activeOperators = operators.filter((operator) => operator.status === "Ativo" || operator.status === "Pausa");
    const resolved = occurrences.filter((occ) => occ.status === "resolvida").length;
    const open = occurrences.filter((occ) => occ.status === "aberta" || occ.status === "em_andamento").length;
    const critical = occurrences.filter((occ) => occ.criticality === "critica").length;
    const total = occurrences.length;
    const resolutionRate = total > 0 ? (resolved / total) * 100 : 0;
    const avgMinutes = activeOperators.length > 0
      ? activeOperators.reduce((acc, operator) => acc + operator.averageResolutionTime, 0) / activeOperators.length
      : 0;

    return {
      resolutionRate,
      avgMinutes,
      critical,
      activeOperators: activeOperators.length,
      open,
      resolved,
    };
  }, [operators, occurrences]);

  const ocorrenciasPorMesa = useMemo(() => {
    const grouped = new Map<string, { total: number; criticas: number; resolvidas: number }>();

    occurrences.forEach((occ) => {
      const key = occ.table || "N/A";
      const current = grouped.get(key) || { total: 0, criticas: 0, resolvidas: 0 };
      grouped.set(key, {
        total: current.total + 1,
        criticas: current.criticas + (occ.criticality === "critica" ? 1 : 0),
        resolvidas: current.resolvidas + (occ.status === "resolvida" ? 1 : 0),
      });
    });

    return Array.from(grouped.entries())
      .map(([mesa, data]) => ({
        mesa,
        total: data.total,
        criticas: data.criticas,
        taxaResolucao: data.total > 0 ? Math.round((data.resolvidas / data.total) * 100) : 0,
      }))
      .sort((a, b) => b.total - a.total);
  }, [occurrences]);

  const ocorrenciasPorMesaChartData = useMemo(() => {
    const semNA = ocorrenciasPorMesa.filter((item) => item.mesa !== "N/A");
    const base = semNA.length > 0 ? semNA : ocorrenciasPorMesa;
    return base.slice(0, 8);
  }, [ocorrenciasPorMesa]);

  const tempoPorPerfil = useMemo(() => {
    const filteredOperators = operators
      .filter((operator) => operator.status === "Ativo" || operator.status === "Pausa")
      .filter((operator) => {
        if (tempoFiltro === "within") {
          return operator.averageResolutionTime <= 60;
        }
        if (tempoFiltro === "above") {
          return operator.averageResolutionTime > 60;
        }
        return true;
      });

    const grouped = new Map<string, { total: number; count: number }>();

    filteredOperators
      .forEach((operator) => {
        const key = operator.profile;
        const current = grouped.get(key) || { total: 0, count: 0 };
        grouped.set(key, {
          total: current.total + operator.averageResolutionTime,
          count: current.count + 1,
        });
      });

    return Array.from(grouped.entries())
      .map(([perfil, data]) => ({
        perfil,
        tempoMedio: data.count > 0 ? Math.round(data.total / data.count) : 0,
        meta: 60,
      }))
      .sort((a, b) => b.tempoMedio - a.tempoMedio);
  }, [operators, tempoFiltro]);

  const criticidadeData = useMemo(() => {
    const counters = {
      baixa: 0,
      media: 0,
      alta: 0,
      critica: 0,
    };

    occurrences.forEach((occ) => {
      counters[occ.criticality] += 1;
    });

    return [
      { name: "Baixa", value: counters.baixa, color: "#10b981" },
      { name: "Media", value: counters.media, color: "#3b82f6" },
      { name: "Alta", value: counters.alta, color: "#f59e0b" },
      { name: "Critica", value: counters.critica, color: "#ef4444" },
    ].filter((item) => item.value > 0);
  }, [occurrences]);

  const tooltipProps = {
    contentStyle: {
      backgroundColor: "#0f172a",
      border: "1px solid #334155",
      borderRadius: 8,
      color: "#e2e8f0",
    },
    labelStyle: { color: "#cbd5e1", fontWeight: 600 },
  };

  if (isLoading && !hydratedAt) {
    return (
      <div className="eq-page-content">
        <div className="eq-surface p-6 eq-page-subtitle">
          Carregando analytics do supervisor...
        </div>
      </div>
    );
  }

  if (loadError && !hydratedAt) {
    return (
      <div className="eq-page-content">
        <div className="rounded-lg border border-red-700/40 bg-red-900/10 p-6 text-red-300">
          {loadError}
        </div>
      </div>
    );
  }

  const kpiCards = [
    {
      label: "Taxa de Resolucao Total",
      value: `${kpis.resolutionRate.toFixed(1)}%`,
      icon: CheckCircle2,
      color: "text-blue-500",
    },
    {
      label: "Tempo Medio",
      value: `${Math.round(kpis.avgMinutes)} min`,
      icon: Clock,
      color: "text-blue-500",
    },
    {
      label: "Incidentes Criticos",
      value: String(kpis.critical),
      icon: AlertTriangle,
      color: "text-red-500",
    },
    {
      label: "Turnos Ativos Agora",
      value: String(kpis.activeOperators),
      icon: Users,
      color: "text-blue-500",
    },
  ];

  return (
    <div className="eq-page-content min-h-screen space-y-6 pb-12 transition-colors">
      <div>
        <h1 className="eq-page-title text-2xl">
          Analytics e Relatorios
        </h1>
        <p className="eq-page-subtitle mt-1 text-sm">
          Analise detalhada com dados reais do COI
        </p>
      </div>

      <div className="grid grid-cols-4 gap-4">
        {kpiCards.map((kpi) => {
          const Icon = kpi.icon;
          return (
            <div
              key={kpi.label}
              className="eq-surface p-5 transition-colors"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--eq-bg-surface-soft)]">
                  <Icon className={`w-5 h-5 ${kpi.color}`} />
                </div>
              </div>

              <div className="text-2xl font-bold text-[var(--eq-text-primary)]">
                {kpi.value}
              </div>
              <div className="mt-1 text-sm text-[var(--eq-text-muted)]">
                {kpi.label}
              </div>
            </div>
          );
        })}
      </div>

      <OperationsChart />
      <OperatorsOverview />

      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-[var(--eq-text-secondary)]">
          Filtros de visualizacao
        </h2>
        <select
          value={tempoFiltro}
          onChange={(event) => setTempoFiltro(event.target.value as "all" | "within" | "above")}
          className="eq-control rounded-md px-3 py-2 text-xs focus:outline-none"
        >
          <option value="all">Todos os turnos</option>
          <option value="within">Somente dentro da meta (&lt;= 60 min)</option>
          <option value="above">Somente acima da meta (&gt; 60 min)</option>
        </select>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="eq-surface p-6 transition-colors">
          <h3 className="eq-card-title mb-1 text-lg">
            Ocorrencias por Mesa
          </h3>
          <p className="eq-card-meta mb-4">
            Volume total e criticas por mesa
          </p>

          {ocorrenciasPorMesaChartData.length === 0 ? (
            <div className="flex h-[300px] items-center justify-center rounded-md border border-dashed border-[var(--eq-border)] text-sm text-[var(--eq-text-muted)]">
              Sem ocorrencias para exibir no periodo.
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={ocorrenciasPorMesaChartData} margin={{ top: 8, right: 8, left: 0, bottom: 32 }}>
                <CartesianGrid stroke="#cbd5e1" strokeDasharray="3 3" className="dark:stroke-slate-800" />
                <XAxis dataKey="mesa" stroke="#64748b" angle={-25} textAnchor="end" height={56} interval={0} />
                <YAxis stroke="#64748b" allowDecimals={false} />
                <Tooltip
                  {...tooltipProps}
                  formatter={(value: TooltipValue, name: TooltipName) => [
                    formatTooltipValue(value),
                    name === "total"
                      ? "Total"
                      : name === "criticas"
                        ? "Criticas"
                        : "Taxa de resolucao",
                  ]}
                />
                <Legend />
                <Bar dataKey="total" fill="#10b981" name="Total" radius={[4, 4, 0, 0]} />
                <Bar dataKey="criticas" fill="#ef4444" name="Criticas" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="eq-surface p-6 transition-colors">
          <h3 className="eq-card-title mb-1 text-lg">
            Tempo Medio de Resolucao por Perfil
          </h3>
          <p className="eq-card-meta mb-4">
            Em minutos - Meta: 60 min
          </p>

          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={tempoPorPerfil} margin={{ left: 8, right: 8 }}>
              <CartesianGrid stroke="#cbd5e1" strokeDasharray="3 3" />
              <XAxis dataKey="perfil" stroke="#64748b" />
              <YAxis stroke="#64748b" domain={[0, 90]} />
              <Tooltip
                {...tooltipProps}
                formatter={(value: TooltipValue, name: TooltipName) => [
                  formatTooltipValue(value),
                  name === "meta" ? "Meta" : "Tempo medio",
                ]}
              />
              <Legend />
              <Bar dataKey="meta" fill="rgba(100,116,139,0.3)" name="Meta (60 min)" />
              <Bar dataKey="tempoMedio" fill="#10b981" name="Tempo Medio" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="eq-surface p-6 transition-colors">
          <h3 className="eq-card-title mb-1 text-lg">
            Distribuicao por Criticidade
          </h3>
          <p className="eq-card-meta mb-4">
            Visao geral da carteira atual de ocorrencias
          </p>

          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Tooltip
                {...tooltipProps}
                formatter={(value: TooltipValue, name: TooltipName) => [
                  formatTooltipValue(value),
                  formatTooltipName(name),
                ]}
              />
              <Legend />
              <Pie
                data={criticidadeData}
                dataKey="value"
                nameKey="name"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={3}
              >
                {criticidadeData.map((entry) => (
                  <Cell key={entry.name} fill={entry.color} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
