import type { ReactNode } from "react";

interface Props {
  icon: ReactNode;
  label: string;
  value: string | number;
  subtitle?: string;
  highlight?: "emerald" | "none";
}

export function OccurrenceInfoCard({
  icon,
  label,
  value,
  subtitle,
  highlight = "none",
}: Props) {
  return (
    <div className="bg-slate-50 dark:bg-slate-800/40 rounded-xl p-4">

      <div className="flex items-center gap-2 mb-2 text-slate-500 text-xs">

        {icon}
        <span>{label}</span>

      </div>

      <div
        className={`text-sm font-semibold ${
          highlight === "emerald"
            ? "text-emerald-600"
            : "text-slate-900 dark:text-white"
        }`}
      >
        {value}
      </div>

      {subtitle && (
        <div className="text-xs text-slate-500">
          {subtitle}
        </div>
      )}

    </div>
  );
}