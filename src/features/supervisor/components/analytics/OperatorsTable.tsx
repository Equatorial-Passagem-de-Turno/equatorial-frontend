import {
  OPERATORS,
  OCCURRENCES,
} from "@/features/supervisor/mocks/mocks";

interface OperatorRow {
  id: string;
  name: string;
  profile: string;
  table: string;
  pendenciasHerdadas: number;
  pendenciasCriadas: number;
  pendenciasResolvidas: number;
}

// 🔥 Agora usando OCCURRENCES direto
const operators: OperatorRow[] = OPERATORS
  .filter((op) => op.status === "Ativo" || op.status === "Pausa")
  .map((op) => {
    const ocorrencias = OCCURRENCES.filter(
      (o) => o.operatorId === op.id
    );

    const resolvidas = ocorrencias.filter(
      (o) => o.status === "resolvida"
    ).length;

    const abertas = ocorrencias.filter(
      (o) => o.status === "aberta" || o.status === "em_andamento"
    ).length;

    return {
      id: op.id,
      name: op.name,
      profile: op.profile,
      table: op.table,
      pendenciasHerdadas: Math.floor(abertas * 0.6),
      pendenciasCriadas: Math.floor(abertas * 0.4),
      pendenciasResolvidas: resolvidas,
    };
  });

export function OperatorsTable() {
  return (
    <div className="bg-white dark:bg-[#1e293b]/50 rounded-lg border border-zinc-200 dark:border-[#334155] overflow-hidden">
      <div className="p-4 border-b border-zinc-200 dark:border-[#334155]">
        <h3 className="font-semibold text-zinc-900 dark:text-white">
          Operadores Ativos
        </h3>
        <p className="text-xs text-zinc-500 dark:text-[#94a3b8]">
          Status em tempo real dos operadores
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-zinc-50 dark:bg-[#0f172a]/50 border-b border-zinc-200 dark:border-[#334155]">
              <th className="px-4 py-3 text-left text-xs font-semibold text-zinc-600 dark:text-[#94a3b8] uppercase tracking-wider">
                Operador
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-zinc-600 dark:text-[#94a3b8] uppercase tracking-wider">
                Perfil
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-zinc-600 dark:text-[#94a3b8] uppercase tracking-wider">
                Mesa
              </th>
              <th className="px-4 py-3 text-center text-xs font-semibold text-zinc-600 dark:text-[#94a3b8] uppercase tracking-wider">
                Herdadas
              </th>
              <th className="px-4 py-3 text-center text-xs font-semibold text-zinc-600 dark:text-[#94a3b8] uppercase tracking-wider">
                Criadas
              </th>
              <th className="px-4 py-3 text-center text-xs font-semibold text-zinc-600 dark:text-[#94a3b8] uppercase tracking-wider">
                Resolvidas
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-zinc-200 dark:divide-[#334155]">
            {operators.map((operator) => (
              <tr
                key={operator.id}
                className="hover:bg-zinc-50 dark:hover:bg-[#1e293b] transition-colors"
              >
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-[#10b981]/20 dark:bg-[#10b981]/30 flex items-center justify-center">
                      <span className="text-xs font-semibold text-[#10b981]">
                        {operator.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </span>
                    </div>
                    <span className="text-sm font-medium text-zinc-900 dark:text-white">
                      {operator.name}
                    </span>
                  </div>
                </td>

                <td className="px-4 py-3">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded text-xs font-medium bg-blue-100 dark:bg-blue-500/20 text-blue-800 dark:text-blue-400 border border-blue-200 dark:border-blue-500/30">
                    {operator.profile}
                  </span>
                </td>

                <td className="px-4 py-3">
                  <span className="text-sm text-zinc-700 dark:text-[#94a3b8]">
                    {operator.table}
                  </span>
                </td>

                <td className="px-4 py-3 text-center">
                  <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-orange-100 dark:bg-orange-500/20 text-orange-800 dark:text-orange-400 text-sm font-semibold border border-orange-200 dark:border-orange-500/30">
                    {operator.pendenciasHerdadas}
                  </span>
                </td>

                <td className="px-4 py-3 text-center">
                  <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-yellow-100 dark:bg-yellow-500/20 text-yellow-800 dark:text-yellow-400 text-sm font-semibold border border-yellow-200 dark:border-yellow-500/30">
                    {operator.pendenciasCriadas}
                  </span>
                </td>

                <td className="px-4 py-3 text-center">
                  <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-green-100 dark:bg-green-500/20 text-green-800 dark:text-green-400 text-sm font-semibold border border-green-200 dark:border-green-500/30">
                    {operator.pendenciasResolvidas}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="p-3 border-t border-zinc-200 dark:border-[#334155] bg-zinc-50 dark:bg-[#0f172a]/50">
        <div className="flex items-center justify-between text-xs">
          <span className="text-zinc-600 dark:text-[#94a3b8]">
            {operators.length} operadores ativos
          </span>
        </div>
      </div>
    </div>
  );
}