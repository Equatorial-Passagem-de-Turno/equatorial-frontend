import {
  Activity,
  History,
  PaperclipIcon,
  Plus,
  UserCog,
  ChartNoAxesCombined,
  MonitorCog ,
  type LucideIcon,
} from "lucide-react";
import { type UserRole } from "../features/auth/types";

export interface NavItem {
  label: string;
  path: string;
  icon: LucideIcon;
  roles?: UserRole[];
}
export const SIDEBAR_ITEMS: NavItem[] = [
  {
    label: "Dashboard",
    path: "/",
    icon: Activity,
    roles: ["bt", "mt", "at", "pre_op", "supervisor"],
  },
  {
    label: "Nova Ocorrência",
    path: "/occurrences/new",
    icon: Plus,
    roles: ["bt", "mt", "at"],
  },
  {
    label: "Controle de Turnos",
    path: "/shifts/control",
    icon: UserCog,
    roles: ["bt", "mt", "at"],
  },
  {
    label: "Histórico Geral",
    path: "/occurrences/my-shift",
    icon: History,
    roles: ["bt", "mt", "at", "pre_op"],
  },
  {
    label: "Turno Anterior",
    path: "/shifts/previous",
    icon: PaperclipIcon,
    roles: ["bt", "mt", "at", "pre_op"],
  },
  {
    label: "Analytics",
    path: "/analytics",
    icon: ChartNoAxesCombined,
    roles: ["supervisor"],
  },
  {
    label: "Gestão",
    path: "/management",
    icon: MonitorCog,
    roles: ["supervisor"],
  },
  {
    label: "Linha do Tempo",
    path: "/timeline",
    icon: History,
    roles: ["supervisor"],
  },
];
