import {
  Clock,
  User,
  MapPin,
  Activity,
  // Zap,
  Users,
} from "lucide-react";

import type { Occurrence } from "../types/index";
import { OccurrenceInfoCard } from "./OccurrenceInfoCard";
import { OccurrenceTechnicalInfo } from "./OccurrenceTechnicalInfo";

interface Props {
  occurrence: Occurrence;
}

export function OccurrenceDetails({ occurrence }: Props) {
  return (
    <div className="bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm p-8 space-y-6">

      {/* Informações principais */}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">

        <OccurrenceInfoCard
          icon={<Clock className="w-4 h-4" />}
          label="Data/Hora"
          value={occurrence.dateTime}
        />

        <OccurrenceInfoCard
          icon={<User className="w-4 h-4" />}
          label="Operador"
          value={occurrence.operator}
          subtitle={occurrence.profile}
        />

        <OccurrenceInfoCard
          icon={<Activity className="w-4 h-4" />}
          label="Mesa"
          value={occurrence.table}
          highlight="emerald"
        />

        <OccurrenceInfoCard
          icon={<MapPin className="w-4 h-4" />}
          label="Base Geográfica"
          value={occurrence.geographicBase}
        />

      </div>

      {/* Informações técnicas */}

      <OccurrenceTechnicalInfo occurrence={occurrence} />

      {/* Consumidores afetados */}

      {occurrence.affectedConsumers && (
        <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4 flex items-center gap-3">

          <Users className="w-5 h-5 text-yellow-500" />

          <span className="text-sm text-slate-900 dark:text-white">
            <span className="font-semibold text-yellow-500">
              {occurrence.affectedConsumers.toLocaleString()}
            </span>{" "}
            consumidores afetados
          </span>

        </div>
      )}

    </div>
  );
}