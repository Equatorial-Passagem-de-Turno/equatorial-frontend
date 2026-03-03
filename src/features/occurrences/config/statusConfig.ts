import { AlertCircle, Clock, FileSearch, PlayCircle, CheckCircle2 } from 'lucide-react';
import type { StatusConfigItem } from '../types/index';

export const statusConfig: Record<string, StatusConfigItem> = {
  "Aberta": { 
    label: "Aberta", 
    color: "text-slate-600 dark:text-slate-300", 
    bg: "bg-slate-100 dark:bg-slate-800",
    border: "border-slate-200 dark:border-slate-700",
    icon: AlertCircle 
  },
  "Pendente": { 
    label: "Pendente", 
    color: "text-amber-600 dark:text-amber-400", 
    bg: "bg-amber-50 dark:bg-amber-900/30", 
    border: "border-amber-200 dark:border-amber-700/50",
    icon: Clock 
  },
  "Em Análise": { 
    label: "Em Análise", 
    color: "text-violet-600 dark:text-violet-400", 
    bg: "bg-violet-50 dark:bg-violet-900/30", 
    border: "border-violet-200 dark:border-violet-700/50",
    icon: FileSearch 
  },
  "Em Andamento": { 
    label: "Em Andamento", 
    color: "text-blue-600 dark:text-blue-400", 
    bg: "bg-blue-50 dark:bg-blue-900/30", 
    border: "border-blue-200 dark:border-blue-700/50",
    icon: PlayCircle 
  },
  "Resolvida": { 
    label: "Resolvida", 
    color: "text-emerald-600 dark:text-emerald-400", 
    bg: "bg-emerald-50 dark:bg-emerald-900/30", 
    border: "border-emerald-200 dark:border-emerald-700/50",
    icon: CheckCircle2 
  },
};