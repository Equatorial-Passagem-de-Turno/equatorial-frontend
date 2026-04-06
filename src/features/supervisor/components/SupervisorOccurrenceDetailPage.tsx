import { useParams, useNavigate } from "react-router-dom";
import {
  // ArrowLeft,
  Clock,
  User,
  MapPin,
  Activity,
  Image,
  ClipboardList,
  Navigation,
  Video,
  Paperclip,
  FileText,
  AlertCircle,
  CheckCircle2,
  ArrowRight,
  Zap,
  GitBranch,
  // Users,
  TrendingUp,
  Edit,
  Tag,
  Trash2,
} from "lucide-react";
import { useState, useEffect } from "react";
import { EditOccurrenceModal } from "./manager/EditOccurrenceModal";
import { TransferOccurrenceModal } from "./manager/TransferOccurrenceModal";
import { ConfirmRemovalModal } from "./manager/ConfirmRemovalOperator";
import type { Occurrence } from "../types/index.ts";
import { useSupervisorStore } from "../stores/useSupervisorStore";
import { api } from "@/services/api";

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
const commentTypeConfig = {
  GERAL: {
    text: "text-slate-300",
    border: "border-slate-600",
    bg: "bg-slate-700/40",
  },
  TÉCNICO: {
    text: "text-blue-400",
    border: "border-blue-500/40",
    bg: "bg-blue-500/10",
  },
  CONTATO: {
    text: "text-purple-400",
    border: "border-purple-500/40",
    bg: "bg-purple-500/10",
  },
  ALERTA: {
    text: "text-red-400",
    border: "border-red-500/40",
    bg: "bg-red-500/10",
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
    color: "text-emerald-500",
  },
  transferida: {
    label: "TRANSFERIDA",
    icon: ArrowRight,
    color: "text-blue-500",
  },
};

export function SupervisorOccurenceDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const occurrences = useSupervisorStore((state) => state.occurrences);
  const loadData = useSupervisorStore((state) => state.loadData);
  const [editOpen, setEditOpen] = useState(false);
  const [transferOpen, setTransferOpen] = useState(false);
  const [occurrence, setOccurrence] = useState<Occurrence | null>(null);
  const [historicoEventos, setHistoricoEventos] = useState<any[]>([]);
  const [deleteOpen, setDeleteOpen] = useState(false);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  useEffect(() => {
    if (!id) return;

    const found = occurrences.find((o) => String(o.id) === String(id));
    if (found) {
      setOccurrence(found);
      return;
    }

    const fetchOne = async () => {
      try {
        const response = await api.get(`/occurrences/${id}`);
        const data = response.data;

        const mapped: Occurrence = {
          id: String(data.id),
          title: String(data.title || 'Sem título'),
          description: String(data.description || ''),
          category: String(data.category || 'Operação'),
          criticality: String(data.priority || '').toLowerCase().includes('crit') ? 'critica' : String(data.priority || '').toLowerCase().includes('alt') ? 'alta' : String(data.priority || '').toLowerCase().includes('med') ? 'media' : 'baixa',
          status: String(data.status || '').toLowerCase().includes('resol') ? 'resolvida' : String(data.status || '').toLowerCase().includes('andamento') ? 'em_andamento' : String(data.status || '').toLowerCase().includes('transfer') ? 'transferida' : 'aberta',
          type: 'falha',
          dateTime: data.created_at ? new Date(data.created_at).toLocaleString('pt-BR') : new Date().toLocaleString('pt-BR'),
          timestamp: data.created_at ? new Date(data.created_at).getTime() : Date.now(),
          operator: String(data.createdBy || 'Sistema'),
          operatorId: String(data.user_id || ''),
          profile: 'BT',
          table: 'N/A',
          geographicBase: String(data.location?.zone || data.location?.city || 'N/A'),
          feeder: String(data.location?.alimentador || 'N/A'),
          substation: String(data.location?.subestacao || 'N/A'),
          location: {
            city: String(data.location?.city || 'N/A'),
            district: String(data.location?.neighborhood || 'N/A'),
            zone: data.location?.zone ? String(data.location.zone) : undefined,
            address: data.location?.address ? String(data.location.address) : undefined,
            referencePoint: data.location?.reference ? String(data.location.reference) : undefined,
          },
          attachments: {
            photo: false,
            video: false,
            document: false,
            protocol: false,
          },
        };

        setOccurrence(mapped);
      } catch {
        setOccurrence(null);
      }
    };

    void fetchOne();
  }, [id, occurrences]);

  if (!occurrence) {
    return <div>Ocorrência não encontrada</div>;
  }

  /* =========================
     COMENTÁRIOS DA OCORRÊNCIA
     ========================= */

  const comentarios: Array<{ type: string; texto: string; autor: string; timestamp: number; dateTime: string }> = [];

  /* =========================
     HISTÓRICO UNIFICADO
     ========================= */

  useEffect(() => {
    const baseHistorico = [
      {
        type: "registro",
        title: "Ocorrência registrada",
        description: `Registrado por ${occurrence.operator} na mesa ${occurrence.table}`,
        timestamp: occurrence.timestamp,
        dateTime: occurrence.dateTime,
      },

      ...comentarios.map((c) => ({
        type: "comentario",
        commentType: c.type,
        title: "Comentário",
        description: c.texto,
        author: c.autor,
        timestamp: c.timestamp,
        dateTime: c.dateTime,
      })),
    ];

    setHistoricoEventos(baseHistorico);
  }, [occurrence.id, comentarios]);

  const historicoOrdenado = [...historicoEventos].sort(
    (a, b) => a.timestamp - b.timestamp,
  );

  const criticality = criticalityConfig[occurrence.criticality];
  const status = statusConfig[occurrence.status];
  const StatusIcon = status.icon;
  function gerarDescricaoAlteracoes(oldOcc: any, newOcc: any) {
    const mudancas: string[] = [];

    if (oldOcc.title !== newOcc.title) {
      mudancas.push(`Título: "${oldOcc.title}" → "${newOcc.title}"`);
    }

    if (oldOcc.description !== newOcc.description) {
      mudancas.push(`Descrição atualizada`);
    }

    if (oldOcc.category !== newOcc.category) {
      mudancas.push(`Categoria: ${oldOcc.category} → ${newOcc.category}`);
    }

    if (oldOcc.status !== newOcc.status) {
      mudancas.push(`Status: ${oldOcc.status} → ${newOcc.status}`);
    }

    if (oldOcc.criticality !== newOcc.criticality) {
      mudancas.push(
        `Criticidade: ${oldOcc.criticality} → ${newOcc.criticality}`,
      );
    }

    if (oldOcc.operator !== newOcc.operator) {
      mudancas.push(`Operador: ${oldOcc.operator} → ${newOcc.operator}`);
    }

    if (oldOcc.table !== newOcc.table) {
      mudancas.push(`Mesa: ${oldOcc.table} → ${newOcc.table}`);
    }

    if (oldOcc.substation !== newOcc.substation) {
      mudancas.push(`Subestação: ${oldOcc.substation} → ${newOcc.substation}`);
    }

    if (oldOcc.feeder !== newOcc.feeder) {
      mudancas.push(`Alimentador: ${oldOcc.feeder} → ${newOcc.feeder}`);
    }

    return mudancas.join(" • ");
  }

  function handleDeleteOccurrence() {
    if (!occurrence) return;

    // fecha modal
    setDeleteOpen(false);

    // volta para página anterior
    navigate("/supervisor");
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <div className="p-8 max-w-7xl mx-auto space-y-6">
        {/* BOTÃO VOLTAR */}

        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 mb-8 px-5 py-2.5 rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-500 hover:text-slate-300 shadow-sm transition-all duration-300 group"
        >
          <ArrowRight className="w-4 h-4 rotate-180 group-hover:-translate-x-1 transition-transform text-theme-muted" />
          <span className="font-medium text-sm">Voltar</span>
        </button>

        {/* GRID PRINCIPAL */}

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* COLUNA ESQUERDA */}

          <div className="xl:col-span-2 space-y-6">
            {/* CARD DETALHES */}

            <div
              className={`bg-white dark:bg-slate-900 border-l rounded-2xl shadow-sm p-8 border-l-4 ${criticality.color}`}
            >
              <div className="flex justify-between mb-6">
                <div>
                  <div className="flex gap-2 mb-2">
                    <span className="text-xs font-mono bg-theme-input px-2 py-1 rounded">
                      {occurrence.id}
                    </span>

                    <span
                      className={`text-xs text-white px-2 py-1 rounded ${criticality.badgeColor}`}
                    >
                      {criticality.label}
                    </span>

                    <span
                      className={`text-xs flex items-center gap-1 ${status.color}`}
                    >
                      <StatusIcon className="w-3 h-3" />
                      {status.label}
                    </span>
                  </div>

                  <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                    {occurrence.title}
                  </h1>

                  <p className="text-slate-500">{occurrence.description}</p>
                </div>
              </div>

              {/* INFO GRID */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Linha 1: Identificação e Tempo */}
                <InfoCard
                  icon={<Clock size={18} />}
                  label="Data/Hora"
                  value={occurrence.dateTime}
                />
                <InfoCard
                  icon={<Tag size={18} />}
                  label="Categoria"
                  value={occurrence.category}
                />
                <InfoCard
                  icon={<ClipboardList size={18} />}
                  label="Ordem de Serviço"
                  value={occurrence.serviceOrder || "N/A"}
                />
                <InfoCard
                  icon={<User size={18} />}
                  label="Operador"
                  value={occurrence.operator}
                  subtitle={`${occurrence.operatorId} - ${occurrence.profile}`}
                />

                {/* Linha 2: Localização Técnica */}
                <InfoCard
                  icon={<Activity size={18} />}
                  label="Mesa de Operação"
                  value={occurrence.table}
                />
                <InfoCard
                  icon={<MapPin size={18} />}
                  label="Base Geográfica"
                  value={occurrence.geographicBase}
                />
                <InfoCard
                  icon={<Zap size={18} />}
                  label="Subestação"
                  value={occurrence.substation}
                />
                <InfoCard
                  icon={<GitBranch size={18} />}
                  label="Alimentador"
                  value={occurrence.feeder}
                />

                {/* <InfoCard
    icon={<Users size={18} />}
    label="Consumidores Afetados"
    value={occurrence.affectedConsumers?.toLocaleString('pt-BR') || "0"}
  /> */}

                {/* Linha 3: Endereço (Ocupando mais espaço se necessário) */}
                <div className="md:col-span-2 lg:col-span-4">
                  <InfoCard
                    icon={<Navigation size={18} />}
                    label="Endereço Completo"
                    value={`${occurrence.location.address ? occurrence.location.address + "," : ""} ${occurrence.location.district}`}
                    subtitle={`${occurrence.location.city}${occurrence.location.zone ? " - Zona " + occurrence.location.zone : ""} ${occurrence.location.referencePoint ? " | Ref: " + occurrence.location.referencePoint : ""}`}
                  />
                </div>
              </div>

              {/* TÉCNICO */}

              {/* <div className="mt-6 bg-slate-50 dark:bg-slate-800/40 rounded-xl p-4">
                <h3 className="flex items-center gap-2 text-sm font-semibold mb-4">
                  <Zap className="w-4 h-4 text-yellow-500" />
                  Informações Técnicas
                </h3>
                
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  <TechItem label="Subestação" value={occurrence.substation} />

                  <TechItem label="Alimentador" value={occurrence.feeder} />

                  {occurrence.resolutionTime && (
                    <TechItem
                      label="Tempo resolução"
                      value={`${occurrence.resolutionTime} min`}
                    />
                  )}

                  {occurrence.affectedConsumers && (
                    <TechItem
                      label="Consumidores"
                      value={occurrence.affectedConsumers.toLocaleString()}
                    />
                  )}
                </div>
              </div> */}
            </div>

            {/* HISTÓRICO */}

            <div className="bg-white dark:bg-slate-900 border rounded-2xl shadow-sm p-6">
              <h3 className="flex items-center gap-2 font-semibold mb-4">
                <TrendingUp className="w-4 h-4 text-emerald-500" />
                Histórico
              </h3>

              <div className="space-y-6">
                {historicoOrdenado.map((evento, index) => (
                  <TimelineItem
                    key={index}
                    title={evento.title}
                    time={evento.dateTime}
                    description={evento.description}
                    author={evento.author}
                    commentType={evento.commentType}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* COLUNA DIREITA */}

          <div className="space-y-6">
            {/* AÇÕES */}

            <div className="bg-white dark:bg-slate-900 border rounded-2xl shadow-sm p-6">
              <h3 className="font-semibold mb-4">Ações rápidas</h3>

              <div className="space-y-3">
                <ActionButton
                  icon={<Edit />}
                  label="Editar ocorrência"
                  onClick={() => setEditOpen(true)}
                />

                <ActionButton
                  icon={<ArrowRight />}
                  label="Transferir ocorrência"
                  onClick={() => setTransferOpen(true)}
                />

                <ActionButton
                  icon={<Trash2 />}
                  label="Cancelar ocorrência"
                  danger
                  onClick={() => setDeleteOpen(true)}
                />
              </div>
            </div>

            {/* ANEXOS */}

            {occurrence.attachments && (
              <div className="bg-white dark:bg-slate-900 border rounded-2xl shadow-sm p-6">
                <h3 className="flex items-center gap-2 font-semibold mb-4">
                  <Paperclip className="w-4 h-4" />
                  Anexos
                </h3>

                <div className="space-y-2">
                  {occurrence.attachments.photo && (
                    <Attachment icon={<Image />} label="Foto" />
                  )}

                  {occurrence.attachments.video && (
                    <Attachment icon={<Video />} label="Vídeo" />
                  )}

                  {occurrence.attachments.document && (
                    <Attachment icon={<FileText />} label="Documento" />
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      <EditOccurrenceModal
        isOpen={editOpen}
        onClose={() => setEditOpen(false)}
        occurrence={occurrence}
        onSave={(updatedOccurrence) => {
          const descricao = gerarDescricaoAlteracoes(
            occurrence,
            updatedOccurrence,
          );

          const evento = {
            title: "Ocorrência editada",
            description: descricao || "Dados atualizados",
            timestamp: Date.now(),
            dateTime: new Date().toLocaleString("pt-BR"),
            author: "Supervisor",
          };

          setHistoricoEventos((prev) => [...prev, evento]);
          setOccurrence(updatedOccurrence);
          setEditOpen(false);
        }}
      />
      <TransferOccurrenceModal
        isOpen={transferOpen}
        onClose={() => setTransferOpen(false)}
        occurrence={occurrence}
        onTransfer={(updatedOccurrence: Occurrence) => {
          const evento = {
            title: "Ocorrência transferida",
            description: `
                        Operador: ${occurrence.operator} → ${updatedOccurrence.operator}
                        Motivo: Transferência realizada pelo supervisor
                        `,
            timestamp: Date.now(),
            dateTime: new Date().toLocaleString("pt-BR"),
            author: "Supervisor",
          };

          setHistoricoEventos((prev) => [...prev, evento]);
          setOccurrence(updatedOccurrence);
          setTransferOpen(false);
        }}
      />
      <ConfirmRemovalModal
        isOpen={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={handleDeleteOccurrence}
        titulo="Cancelar Ocorrência"
        descricao="Tem certeza que deseja cancelar esta ocorrência?"
        itemNome={`${occurrence.id} - ${occurrence.title}`}
      />
    </div>
  );
}

/* COMPONENTES */

function InfoCard({ icon, label, value, subtitle }: any) {
  return (
    <div className="bg-slate-50 dark:bg-slate-800/40 rounded-xl p-4">
      <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
        {icon}
        {label}
      </div>
      <div className="text-sm font-semibold">{value}</div>
      {subtitle && <div className="text-xs text-slate-400">{subtitle}</div>}
    </div>
  );
}

function ActionButton({ icon, label, onClick, danger }: any) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex justify-between items-center px-4 py-3 rounded-lg transition
      ${
        danger
          ? "bg-red-500/10 text-red-500 hover:bg-red-500/20"
          : "bg-slate-50 dark:bg-slate-800 hover:bg-slate-100"
      }`}
    >
      <span className="flex items-center gap-2">
        {icon}
        {label}
      </span>
    </button>
  );
}

function Attachment({ icon, label }: any) {
  return (
    <div className="flex items-center gap-2 px-3 py-2 bg-slate-50 dark:bg-slate-800 rounded-lg">
      {icon}
      <span className="text-sm">{label}</span>
    </div>
  );
}
function TimelineItem({ title, time, description, author, commentType }: any) {
  const config = commentType
    ? commentTypeConfig[commentType as keyof typeof commentTypeConfig]
    : null;
  return (
    <div className="flex gap-4">
      <div className="flex flex-col items-center">
        <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
        <div className="w-0.5 h-full bg-slate-300"></div>
      </div>

      <div>
        <div className="flex items-center gap-2 text-sm font-semibold">
          {title}

          {commentType && config && (
            <span
              className={`
      text-xs
      px-2 py-0.5
      rounded
      border
      ${config.bg}
      ${config.border}
      ${config.text}
    `}
            >
              {commentType}
            </span>
          )}

          <span className="text-xs text-slate-400">{time}</span>
        </div>

        <p className="text-sm text-slate-500">{description}</p>

        {author && <p className="text-xs text-slate-400 mt-1">{author}</p>}
      </div>
    </div>
  );
}
