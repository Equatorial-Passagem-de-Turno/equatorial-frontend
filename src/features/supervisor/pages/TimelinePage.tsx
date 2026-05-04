import { useEffect, useState } from "react";
import {
  Calendar,
  Filter,
  Clock,
  CircuitBoard,
  User,
  Tag,
  Image,
  Video,
  Paperclip,
  FileText,
  AlertCircle,
  CheckCircle2,
  ArrowRightLeft,
  PlayCircle,
  Search,
  Wrench,
  X,
  ArrowUpDown,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";
import type { OccurrenceCriticality, OccurrenceStatus } from "../types/index.ts";
import { useSupervisorStore } from "../stores/useSupervisorStore";
import type { CircuitSwitchingRecord } from "@/features/circuit-switching/types";
import type { UnavailableEquipmentRecord } from "@/features/unavailable-equipment/types";
// import { OccurrenceDetailsModal } from "../components/OccurrenceDetailsModal";

type TimelineEventType = "occurrence" | "circuit-switching" | "unavailable-equipment";
type TimelineStatusFilter =
  | "todos"
  | OccurrenceStatus
  | "pendente"
  | "em_analise";
type LocalEventRecord = (CircuitSwitchingRecord | UnavailableEquipmentRecord) & {
  eventType: Exclude<TimelineEventType, "occurrence">;
};

const getLocalRecords = <T,>(key: string): T[] => {
  try {
    const raw = localStorage.getItem(key);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const formatDateTime = (value: string) => {
  if (!value) return "--";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "--";

  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(date);
};

const criticalityConfig = {
  critica: {
    label: "CRÍTICA",
    color: "eq-criticality-critical",
    badgeColor: "eq-criticality-bar-critical",
  },
  alta: {
    label: "ALTA",
    color: "eq-criticality-high",
    badgeColor: "eq-criticality-bar-high",
  },
  media: {
    label: "MÉDIA",
    color: "eq-criticality-medium",
    badgeColor: "eq-criticality-bar-medium",
  },
  baixa: {
    label: "BAIXA",
    color: "eq-criticality-low",
    badgeColor: "eq-criticality-bar-low",
  },
};
const statusConfig = {
  aberta: {
    label: "ABERTA",
    icon: AlertCircle,
    color: "text-slate-700 dark:text-slate-300",
    badge: "eq-status-open border",
  },
  pendente: {
    label: "PENDENTE",
    icon: Clock,
    color: "text-amber-700 dark:text-amber-400",
    badge: "eq-status-warning border",
  },
  em_analise: {
    label: "EM ANÁLISE",
    icon: Search,
    color: "text-violet-700 dark:text-violet-400",
    badge: "eq-status-analysis border",
  },
  em_andamento: {
    label: "EM ANDAMENTO",
    icon: PlayCircle,
    color: "text-blue-700 dark:text-blue-400",
    badge: "eq-status-progress border",
  },
  resolvida: {
    label: "RESOLVIDA",
    icon: CheckCircle2,
    color: "text-emerald-700 dark:text-emerald-400",
    badge: "eq-status-success border",
  },
  transferida: {
    label: "TRANSFERIDA",
    icon: ArrowRightLeft,
    color: "text-violet-700 dark:text-violet-400",
    badge: "eq-status-transfer border",
  },
};

const eventTypeConfig = {
  occurrence: {
    label: "Ocorrência",
    pluralLabel: "ocorrência",
    tone: "eq-tone-occurrence",
    card: "eq-card-occurrence",
    bar: "eq-event-bar-occurrence",
    icon: AlertCircle,
  },
  "circuit-switching": {
    label: "Circuito manobrado",
    pluralLabel: "evento",
    tone: "eq-tone-circuit",
    card: "eq-card-circuit",
    bar: "eq-event-bar-circuit",
    icon: CircuitBoard,
  },
  "unavailable-equipment": {
    label: "Equipamento indisponível",
    pluralLabel: "evento",
    tone: "eq-tone-equipment",
    card: "eq-card-equipment",
    bar: "eq-event-bar-equipment",
    icon: Wrench,
  },
} satisfies Record<TimelineEventType, {
  label: string;
  pluralLabel: string;
  tone: string;
  card: string;
  bar: string;
  icon: LucideIcon;
}>;
export function TimelinePage() {
  const loadData = useSupervisorStore((state) => state.loadData);
  const occurrencesState = useSupervisorStore((state) => state.occurrences);
  const isLoading = useSupervisorStore((state) => state.isLoading);
  const loadError = useSupervisorStore((state) => state.loadError);
  const hydratedAt = useSupervisorStore((state) => state.hydratedAt);

  const [filtroStatus, setFiltroStatus] = useState<TimelineStatusFilter>(
    "todos",
  );
  const [filtroTipoEvento, setFiltroTipoEvento] =
    useState<TimelineEventType | "todos">("todos");
  const [filtroCriticidade, setFiltroCriticidade] = useState<
    OccurrenceCriticality | "todos"
  >("todos");
  const [filtroMesa, setFiltroMesa] = useState("todos");
  const [buscaTexto, setBuscaTexto] = useState("");
  const [ordenacao, setOrdenacao] = useState<"recente" | "antiga">("recente");
  const [localEvents, setLocalEvents] = useState<LocalEventRecord[]>([]);
  // const [selectedOccurrence, setSelectedOccurrence] =
  // useState<Occurrence | null>(null);

  useEffect(() => {
    if (!hydratedAt) {
      void loadData();
    }
  }, [hydratedAt, loadData]);

  useEffect(() => {
    const circuits = getLocalRecords<CircuitSwitchingRecord>("circuit_switching_records_v1")
      .map((record) => ({
        ...record,
        eventType: "circuit-switching" as const,
      }));
    const equipments = getLocalRecords<UnavailableEquipmentRecord>("unavailable_equipment_records_v1")
      .map((record) => ({
        ...record,
        eventType: "unavailable-equipment" as const,
      }));

    setLocalEvents([...circuits, ...equipments]);
  }, []);

  useEffect(() => {
    if (filtroTipoEvento !== "occurrence" && filtroCriticidade !== "todos") {
      setFiltroCriticidade("todos");
    }
  }, [filtroCriticidade, filtroTipoEvento]);

  const occurrenceTimelineItems = occurrencesState.map((occurrence) => ({
    eventType: "occurrence" as const,
    status: occurrence.status,
    timestamp: occurrence.timestamp,
    dateTime: occurrence.dateTime,
    searchableText: [
      occurrence.id,
      occurrence.title,
      occurrence.description,
      occurrence.operator,
      occurrence.table,
      occurrence.category,
    ].join(" ").toLowerCase(),
    occurrence,
  }));

  const localTimelineItems = localEvents.map((event) => {
    const equipmentEvent = event as UnavailableEquipmentRecord;
    const isEquipment = event.eventType === "unavailable-equipment";
    const title = isEquipment
      ? (event.description || `${equipmentEvent.equipmentType} ${equipmentEvent.equipmentNumber}`)
      : (event.description || `${event.feeder} - ${event.equipment}`);

    return {
      eventType: event.eventType,
      status: "pendente" as const,
      timestamp: new Date(event.createdAt).getTime(),
      dateTime: formatDateTime(event.createdAt),
      title,
      description: `${event.cause}${event.observations ? ` - ${event.observations}` : ""}`,
      searchableText: [
        event.id,
        title,
        event.feeder,
        event.equipment,
        event.responsibleSector,
        event.cause,
        event.observations,
        event.createdBy,
        equipmentEvent.equipmentNumber,
        equipmentEvent.equipmentType,
      ].filter(Boolean).join(" ").toLowerCase(),
      event,
    };
  });

  let eventosFiltrados = [...occurrenceTimelineItems, ...localTimelineItems].filter((item) => {
    const matchTipo = filtroTipoEvento === "todos" || item.eventType === filtroTipoEvento;
    const matchStatus = filtroStatus === "todos" || item.status === filtroStatus;
    const matchCriticidade =
      item.eventType !== "occurrence" ||
      filtroCriticidade === "todos" ||
      item.occurrence.criticality === filtroCriticidade;
    const matchMesa =
      filtroMesa === "todos" ||
      (item.eventType === "occurrence"
        ? item.occurrence.table === filtroMesa
        : item.event.responsibleSector === filtroMesa);
    const matchBusca =
      buscaTexto === "" ||
      item.searchableText.includes(buscaTexto.toLowerCase());

    return matchTipo && matchStatus && matchCriticidade && matchMesa && matchBusca;
  });

  eventosFiltrados = eventosFiltrados.sort((a, b) => {
    if (ordenacao === "recente") {
      return b.timestamp - a.timestamp;
    }

    return a.timestamp - b.timestamp;
  });

  const tablesUnicas = Array.from(
    new Set([
      ...occurrencesState.map((o) => o.table),
      ...localEvents.map((event) => event.responsibleSector),
    ]),
  ).sort();

  const limparFiltros = () => {
    setFiltroStatus("todos");
    setFiltroTipoEvento("todos");
    setFiltroCriticidade("todos");
    setFiltroMesa("todos");
    setBuscaTexto("");
  };

  const temFiltrosAtivos =
    filtroStatus !== "todos" ||
    filtroTipoEvento !== "todos" ||
    filtroCriticidade !== "todos" ||
    filtroMesa !== "todos" ||
    buscaTexto !== "";

  const navigate = useNavigate();

  if (isLoading && !hydratedAt) {
    return (
      <div className="eq-page-content min-h-screen">
        <div className="eq-surface p-6 eq-page-subtitle">
          Carregando timeline do supervisor...
        </div>
      </div>
    );
  }

  if (loadError && !hydratedAt) {
    return (
      <div className="eq-page-content min-h-screen">
        <div className="rounded-lg border border-red-700/40 bg-red-900/10 p-6 text-red-300">
          {loadError}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--eq-bg-page)]">
      <div className="eq-page-content space-y-6">
        {/* Barra de Filtros */}
        <div className="eq-surface space-y-4 p-4">
          {/* Busca */}
          <div className="flex items-center gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--eq-text-muted)]" />
              <input
                type="text"
                placeholder="Buscar por ID, título ou descrição..."
                value={buscaTexto}
                onChange={(e) => setBuscaTexto(e.target.value)}
                className="eq-control w-full py-2 pl-10 pr-10 placeholder:text-[var(--eq-text-muted)] focus:ring-2 focus:ring-emerald-500/40"
              />
              {buscaTexto && (
                <button
                  onClick={() => setBuscaTexto("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--eq-text-muted)] hover:text-[var(--eq-text-primary)]"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
            <button
              onClick={() =>
                setOrdenacao(ordenacao === "recente" ? "antiga" : "recente")
              }
              className="eq-control flex items-center gap-2 rounded-lg px-4 py-2 transition-colors hover:bg-[var(--eq-bg-surface-soft)]"
            >
              <ArrowUpDown className="w-4 h-4" />
              {ordenacao === "recente" ? "Mais recente" : "Mais antiga"}
            </button>
          </div>

          {/* Filtros */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-[var(--eq-text-muted)]" />
              <span className="text-sm font-medium text-[var(--eq-text-primary)]">
                Filtros:
              </span>
            </div>

            {/* Status */}
            <select
              value={filtroStatus}
              onChange={(e) =>
                setFiltroStatus(e.target.value as TimelineStatusFilter)
              }
              className="eq-control rounded-lg px-3 py-1.5 text-sm focus:ring-2 focus:ring-emerald-500/40"
            >
              <option value="todos">Todos status</option>
              <option value="aberta">Aberta</option>
              <option value="pendente">Pendente</option>
              <option value="em_analise">Em Análise</option>
              <option value="em_andamento">Em Andamento</option>
              <option value="resolvida">Resolvida</option>
              <option value="transferida">Transferida</option>
            </select>

            {/* Tipo de evento */}
            <select
              value={filtroTipoEvento}
              onChange={(e) =>
                setFiltroTipoEvento(e.target.value as TimelineEventType | "todos")
              }
              className="eq-control rounded-lg px-3 py-1.5 text-sm focus:ring-2 focus:ring-emerald-500/40"
            >
              <option value="todos">Todos os eventos</option>
              <option value="occurrence">Ocorrências</option>
              <option value="circuit-switching">Circuitos manobrados</option>
              <option value="unavailable-equipment">Equipamentos indisponíveis</option>
            </select>

            {/* Criticidade */}
            {filtroTipoEvento === "occurrence" && (
            <select
              value={filtroCriticidade}
              onChange={(e) =>
                setFiltroCriticidade(
                  e.target.value as OccurrenceCriticality | "todos",
                )
              }
              className="eq-control rounded-lg px-3 py-1.5 text-sm focus:ring-2 focus:ring-emerald-500/40"
            >
              <option value="todos">Todas criticidades</option>
              <option value="critica">Crítica</option>
              <option value="alta">Alta</option>
              <option value="media">Média</option>
              <option value="baixa">Baixa</option>
            </select>
            )}

            {/* Mesa */}
            <select
              value={filtroMesa}
              onChange={(e) => setFiltroMesa(e.target.value)}
              className="eq-control rounded-lg px-3 py-1.5 text-sm focus:ring-2 focus:ring-emerald-500/40"
            >
              <option value="todos">Todas mesas/setores</option>
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

            <div className="ml-auto text-sm text-[var(--eq-text-muted)]">
              {eventosFiltrados.length} evento
              {eventosFiltrados.length !== 1 ? "s" : ""}
            </div>
          </div>
        </div>

        {/* Timeline */}
        <div className="space-y-4">
          {eventosFiltrados.length > 0 ? (
            eventosFiltrados.map((item, index) => {
              const isOccurrence = item.eventType === "occurrence";
              const eventType = eventTypeConfig[item.eventType];
              const EventTypeIcon = eventType.icon;
              const status = statusConfig[item.status];
              const StatusIcon = status.icon;
              const id = isOccurrence ? item.occurrence.id : item.event.id;
              const title = isOccurrence ? item.occurrence.title : item.title;
              const description = isOccurrence
                ? item.occurrence.description
                : item.description;
              const dateTime = item.dateTime;
              const criticality = isOccurrence
                ? criticalityConfig[item.occurrence.criticality]
                : null;
              const cardTone = isOccurrence
                ? criticality?.color
                : `${eventType.card} ${eventType.tone}`;
              const dotTone = isOccurrence
                ? criticality?.badgeColor
                : eventType.bar;
              const route = isOccurrence
                ? `/occurrences/${item.occurrence.id}`
                : `/${item.eventType}/${encodeURIComponent(item.event.id)}`;
              const details = isOccurrence
                ? [
                    {
                      label: "Operador",
                      value: item.occurrence.operator,
                      icon: User,
                    },
                    {
                      label: "Perfil",
                      value: item.occurrence.profile,
                    },
                    {
                      label: "Mesa",
                      value: item.occurrence.table,
                    },
                    {
                      label: "Categoria",
                      value: item.occurrence.category,
                      icon: Tag,
                    },
                  ]
                : [
                    {
                      label: "Autor",
                      value: item.event.createdBy || "Autor não informado",
                      icon: User,
                    },
                    {
                      label: "Setor responsável",
                      value: item.event.responsibleSector,
                    },
                    {
                      label: "Alimentador",
                      value: item.event.feeder,
                    },
                    {
                      label: "Equipamento",
                      value:
                        item.eventType === "unavailable-equipment"
                          ? `${item.event.equipmentType} ${item.event.equipmentNumber}`
                          : item.event.equipment,
                      icon:
                        item.eventType === "unavailable-equipment"
                          ? Wrench
                          : CircuitBoard,
                    },
                  ];

              return (
                <div key={`${item.eventType}-${id}`} className="relative pl-8">
                  {index < eventosFiltrados.length - 1 && (
                    <div className="absolute left-[11px] top-12 h-[calc(100%-0.5rem)] w-0.5 bg-[var(--eq-border)]" />
                  )}

                  <div
                    onClick={() => navigate(route)}
                    className={`cursor-pointer rounded-lg border-l-4 p-5 ${cardTone}`}
                  >
                    <div
                      className={`group absolute left-0 top-6 z-10 h-6 w-6 rounded-full border-4 border-[var(--eq-bg-page)] ${dotTone}`}
                      tabIndex={0}
                      aria-label={`Data do evento: ${dateTime}`}
                    >
                      <span className="pointer-events-none absolute left-7 top-1/2 z-20 -translate-y-1/2 whitespace-nowrap rounded-md border border-[var(--eq-border)] bg-[var(--eq-bg-surface)] px-2 py-1 text-xs font-medium text-[var(--eq-text-primary)] opacity-0 shadow-lg transition-opacity group-hover:opacity-100 group-focus:opacity-100">
                        {dateTime}
                      </span>
                    </div>

                    <div className="mb-3 flex items-start justify-between">
                      <div className="flex-1">
                        <div className="mb-2 flex flex-wrap items-center gap-2">
                          <span className="eq-id-chip rounded px-2 py-0.5 font-mono text-xs font-bold">
                            {id}
                          </span>
                          <span
                            className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-bold ${eventType.tone}`}
                          >
                            <EventTypeIcon className="h-3 w-3" />
                            {eventType.label}
                          </span>
                          {criticality && (
                            <span
                              className={`rounded px-2 py-0.5 text-xs font-bold text-white ${criticality.badgeColor}`}
                            >
                              {criticality.label}
                            </span>
                          )}
                          <span
                            className={`rounded px-2 py-0.5 text-xs font-medium ${status.badge}`}
                          >
                            <StatusIcon className="w-3 h-3 inline mr-1" />
                            {status.label}
                          </span>
                        </div>
                        <h3 className="mb-1 text-base font-bold text-[var(--eq-text-primary)]">
                          {title}
                        </h3>
                        <p className="text-sm text-[var(--eq-text-secondary)]">
                          {description}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center gap-1 text-xs text-[var(--eq-text-muted)]">
                          <Clock className="w-3 h-3" />
                          {dateTime}
                        </div>
                      </div>
                    </div>

                    <div className="mb-3 grid grid-cols-2 gap-3 text-sm lg:grid-cols-4">
                      {details.map((detail) => {
                        const DetailIcon = detail.icon;

                        return (
                          <div key={detail.label}>
                            <div className="mb-0.5 text-sm font-medium text-[var(--eq-text-primary)]">
                              {detail.label}
                            </div>
                            <div className="flex items-center gap-1 text-xs text-[var(--eq-text-muted)]">
                              {DetailIcon && <DetailIcon className="w-3 h-3" />}
                              {detail.value || "--"}
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {isOccurrence && item.occurrence.attachments && (
                      <div className="flex items-center gap-3 text-xs">
                        <span className="text-[var(--eq-text-primary)]">Anexos:</span>
                        <div className="flex items-center gap-2">
                          {item.occurrence.attachments.photo && (
                            <span className="flex items-center gap-1 rounded bg-[var(--eq-bg-surface-soft)] px-2 py-1 text-[var(--eq-text-muted)]">
                              <Image className="w-3 h-3" />
                              Foto
                            </span>
                          )}
                          {item.occurrence.attachments.video && (
                            <span className="flex items-center gap-1 rounded bg-[var(--eq-bg-surface-soft)] px-2 py-1 text-[var(--eq-text-muted)]">
                              <Video className="w-3 h-3" />
                              Vídeo
                            </span>
                          )}
                          {item.occurrence.attachments.document && (
                            <span className="flex items-center gap-1 rounded bg-[var(--eq-bg-surface-soft)] px-2 py-1 text-[var(--eq-text-muted)]">
                              <FileText className="w-3 h-3" />
                              Documento
                            </span>
                          )}
                          {item.occurrence.attachments.protocol && (
                            <span className="flex items-center gap-1 rounded bg-[var(--eq-bg-surface-soft)] px-2 py-1 text-[var(--eq-text-muted)]">
                              <Paperclip className="w-3 h-3" />
                              Protocolo
                            </span>
                          )}
                        </div>
                      </div>
                    )}

                    {!isOccurrence && item.event.attachments?.length > 0 && (
                      <div className="flex items-center gap-3 text-xs">
                        <span className="text-[var(--eq-text-primary)]">
                          Anexos:
                        </span>
                        <span className="flex items-center gap-1 rounded bg-[var(--eq-bg-surface-soft)] px-2 py-1 text-[var(--eq-text-muted)]">
                          <Paperclip className="w-3 h-3" />
                          {item.event.attachments.length} arquivo
                          {item.event.attachments.length !== 1 ? "s" : ""}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          ) : (
            <div className="eq-empty-state p-12 text-center">
              <Calendar className="mx-auto mb-4 h-16 w-16 text-[var(--eq-text-muted)] opacity-50" />
              <p className="text-lg text-[var(--eq-text-muted)]">
                Nenhum evento encontrado
              </p>
              <p className="mt-2 text-sm text-[var(--eq-text-muted)]">
                Ajuste os filtros para visualizar outros eventos
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
