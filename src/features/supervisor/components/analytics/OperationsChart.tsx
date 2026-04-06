"use client";

import { useMemo, useState } from "react";
import {
  ResponsiveContainer,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  BarChart,
  Bar,
  LineChart,
  Line,
} from "recharts";
import { useSupervisorStore } from "../../stores/useSupervisorStore";
import type { Occurrence } from "../../types/index";

type TimeRange = "24h" | "48h" | "72h";
type ChartType = "bars" | "line";
type PriorityKey = "baixa" | "media" | "alta" | "critica";

type TimeRow = {
  hour: string;
  baixa: number;
  media: number;
  alta: number;
  critica: number;
  total: number;
};

const MESAS = [
  "MCZ I",
  "MCZ II",
  "DMG / SDI",
  "RLU / SMC",
  "DMG / SDI / PND",
  "LESTE / OESTE",
  "MCZ I / RLU (RD LESTE 1)",
  "OUTRAS",
] as const;

const PRIORITY_LABEL: Record<PriorityKey, string> = {
  baixa: "Baixa",
  media: "Média",
  alta: "Alta",
  critica: "Crítica",
};

const PRIORITY_COLOR: Record<PriorityKey, string> = {
  baixa: "#10B981",    // verde
  media: "#3B82F6",    // azul
  alta: "#F59E0B",     // laranja
  critica: "#EF4444",  // vermelho
};

const timeRangeLabels: Record<TimeRange, string> = {
  "24h": "24 horas",
  "48h": "48 horas",
  "72h": "72 horas",
};

function generateHourlyData(
  range: TimeRange,
  selectedMesa: string | null,
  occurrences: Occurrence[],
): TimeRow[] {
  const hours =
    range === "24h" ? 24 : range === "48h" ? 48 : 72;

  const now = new Date();
  const start = new Date(
    now.getTime() - hours * 3600000,
  );

  const filtered = occurrences.filter((o) => {
    const inRange = o.timestamp >= start.getTime();
    const mesaMatch =
      !selectedMesa || o.table === selectedMesa;

    return inRange && mesaMatch;
  });

  const base: Record<string, TimeRow> = {};

  for (let i = 0; i < hours; i++) {
    const d = new Date(
      start.getTime() + i * 3600000,
    );

    const key = `${String(d.getHours()).padStart(
      2,
      "0",
    )}:00`;

    base[key] = {
      hour: key,
      baixa: 0,
      media: 0,
      alta: 0,
      critica: 0,
      total: 0,
    };
  }

  filtered.forEach((o) => {
    const d = new Date(o.timestamp);
    const hourKey = `${String(
      d.getHours(),
    ).padStart(2, "0")}:00`;

    if (!base[hourKey]) return;

    base[hourKey][o.criticality]++;
    base[hourKey].total++;
  });

  return Object.values(base);
}

export function OperationsChart() {
  const [timeRange, setTimeRange] =
    useState<TimeRange>("24h");
  const [chartType, setChartType] =
    useState<ChartType>("bars");
  const [selectedMesa, setSelectedMesa] =
    useState<string | null>(null);

  const [visible, setVisible] = useState<
    Record<PriorityKey, boolean>
  >({
    baixa: true,
    media: true,
    alta: true,
    critica: true,
  });

  const occurrencesState = useSupervisorStore((state) => state.occurrences);

  const data = useMemo(
    () => generateHourlyData(timeRange, selectedMesa, occurrencesState),
    [timeRange, selectedMesa, occurrencesState],
  );

  const togglePriority = (k: PriorityKey) => {
    setVisible((prev) => {
      const next = { ...prev, [k]: !prev[k] };
      return Object.values(next).some(Boolean)
        ? next
        : prev;
    });
  };

  const subtitle = `Por horas · ${
    selectedMesa ?? "Todas as mesas"
  } · Últimas ${timeRangeLabels[timeRange]}`;

  return (
    <div className="bg-theme-panel border border-border-primary rounded-lg p-5">
      {/* Header */}
      <div className="flex items-start justify-between mb-4 gap-4">
        <div>
          <h3 className="font-semibold text-text-primary">
            Monitoramento de Ocorrências (COI)
          </h3>
          <p className="text-xs text-text-muted mt-0.5">
            {subtitle}
          </p>
        </div>

        <div className="flex items-center gap-1 bg-bg-secondary rounded-lg p-1">
          {(["24h", "48h", "72h"] as TimeRange[]).map(
            (range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={
                  timeRange === range
                    ? "px-3 py-1 text-xs font-medium rounded-md bg-accent-primary text-white"
                    : "px-3 py-1 text-xs font-medium rounded-md text-text-muted hover:text-text-primary"
                }
              >
                {range}
              </button>
            ),
          )}
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
        <select
          value={selectedMesa ?? ""}
          onChange={(e) =>
            setSelectedMesa(e.target.value || null)
          }
          className="px-2 py-1.5 text-xs rounded-md bg-bg-secondary border border-border-primary text-text-primary focus:outline-none"
        >
          <option value="">Todas as mesas</option>
          {MESAS.map((m) => (
            <option key={m} value={m}>
              {m}
            </option>
          ))}
        </select>

        <div className="flex gap-2">
          {(["bars", "line"] as ChartType[]).map((t) => (
            <button
              key={t}
              onClick={() => setChartType(t)}
              className={
                chartType === t
                  ? "px-3 py-1.5 text-xs font-medium rounded-md border bg-accent-primary/15 border-accent-primary text-accent-primary"
                  : "px-3 py-1.5 text-xs font-medium rounded-md border border-border-primary text-text-muted hover:text-text-primary"
              }
            >
              {t === "bars" ? "Barras" : "Linha"}
            </button>
          ))}
        </div>

        <div className="flex gap-2 flex-wrap">
          {(Object.keys(PRIORITY_LABEL) as PriorityKey[]).map(
            (k) => (
              <button
                key={k}
                onClick={() => togglePriority(k)}
                className={
                  visible[k]
                    ? "px-3 py-1.5 text-xs font-medium rounded-md border border-accent-primary/40 bg-accent-primary/10 text-text-primary flex items-center gap-2"
                    : "px-3 py-1.5 text-xs font-medium rounded-md border border-border-primary text-text-muted hover:text-text-primary flex items-center gap-2"
                }
              >
                <span
                  className={
                    visible[k]
                      ? "w-2.5 h-2.5 rounded"
                      : "w-2.5 h-2.5 rounded opacity-40"
                  }
                  style={{
                    backgroundColor: PRIORITY_COLOR[k],
                  }}
                />
                {PRIORITY_LABEL[k]}
              </button>
            ),
          )}
        </div>
      </div>

      {/* Chart */}
      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          {chartType === "line" ? (
            <LineChart data={data}>
              <CartesianGrid
                stroke="var(--border-secondary)"
                strokeDasharray="3 3"
              />
              <XAxis
                dataKey="hour"
                fontSize={11}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                fontSize={11}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip />

              {visible.baixa && (
                <Line
                  dataKey="baixa"
                  stroke={PRIORITY_COLOR.baixa}
                  dot={false}
                />
              )}
              {visible.media && (
                <Line
                  dataKey="media"
                  stroke={PRIORITY_COLOR.media}
                  dot={false}
                />
              )}
              {visible.alta && (
                <Line
                  dataKey="alta"
                  stroke={PRIORITY_COLOR.alta}
                  dot={false}
                />
              )}
              {visible.critica && (
                <Line
                  dataKey="critica"
                  stroke={PRIORITY_COLOR.critica}
                  dot={false}
                />
              )}
            </LineChart>
          ) : (
            <BarChart data={data}>
              <CartesianGrid
                stroke="var(--border-secondary)"
                strokeDasharray="3 3"
              />
              <XAxis
                dataKey="hour"
                fontSize={11}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                fontSize={11}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip />

              {visible.baixa && (
                <Bar
                  dataKey="baixa"
                  stackId="a"
                  fill={PRIORITY_COLOR.baixa}
                />
              )}
              {visible.media && (
                <Bar
                  dataKey="media"
                  stackId="a"
                  fill={PRIORITY_COLOR.media}
                />
              )}
              {visible.alta && (
                <Bar
                  dataKey="alta"
                  stackId="a"
                  fill={PRIORITY_COLOR.alta}
                />
              )}
              {visible.critica && (
                <Bar
                  dataKey="critica"
                  stackId="a"
                  fill={PRIORITY_COLOR.critica}
                  radius={[4, 4, 0, 0]}
                />
              )}
            </BarChart>
          )}
        </ResponsiveContainer>
      </div>

      <p className="text-xs text-text-muted text-center mt-3">
        Dica: desligue prioridades para isolar padrões.
      </p>
    </div>
  );
}