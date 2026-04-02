import { Zap } from "lucide-react";
import type { Occurrence } from "../types/index";

interface Props {
  occurrence: Occurrence;
}

export function OccurrenceTechnicalInfo({ occurrence }: Props) {
  return (
    <div className="bg-slate-50 dark:bg-slate-800/40 rounded-xl p-4">

      <h3 className="text-sm font-semibold mb-4 flex items-center gap-2 text-slate-700 dark:text-slate-300">

        <Zap className="w-4 h-4 text-yellow-500" />

        Informações Técnicas

      </h3>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">

        <TechItem label="Subestação" value={occurrence.substation} />

        <TechItem label="Alimentador" value={occurrence.feeder} />

        {occurrence.resolutionTime && (
          <TechItem
            label="Tempo de Resolução"
            value={`${occurrence.resolutionTime} minutos`}
            highlight="emerald"
          />
        )}

      </div>

    </div>
  );
}

function TechItem({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string;
  highlight?: "emerald";
}) {
  return (
    <div>

      <div className="text-xs text-slate-500 mb-1">
        {label}
      </div>

      <div
        className={`text-sm font-mono font-semibold ${
          highlight === "emerald"
            ? "text-emerald-500"
            : "text-slate-900 dark:text-white"
        }`}
      >
        {value}
      </div>

    </div>
  );
}