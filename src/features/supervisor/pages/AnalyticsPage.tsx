import { useEffect, useMemo } from "react";
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
} from "recharts";
import { OperatorsOverview } from "@/features/supervisor/components/analytics/OperatorsOverview";
import { OperationsChart } from "../components/analytics/OperationsChart";
import { useSupervisorStore } from "../stores/useSupervisorStore";

export function AnalyticsPage() {
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

  const tempoPorMesa = useMemo(() => {
    const grouped = new Map<string, { total: number; count: number }>();

    operators
      .filter((operator) => operator.status === "Ativo" || operator.status === "Pausa")
      .forEach((operator) => {
        const key = operator.table || "N/A";
        const current = grouped.get(key) || { total: 0, count: 0 };
        grouped.set(key, {
          total: current.total + operator.averageResolutionTime,
          count: current.count + 1,
        });
      });

    return Array.from(grouped.entries()).map(([mesa, data]) => ({
      mesa,
      tempoMedio: data.count > 0 ? Math.round(data.total / data.count) : 0,
      meta: 60,
    }));
  }, [operators]);

  const tempoPorPerfil = useMemo(() => {
    const grouped = new Map<string, { total: number; count: number }>();

    operators
      .filter((operator) => operator.status === "Ativo" || operator.status === "Pausa")
      .forEach((operator) => {
        const key = operator.profile;
        const current = grouped.get(key) || { total: 0, count: 0 };
        grouped.set(key, {
          total: current.total + operator.averageResolutionTime,
          count: current.count + 1,
        });
      });

    return Array.from(grouped.entries()).map(([perfil, data]) => ({
      perfil,
      tempoMedio: data.count > 0 ? Math.round(data.total / data.count) : 0,
      meta: 60,
    }));
  }, [operators]);

  if (isLoading && !hydratedAt) {
    return (
      <div className="p-6">
        <div className="rounded-lg border border-slate-700 bg-slate-900 p-6 text-slate-300">
          Carregando analytics do supervisor...
        </div>
      </div>
    );
  }

  if (loadError && !hydratedAt) {
    return (
      <div className="p-6">
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
    <div className="p-6 space-y-6 pb-12 bg-slate-100 dark:bg-slate-950 min-h-screen transition-colors">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
          Analytics e Relatorios
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Analise detalhada com dados reais do COI
        </p>
      </div>

      <div className="grid grid-cols-4 gap-4">
        {kpiCards.map((kpi) => {
          const Icon = kpi.icon;
          return (
            <div
              key={kpi.label}
              className="bg-white dark:bg-theme-panel border border-slate-200 dark:border-slate-800 rounded-lg p-5 transition-colors"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-lg bg-slate-200 dark:bg-slate-800 flex items-center justify-center">
                  <Icon className={`w-5 h-5 ${kpi.color}`} />
                </div>
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

      <div className="grid grid-cols-2 gap-6">
        <div className="bg-white dark:bg-theme-panel border border-slate-200 dark:border-slate-800 rounded-lg p-6 transition-colors">
          <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-1">
            Tempo Medio de Resolucao por Mesa
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
            Em minutos - Meta: 60 min
          </p>

          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={tempoPorMesa} layout="horizontal">
              <CartesianGrid stroke="#cbd5e1" strokeDasharray="3 3" className="dark:stroke-slate-800" />
              <XAxis type="number" stroke="#64748b" domain={[0, 90]} />
              <YAxis type="category" dataKey="mesa" stroke="#64748b" width={120} tick={{ fontSize: 11 }} />
              <Tooltip />
              <Legend />
              <Bar dataKey="meta" fill="rgba(100,116,139,0.3)" name="Meta (60 min)" />
              <Bar dataKey="tempoMedio" fill="#10b981" name="Tempo Medio" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white dark:bg-theme-panel border border-slate-200 dark:border-slate-800 rounded-lg p-6 transition-colors">
          <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-1">
            Tempo Medio de Resolucao por Perfil
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
            Em minutos - Meta: 60 min
          </p>

          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={tempoPorPerfil}>
              <CartesianGrid stroke="#cbd5e1" strokeDasharray="3 3" />
              <XAxis dataKey="perfil" stroke="#64748b" />
              <YAxis stroke="#64748b" domain={[0, 90]} />
              <Tooltip />
              <Legend />
              <Bar dataKey="meta" fill="rgba(100,116,139,0.3)" name="Meta (60 min)" />
              <Bar dataKey="tempoMedio" fill="#10b981" name="Tempo Medio" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
