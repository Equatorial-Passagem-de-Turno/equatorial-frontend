import { AlertCircle, ArrowRightLeft, Clock, FileSearch, PlayCircle, CheckCircle2 } from 'lucide-react';
import type { StatusConfigItem } from '../types/index';

export const statusConfig: Record<string, StatusConfigItem> = {
  "Aberta": {
    label: "Aberta",
    color: "text-slate-700 dark:text-slate-300",
    bg: "eq-status-open",
    border: "border-slate-200 dark:border-slate-700",
    icon: AlertCircle,
  },
  "Pendente": {
    label: "Pendente",
    color: "text-amber-700 dark:text-amber-400",
    bg: "eq-status-warning",
    border: "border-amber-200 dark:border-amber-800",
    icon: Clock,
  },
  "Em Análise": {
    label: "Em Análise",
    color: "text-violet-700 dark:text-violet-400",
    bg: "eq-status-analysis",
    border: "border-violet-200 dark:border-violet-800",
    icon: FileSearch,
  },
  "Em Andamento": {
    label: "Em Andamento",
    color: "text-blue-700 dark:text-blue-400",
    bg: "eq-status-progress",
    border: "border-blue-200 dark:border-blue-800",
    icon: PlayCircle,
  },
  "Resolvida": {
    label: "Resolvida",
    color: "text-emerald-700 dark:text-emerald-400",
    bg: "eq-status-success",
    border: "border-emerald-200 dark:border-emerald-800",
    icon: CheckCircle2,
  },
  "Transferida": {
    label: "Transferida",
    color: "text-violet-700 dark:text-violet-400",
    bg: "eq-status-transfer",
    border: "border-violet-200 dark:border-violet-800",
    icon: ArrowRightLeft,
  },
};