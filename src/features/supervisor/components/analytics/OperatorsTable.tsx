import { useSupervisorStore } from "../../stores/useSupervisorStore";

interface OperatorRow {
  id: string;
  name: string;
  profile: string;
  table: string;
  pendenciasHerdadas: number;
  pendenciasCriadas: number;
  pendenciasResolvidas: number;
}

export function OperatorsTable() {
  const operatorsSource = useSupervisorStore((state) => state.operators);

  const operators: OperatorRow[] = operatorsSource
    .filter((op) => op.status === "Ativo" || op.status === "Pausa")
    .map((op) => {
      return {
        id: op.id,
        name: op.name,
        profile: op.profile,
        table: op.table,
        pendenciasHerdadas: Number(op.inheritedOccurrences ?? 0),
        pendenciasCriadas: Number(op.createdOccurrences ?? 0),
        pendenciasResolvidas: Number(op.resolvedOccurrences ?? 0),
      };
    });

  return (
    <div className="eq-surface overflow-hidden">
      <div className="border-b border-[var(--eq-border)] p-4">
        <h3 className="eq-card-title">
          Turnos Ativos
        </h3>
        <p className="eq-page-subtitle text-xs">
          Status em tempo real dos turnos em andamento
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[var(--eq-border)] bg-[var(--eq-bg-surface-soft)]">
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-[var(--eq-text-muted)]">
                Operador
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-[var(--eq-text-muted)]">
                Perfil
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-[var(--eq-text-muted)]">
                Mesa
              </th>
              <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider text-[var(--eq-text-muted)]">
                Herdadas
              </th>
              <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider text-[var(--eq-text-muted)]">
                Criadas
              </th>
              <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider text-[var(--eq-text-muted)]">
                Resolvidas
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-[var(--eq-border)]">
            {operators.length === 0 && (
              <tr>
                <td className="px-4 py-6 text-center text-sm text-[var(--eq-text-muted)]" colSpan={6}>
                  Nenhum turno ativo encontrado.
                </td>
              </tr>
            )}
            {operators.map((operator) => (
              <tr
                key={operator.id}
                className="transition-colors hover:bg-[var(--eq-bg-surface-soft)]"
              >
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="eq-status-success flex h-8 w-8 items-center justify-center rounded-full">
                      <span className="text-xs font-semibold">
                        {operator.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </span>
                    </div>
                    <span className="text-sm font-medium text-[var(--eq-text-primary)]">
                      {operator.name}
                    </span>
                  </div>
                </td>

                <td className="px-4 py-3">
                  <span className="eq-tone-circuit inline-flex items-center rounded border px-2.5 py-0.5 text-xs font-medium">
                    {operator.profile}
                  </span>
                </td>

                <td className="px-4 py-3">
                  <span className="text-sm text-[var(--eq-text-secondary)]">
                    {operator.table}
                  </span>
                </td>

                <td className="px-4 py-3 text-center">
                  <span className="eq-criticality-high inline-flex h-8 w-8 items-center justify-center rounded-full border text-sm font-semibold">
                    {operator.pendenciasHerdadas}
                  </span>
                </td>

                <td className="px-4 py-3 text-center">
                  <span className="eq-criticality-medium inline-flex h-8 w-8 items-center justify-center rounded-full border text-sm font-semibold">
                    {operator.pendenciasCriadas}
                  </span>
                </td>

                <td className="px-4 py-3 text-center">
                  <span className="eq-status-success inline-flex h-8 w-8 items-center justify-center rounded-full border text-sm font-semibold">
                    {operator.pendenciasResolvidas}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="border-t border-[var(--eq-border)] bg-[var(--eq-bg-surface-soft)] p-3">
        <div className="flex items-center justify-between text-xs">
          <span className="text-[var(--eq-text-secondary)]">
            {operators.length} turnos ativos
          </span>
        </div>
      </div>
    </div>
  );
}
