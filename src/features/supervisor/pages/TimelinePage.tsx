import { useState } from "react";
import {
  Calendar,
  Filter,
  Clock,
  User,
  Tag,
  Activity,
  Image,
  Video,
  Paperclip,
  FileText,
  AlertCircle,
  CheckCircle2,
  ArrowRight,
  Search,
  X,
  ArrowUpDown,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  OCCURRENCES,
} from "../mocks/mocks.ts";
import type { OccurrenceCriticality, OccurrenceStatus } from "../types/index.ts";
// import { OccurrenceDetailsModal } from "../components/OccurrenceDetailsModal";

const criticalityConfig = {
  critica: {
    label: "CRÍTICA",
    color:
      "bg-red-500/10 border-red-500/30 dark:bg-red-500/20 dark:border-red-500/50",
    badgeColor: "bg-red-500",
  },
  alta: {
    label: "ALTA",
    color:
      "bg-orange-500/10 border-orange-500/30 dark:bg-orange-500/20 dark:border-orange-500/50",
    badgeColor: "bg-orange-500",
  },
  media: {
    label: "MÉDIA",
    color:
      "bg-yellow-500/10 border-yellow-500/30 dark:bg-yellow-500/20 dark:border-yellow-500/50",
    badgeColor: "bg-yellow-500",
  },
  baixa: {
    label: "BAIXA",
    color:
      "bg-blue-500/10 border-blue-500/30 dark:bg-blue-500/20 dark:border-blue-500/50",
    badgeColor: "bg-blue-500",
  },
};
const statusConfig = {
  aberta: {
    label: "ABERTA",
    icon: AlertCircle,
    color: "text-red-500",
  },
  em_andamento: {
    label: "EM ANDAMENTO",
    icon: Activity,
    color: "text-yellow-500",
  },
  resolvida: {
    label: "RESOLVIDA",
    icon: CheckCircle2,
    color: "text-green-500",
  },
  transferida: {
    label: "TRANSFERIDA",
    icon: ArrowRight,
    color: "text-blue-500",
  },
};
export function TimelinePage() {
  const [filtroStatus, setFiltroStatus] = useState<OccurrenceStatus | "todos">(
    "todos",
  );
  const [filtroCriticidade, setFiltroCriticidade] = useState<
    OccurrenceCriticality | "todos"
  >("todos");
  const [filtroMesa, setFiltroMesa] = useState("todos");
  const [buscaTexto, setBuscaTexto] = useState("");
  const [ordenacao, setOrdenacao] = useState<"recente" | "antiga">("recente");
  // const [selectedOccurrence, setSelectedOccurrence] =
  // useState<Occurrence | null>(null);

  // Filtrar ocorrências
  let occurrencesFiltradas = OCCURRENCES.filter((ocr) => {
    const matchStatus = filtroStatus === "todos" || ocr.status === filtroStatus;
    const matchCriticidade =
      filtroCriticidade === "todos" || ocr.criticality === filtroCriticidade;
    const matchMesa = filtroMesa === "todos" || ocr.table === filtroMesa;
    const matchBusca =
      buscaTexto === "" ||
      ocr.title.toLowerCase().includes(buscaTexto.toLowerCase()) ||
      ocr.description.toLowerCase().includes(buscaTexto.toLowerCase()) ||
      ocr.id.toLowerCase().includes(buscaTexto.toLowerCase());

    return matchStatus && matchCriticidade && matchMesa && matchBusca;
  });

  // Ordenar
  occurrencesFiltradas = occurrencesFiltradas.sort((a, b) => {
    if (ordenacao === "recente") {
      return b.timestamp - a.timestamp;
    } else {
      return a.timestamp - b.timestamp;
    }
  });

  // Extrair tables únicas
  const tablesUnicas = Array.from(
    new Set(OCCURRENCES.map((o) => o.table)),
  ).sort();

  const limparFiltros = () => {
    setFiltroStatus("todos");
    setFiltroCriticidade("todos");
    setFiltroMesa("todos");
    setBuscaTexto("");
  };

  const temFiltrosAtivos =
    filtroStatus !== "todos" ||
    filtroCriticidade !== "todos" ||
    filtroMesa !== "todos" ||
    buscaTexto !== "";

  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-bg-primary">
      <div className="p-6 space-y-6">
        {/* Barra de Filtros */}
        <div className="bg-theme-panel border border-border-primary rounded-lg p-4 space-y-4">
          {/* Busca */}
          <div className="flex items-center gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
              <input
                type="text"
                placeholder="Buscar por ID, título ou descrição..."
                value={buscaTexto}
                onChange={(e) => setBuscaTexto(e.target.value)}
                className="w-full pl-10 pr-10 py-2 bg-bg-secondary border border-border-primary rounded-lg text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-accent-primary"
              />
              {buscaTexto && (
                <button
                  onClick={() => setBuscaTexto("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
            <button
              onClick={() =>
                setOrdenacao(ordenacao === "recente" ? "antiga" : "recente")
              }
              className="px-4 py-2 bg-bg-secondary border border-border-primary rounded-lg text-text-primary hover:bg-bg-secondary/80 transition-colors flex items-center gap-2"
            >
              <ArrowUpDown className="w-4 h-4" />
              {ordenacao === "recente" ? "Mais recente" : "Mais antiga"}
            </button>
          </div>

          {/* Filtros */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-text-muted" />
              <span className="text-sm font-medium text-text-primary">
                Filtros:
              </span>
            </div>

            {/* Status */}
            <select
              value={filtroStatus}
              onChange={(e) =>
                setFiltroStatus(e.target.value as OccurrenceStatus | "todos")
              }
              className="px-3 py-1.5 bg-bg-secondary border border-border-primary rounded-lg text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-primary"
            >
              <option value="todos">Todos status</option>
              <option value="aberta">Aberta</option>
              <option value="em_andamento">Em Andamento</option>
              <option value="resolvida">Resolvida</option>
              <option value="transferida">Transferida</option>
            </select>

            {/* Criticidade */}
            <select
              value={filtroCriticidade}
              onChange={(e) =>
                setFiltroCriticidade(
                  e.target.value as OccurrenceCriticality | "todos",
                )
              }
              className="px-3 py-1.5 bg-bg-secondary border border-border-primary rounded-lg text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-primary"
            >
              <option value="todos">Todas criticidades</option>
              <option value="critica">Crítica</option>
              <option value="alta">Alta</option>
              <option value="media">Média</option>
              <option value="baixa">Baixa</option>
            </select>

            {/* Mesa */}
            <select
              value={filtroMesa}
              onChange={(e) => setFiltroMesa(e.target.value)}
              className="px-3 py-1.5 bg-bg-secondary border border-border-primary rounded-lg text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-primary"
            >
              <option value="todos">Todas mesas</option>
              {tablesUnicas.map((table) => (
                <option key={table} value={table}>
                  {table}
                </option>
              ))}
            </select>

            {temFiltrosAtivos && (
              <button
                onClick={limparFiltros}
                className="px-3 py-1.5 bg-destructive/10 text-destructive border border-destructive/30 rounded-lg text-sm font-medium hover:bg-destructive/20 transition-colors flex items-center gap-2"
              >
                <X className="w-3 h-3" />
                Limpar filtros
              </button>
            )}

            <div className="ml-auto text-sm text-text-muted">
              {occurrencesFiltradas.length} ocorrência
              {occurrencesFiltradas.length !== 1 ? "s" : ""}
            </div>
          </div>
        </div>

        {/* Timeline */}
        <div className="space-y-4">
          {occurrencesFiltradas.length > 0 ? (
            occurrencesFiltradas.map((occurrence, index) => {
              const criticality = criticalityConfig[occurrence.criticality];
              const status = statusConfig[occurrence.status];
              const StatusIcon = status.icon;

              return (
                <div key={occurrence.id} className="relative">
                  {/* Linha conectora */}
                  {index < occurrencesFiltradas.length - 1 && (
                    <div className="absolute left-[29px] top-[60px] w-0.5 h-[calc(100%+16px)] bg-border-primary" />
                  )}

                  {/* Card */}
                  <div
                    onClick={() => navigate(`/occurrences/${occurrence.id}`)}
                    className={` 
                    border-l-4
                    ${criticality.color}
                    cursor-pointer
                    rounded-lg
                    p-5
                    `}
                  >
                    {/* Timeline dot */}
                    <div
                      className={`absolute -left-[13px] top-6 w-6 h-6 rounded-full ${criticality.badgeColor.split(" ")[0]} border-4 border-bg-primary`}
                    />

                    {/* Header */}
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span
                            className="
    px-2 py-0.5 rounded
    text-xs font-mono font-bold
    bg-theme-panel
    text-theme-muted
    border border-theme-border
  "
                          >
                            {occurrence.id}
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded text-xs font-bold ${criticality.badgeColor}`}
                          >
                            {criticality.label}
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded text-xs font-medium bg-bg-secondary ${status.color} border border-current`}
                          >
                            <StatusIcon className="w-3 h-3 inline mr-1" />
                            {status.label}
                          </span>
                        </div>
                        <h3 className="text-base font-bold text-theme-main mb-1">
                          {occurrence.title}
                        </h3>
                        <p className="text-sm text-theme-muted">
                          {occurrence.description}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="text-xs text-text-muted flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {occurrence.dateTime}
                        </div>
                      </div>
                    </div>

                    {/* Detalhes */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-3 text-sm">
                      <div>
                        <div className="text-theme-main text-sm font-medium mb-0.5">
                          Operador
                        </div>
                        <div className="text-theme-muted text-xs flex items-center gap-1">
                          <User className="w-3 h-3" />
                          {occurrence.operator}
                        </div>
                      </div>
                      <div>
                        <div className="text-theme-main text-sm font-medium mb-0.5">
                          Perfil
                        </div>
                        <div className="text-theme-muted text-xs flex items-center gap-1">
                          {occurrence.profile}
                        </div>
                      </div>
                      <div>
                        <div className="text-theme-main text-sm font-medium mb-0.5">
                          Mesa
                        </div>
                        <div className="text-theme-muted text-xs flex items-center gap-1">
                          {occurrence.table}
                        </div>
                      </div>
                      <div>
                        <div className="text-theme-main text-sm font-medium mb-0.5">
                          Categoria
                        </div>
                        <div className="text-theme-muted text-xs flex items-center gap-1">
                          <Tag className="w-3 h-3" />
                          {occurrence.category}
                        </div>
                      </div>
                    </div>

                    {/* Informações Técnicas */}
                    {/* <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-3 text-sm bg-bg-secondary rounded-lg p-3">
                      <div>
                        <div className="text-text-muted text-xs mb-0.5"> */}
                    {/* Subestação */}
                    {/* </div>
                        <div className="text-text-muted text-xs mb-0.5">
                          Categoria
                        </div>
                        <div className="text-text-primary font-mono text-xs">
                          {occurrence.category}
                        </div>
                      </div>
                      <div>
                        <div className="text-text-muted text-xs mb-0.5">
                          Alimentador
                        </div>
                        <div className="text-text-primary font-mono text-xs">
                          {occurrence.feeder}
                        </div>
                    </div> */}
                    {/* {occurrence.resolutionTime && (
                        <div>
                          <div className="text-text-muted text-xs mb-0.5">
                            Tempo Resolução
                          </div>
                          <div className="text-success font-medium">
                            {occurrence.resolutionTime} min
                          </div>
                        </div>
                      )} */}
                    {/* {occurrence.affectedConsumers && (
                        <div>
                          <div className="text-text-muted text-xs mb-0.5">
                            Consumidores
                          </div>
                          <div className="text-warning font-medium">
                            {occurrence.affectedConsumers.toLocaleString()}
                          </div>
                        </div>
                      )}
                    </div> */}

                    {/* Anexos */}
                    {occurrence.attachments && (
                      <div className="flex items-center gap-3 text-xs">
                        <span className="text-theme-main">Anexos:</span>
                        <div className="flex items-center gap-2">
                          {occurrence.attachments.photo && (
                            <span className="flex items-center gap-1 px-2 py-1 bg-bg-secondary rounded text-theme-muted">
                              <Image className="w-3 h-3" />
                              Foto
                            </span>
                          )}
                          {occurrence.attachments.video && (
                            <span className="flex items-center gap-1 px-2 py-1 bg-bg-secondary rounded text-theme-muted">
                              <Video className="w-3 h-3" />
                              Vídeo
                            </span>
                          )}
                          {occurrence.attachments.document && (
                            <span className="flex items-center gap-1 px-2 py-1 bg-bg-secondary rounded text-theme-muted">
                              <FileText className="w-3 h-3" />
                              Documento
                            </span>
                          )}
                          {occurrence.attachments.protocol && (
                            <span className="flex items-center gap-1 px-2 py-1 bg-bg-secondary rounded text-theme-muted">
                              <Paperclip className="w-3 h-3" />
                              Protocolo
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          ) : (
            <div className="bg-bg-card border border-border-primary rounded-lg p-12 text-center">
              <Calendar className="w-16 h-16 text-text-muted mx-auto mb-4 opacity-50" />
              <p className="text-text-muted text-lg">
                Nenhuma ocorrência encontrada
              </p>
              <p className="text-text-muted text-sm mt-2">
                Ajuste os filtros para visualizar outras ocorrências
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Modal de Detalhes da Ocorrência */}
      {/* {selectedOccurrence && (
        <OccurrenceDetailsModal
          occurrence={selectedOccurrence}
          onClose={() => setSelectedOccurrence(null)}
        />
      )} */}
    </div>
  );
}
