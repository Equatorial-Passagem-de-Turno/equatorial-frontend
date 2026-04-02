// ========================
// UTILITY FUNCTIONS
// ========================

import type {
  OperatorStatus,
  Operator,
  OccurrenceSeverity,
  OccurrenceStatus,
  OccurrenceType,
} from "../types/index.ts";

import {
  OCCURRENCE_SEVERITY_COLORS,
  OCCURRENCE_STATUS_COLORS,
  OCCURRENCE_STATUS_LABELS,
  OCCURRENCE_SEVERITY_LABELS,
  OCCURRENCE_TYPE_LABELS,
} from "../constants";

// ========================
// COLOR HELPERS
// ========================

export const getOccurrenceSeverityColor = (
  severity: OccurrenceSeverity
) => {
  return OCCURRENCE_SEVERITY_COLORS[severity];
};

export const getOccurrenceStatusColor = (
  status: OccurrenceStatus
) => {
  return OCCURRENCE_STATUS_COLORS[status];
};

// ========================
// LABEL HELPERS
// ========================

export const getOccurrenceStatusLabel = (
  status: OccurrenceStatus
) => {
  return OCCURRENCE_STATUS_LABELS[status];
};

export const getOccurrenceSeverityLabel = (
  severity: OccurrenceSeverity
) => {
  return OCCURRENCE_SEVERITY_LABELS[severity];
};

export const getOccurrenceTypeLabel = (
  type: OccurrenceType
) => {
  return OCCURRENCE_TYPE_LABELS[type];
};

// ========================
// FILTER HELPERS
// ========================

export const isOperatorActive = (status: OperatorStatus): boolean => {
  return status === "Ativo" || status === "Pausa";
};

export const filterActiveOperators = (
  operators: Operator[]
): Operator[] => {
  return operators.filter((op) => isOperatorActive(op.status));
};

export const filterInactiveOperators = (
  operators: Operator[]
): Operator[] => {
  return operators.filter((op) => op.status === "Inativo");
};

// ========================
// FORMAT HELPERS
// ========================

export const formatTime = (minutes: number): string => {
  if (minutes < 60) {
    return `${minutes}min`;
  }

  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;

  return mins > 0 ? `${hours}h ${mins}min` : `${hours}h`;
};

export const formatPercentage = (value: number): string => {
  return `${value.toFixed(1)}%`;
};

export const getInitials = (name: string): string => {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
};

// ========================
// DATE HELPERS
// ========================

export const formatDateTime = (dateTime: string): string => {
  const date = new Date(dateTime);

  return date.toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export const formatDate = (dateValue: string): string => {
  const date = new Date(dateValue);

  return date.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

// ========================
// ID HELPERS
// ========================

export const generateNewId = (
  ids: string[],
  prefix: string
): string => {
  const maxId = Math.max(
    ...ids.map((id) =>
      parseInt(id.replace(`${prefix}-`, ""))
    )
  );

  return `${prefix}-${String(maxId + 1).padStart(3, "0")}`;
};