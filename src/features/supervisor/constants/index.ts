// ========================
// PROJECT CONSTANTS
// ========================

import type {
  OperatorProfile,
  OccurrenceSeverity,
  OccurrenceStatus,
  OccurrenceType,
} from "../types/index.ts";

// ========================
// TABLES (COI Tables)
// ========================

export const TABLES = [
  "MCZ I",
  "MCZ II",
  "DMG / SDI",
  "RLU / SMC",
  "DMG / SDI / PND",
  "LESTE / OESTE",
  "MCZ I / RLU",
  "OUTRAS",
] as const;

// ========================
// OPERATOR PROFILES
// ========================

export const OPERATOR_PROFILES: OperatorProfile[] = [
  "BT",
  "MT",
  "AT",
  "Eng. Pré-Op",
];

// ========================
// PROFILE COLORS
// ========================

export const PROFILE_COLORS: Record<OperatorProfile, string> = {
  BT: "bg-blue-500/20 text-blue-400 border-blue-500/50",
  MT: "bg-purple-500/20 text-purple-400 border-purple-500/50",
  AT: "bg-orange-500/20 text-orange-400 border-orange-500/50",
  "Eng. Pré-Op": "bg-teal-500/20 text-teal-400 border-teal-500/50",
};

export const PROFILE_COLORS_DETAILED: Record<
  OperatorProfile,
  { bg: string; text: string; border: string }
> = {
  BT: {
    bg: "bg-blue-500/20 dark:bg-blue-500/30",
    text: "text-blue-600 dark:text-blue-400",
    border: "border-blue-500/50",
  },
  MT: {
    bg: "bg-purple-500/20 dark:bg-purple-500/30",
    text: "text-purple-600 dark:text-purple-400",
    border: "border-purple-500/50",
  },
  AT: {
    bg: "bg-orange-500/20 dark:bg-orange-500/30",
    text: "text-orange-600 dark:text-orange-400",
    border: "border-orange-500/50",
  },
  "Eng. Pré-Op": {
    bg: "bg-teal-500/20 dark:bg-teal-500/30",
    text: "text-teal-600 dark:text-teal-400",
    border: "border-teal-500/50",
  },
};

// ========================
// OCCURRENCE SEVERITY COLORS
// ========================

export const OCCURRENCE_SEVERITY_COLORS: Record<
  OccurrenceSeverity,
  {
    bg: string;
    text: string;
    border: string;
    badge: string;
  }
> = {
  baixa: {
    bg: "bg-blue-500/10 dark:bg-blue-500/20",
    text: "text-blue-600 dark:text-blue-400",
    border: "border-blue-500/30",
    badge: "bg-blue-500/20 text-blue-400 border-blue-500/50",
  },
  media: {
    bg: "bg-yellow-500/10 dark:bg-yellow-500/20",
    text: "text-yellow-600 dark:text-yellow-400",
    border: "border-yellow-500/30",
    badge: "bg-yellow-500/20 text-yellow-400 border-yellow-500/50",
  },
  alta: {
    bg: "bg-orange-500/10 dark:bg-orange-500/20",
    text: "text-orange-600 dark:text-orange-400",
    border: "border-orange-500/30",
    badge: "bg-orange-500/20 text-orange-400 border-orange-500/50",
  },
  critica: {
    bg: "bg-red-500/10 dark:bg-red-500/20",
    text: "text-red-600 dark:text-red-400",
    border: "border-red-500/30",
    badge: "bg-red-500/20 text-red-400 border-red-500/50",
  },
};

// ========================
// OCCURRENCE STATUS COLORS
// ========================

export const OCCURRENCE_STATUS_COLORS: Record<
  OccurrenceStatus,
  {
    bg: string;
    text: string;
    badge: string;
  }
> = {
  aberta: {
    bg: "eq-status-open",
    text: "text-slate-700 dark:text-slate-300",
    badge: "eq-status-open border",
  },
  em_andamento: {
    bg: "eq-status-progress",
    text: "text-blue-700 dark:text-blue-400",
    badge: "eq-status-progress border",
  },
  resolvida: {
    bg: "eq-status-success",
    text: "text-emerald-700 dark:text-emerald-400",
    badge: "eq-status-success border",
  },
  transferida: {
    bg: "eq-status-transfer",
    text: "text-violet-700 dark:text-violet-400",
    badge: "eq-status-transfer border",
  },
};

// ========================
// LABELS (UI TEXT IN PT-BR)
// ========================

export const OCCURRENCE_STATUS_LABELS: Record<
  OccurrenceStatus,
  string
> = {
  aberta: "Aberta",
  em_andamento: "Em Andamento",
  resolvida: "Resolvida",
  transferida: "Transferida",
};

export const OCCURRENCE_SEVERITY_LABELS: Record<
  OccurrenceSeverity,
  string
> = {
  baixa: "Baixa",
  media: "Média",
  alta: "Alta",
  critica: "Crítica",
};

export const OCCURRENCE_TYPE_LABELS: Record<
  OccurrenceType,
  string
> = {
  falha: "Falha de Equipamento",
  manutencao: "Manutenção Preventiva",
  sobrecarga: "Sobrecarga no Sistema",
  emergencia: "Emergência Operacional",
};
