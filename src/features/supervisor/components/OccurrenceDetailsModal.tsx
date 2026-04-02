import { useState } from "react";
import {
  X,
  Clock,
  User,
  Activity,
  ArrowRightLeft,
  MapPin,
  Zap,
} from "lucide-react";

import type { Occurrence,  } from "../types/index";
import { OPERATORS, COMENTARIOS_MOCK} from "../mocks/mocks";
import type {Comentario } from "../mocks/mocks";

interface OccurrenceDetailsModalProps {
  occurrence: Occurrence;
  onClose: () => void;
}

type ComentarioTipo = Comentario["type"];

export function OccurrenceDetailsModal({
  occurrence,
  onClose,
}: OccurrenceDetailsModalProps) {
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [selectedOperatorId, setSelectedOperatorId] = useState("");

  const [novoComentario, setNovoComentario] = useState("");
  const [tipoComentario, setTipoComentario] = useState<ComentarioTipo>("GERAL");

  const [activeTab, setActiveTab] = useState<
    "resumo" | "comentarios" | "anexos"
  >("resumo");

  const comentarios: Comentario[] = COMENTARIOS_MOCK[occurrence.id] ?? [];

  const canTransfer =
    occurrence.status === "aberta" || occurrence.status === "em_andamento";

  const availableOperators = OPERATORS.filter(
    (operator) =>
      operator.status === "Ativo" && operator.id !== occurrence.operatorId,
  );

  const getSeverityStyles = (severity: string) => {
    switch (severity) {
      case "critica":
        return "bg-red-500/10 text-red-500 border-red-500/30";
      case "alta":
        return "bg-yellow-500/10 text-yellow-500 border-yellow-500/30";
      case "media":
        return "bg-blue-500/10 text-blue-400 border-blue-500/30";
      case "baixa":
        return "bg-green-500/10 text-green-500 border-green-500/30";
      default:
        return "bg-gray-500/10 text-gray-400 border-gray-500/30";
    }
  };

  const getStatusStyles = (status: string) => {
    switch (status) {
      case "aberta":
        return "bg-red-500/10 text-red-500 border-red-500/30";
      case "em_andamento":
        return "bg-yellow-500/10 text-yellow-500 border-yellow-500/30";
      case "resolvida":
        return "bg-green-500/10 text-green-500 border-green-500/30";
      case "transferida":
        return "bg-blue-500/10 text-blue-400 border-blue-500/30";
      default:
        return "bg-gray-500/10 text-gray-400 border-gray-500/30";
    }
  };

  const handleTransfer = () => {
    if (!selectedOperatorId) return;

    console.log(`Transferring ${occurrence.id} to ${selectedOperatorId}`);

    setIsTransferModalOpen(false);
    onClose();
  };

  return (
    <>
      {/* Overlay + Modal */}
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[9999] p-6">
        <div
          className="bg-theme-panel border border-slate-700 rounded-lg w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          {/* HEADER */}
          <div className="flex items-start justify-between p-6 border-b border-slate-700">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                <span className="text-sm font-mono text-slate-400">
                  {occurrence.id}
                </span>

                <div
                  className={`px-2 py-1 rounded text-xs font-medium border uppercase ${getSeverityStyles(
                    occurrence.criticality,
                  )}`}
                >
                  {occurrence.criticality}
                </div>

                <div
                  className={`px-2 py-1 rounded text-xs font-medium border uppercase ${getStatusStyles(
                    occurrence.status,
                  )}`}
                >
                  {occurrence.status.replace("_", " ")}
                </div>
              </div>

              <h2 className="text-xl text-theme-main mb-1">
                {occurrence.title}
              </h2>

              <div className="flex items-center gap-4 text-sm text-slate-400">
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {occurrence.dateTime}
                </div>

                <div className="flex items-center gap-1">
                  <User className="w-4 h-4" />
                  {occurrence.operator}
                </div>

                <div className="flex items-center gap-1">
                  <Activity className="w-4 h-4" />
                  {occurrence.table}
                </div>
              </div>
            </div>

            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* TABS */}
          <div className="flex gap-6 px-6 pt-4 border-b border-slate-700">
            <button
              onClick={() => setActiveTab("resumo")}
              className={`pb-3 px-1 text-sm font-medium border-b-2 transition-colors ${
                activeTab === "resumo"
                  ? "border-green-500 text-green-400"
                  : "border-transparent text-slate-400 hover:text-white"
              }`}
            >
              Resumo
            </button>

            <button
              onClick={() => setActiveTab("comentarios")}
              className={`pb-3 px-1 text-sm font-medium border-b-2 transition-colors ${
                activeTab === "comentarios"
                  ? "border-green-500 text-green-400"
                  : "border-transparent text-slate-400 hover:text-white"
              }`}
            >
              Atualizações
            </button>
            <button
              onClick={() => setActiveTab("anexos")}
              className={`pb-3 px-1 text-sm font-medium border-b-2 transition-colors ${
                activeTab === "anexos"
                  ? "border-green-500 text-green-400"
                  : "border-transparent text-slate-400 hover:text-white"
              }`}
            >
              Anexos
            </button>
          </div>

          {/* CONTENT */}
          <div className="flex-1 overflow-y-auto p-6">
            {activeTab === "resumo" && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-medium text-theme-main mb-2">
                    Descrição
                  </h3>

                  <p className="text-sm text-theme-muted">
                    {occurrence.description}
                  </p>
                </div>
                {/* LOCALIZAÇÃO */}

                <div>
                  <h3 className="text-sm font-medium mb-3 text-theme-main">
                    Localização Operacional
                  </h3>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-slate-400" />
                      Base: {occurrence.geographicBase}
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-slate-400" />
                      Subestação: {occurrence.substation}
                    </div>

                    <div className="flex items-center gap-2">
                      <Zap className="w-4 h-4 text-slate-400" />
                      Alimentador: {occurrence.feeder}
                    </div>

                    <div>Mesa: {occurrence.table}</div>
                  </div>
                </div>

                {occurrence.affectedConsumers && (
                  <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3">
                    <p className="text-sm text-theme-main">
                      <span className="font-semibold text-yellow-400">
                        {occurrence.affectedConsumers.toLocaleString("pt-BR")}
                      </span>{" "}
                      consumidores afetados
                    </p>
                  </div>
                )}

                <div>
                  <h3 className="text-sm font-medium text-theme-main mb-3">
                    Operador Responsável
                  </h3>

                  <div className="bg-slate-800 rounded-lg p-4 border border-slate-700 flex justify-between items-center">
                    <div>
                      <p className="text-sm text-theme-muted">
                        {occurrence.operator}
                      </p>

                      <p className="text-xs text-slate-400">
                        {occurrence.profile} • Mesa {occurrence.table}
                      </p>
                    </div>

                    {canTransfer && (
                      <button
                        onClick={() => setIsTransferModalOpen(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-green-500/10 hover:bg-green-500/20 text-green-400 rounded-lg text-sm font-medium"
                      >
                        <ArrowRightLeft className="w-4 h-4" />
                        Transferir
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}

            {activeTab === "comentarios" && (
              <div className="space-y-4">
                <h3 className="text-sm font-medium text-theme-main">
                  Atualizações
                </h3>

                {comentarios.length === 0 ? (
                  <p className="text-theme-muted italic">
                    Nenhum comentário ainda.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {comentarios.map((comentario) => (
                      <div
                        key={comentario.id}
                        className="bg-bg-theme border border-slate-700 rounded-lg p-4"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-theme-main">
                              {comentario.autor}
                            </span>

                            <span className="text-xs bg-theme-input border border-theme px-2 py-0.5 rounded">
                              {comentario.type}
                            </span>
                          </div>

                          <span className="text-xs text-theme-muted">
                            {comentario.dateTime}
                          </span>
                        </div>

                        <p className="text-sm text-theme-muted">
                          {comentario.texto}
                        </p>
                      </div>
                    ))}
                  </div>
                )}

                <div className="pt-4 border-t border-slate-700 space-y-4">
                  {/* TIPOS DE COMENTÁRIO */}
                  <div className="flex gap-2">
                    {["GERAL", "TECNICO", "CONTATO", "ALERTA"].map((tipo) => (
                      <button
                        key={tipo}
                        onClick={() =>
                          setTipoComentario(tipo as ComentarioTipo)
                        }
                        className={`px-3 py-1.5 text-xs rounded-md border transition-colors ${
                          tipoComentario === tipo
                            ? "bg-green-500/10 text-green-400 border-green-500/30"
                            : "bg-slate-800 text-slate-400 border-slate-700 hover:text-white"
                        }`}
                      >
                        {tipo}
                      </button>
                    ))}
                  </div>

                  {/* CAMPO DE TEXTO */}
                  <textarea
                    value={novoComentario}
                    onChange={(e) => setNovoComentario(e.target.value)}
                    placeholder="Escreva um comentário..."
                    rows={3}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-sm text-white placeholder:text-slate-500 resize-none"
                  />

                  {/* RODAPÉ */}
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-400">
                      Tipo: {tipoComentario}
                    </span>

                    <button
                      disabled={!novoComentario.trim()}
                      className="flex items-center gap-2 px-4 py-2 bg-green-500 hover:bg-green-600 text-white text-sm rounded-lg disabled:opacity-50"
                    >
                      Postar
                    </button>
                  </div>
                </div>
              </div>
            )}
            {activeTab === "anexos" && (
              <div className="space-y-4">
                <h3 className="text-sm font-medium text-theme-main">Anexos</h3>

                {!occurrence.attachments && (
                  <p className="text-theme-muted italic">
                    Nenhum anexo registrado.
                  </p>
                )}

                {occurrence.attachments && (
                  <div className="space-y-3">
                    {occurrence.attachments.photo && (
                      <div className="bg-bg-theme border border-slate-700 rounded-lg p-4">
                        📷 Foto anexada
                      </div>
                    )}

                    {occurrence.attachments.video && (
                      <div className="bg-bg-theme border border-slate-700 rounded-lg p-4">
                        🎥 Vídeo anexado
                      </div>
                    )}

                    {occurrence.attachments.document && (
                      <div className="bg-bg-theme border border-slate-700 rounded-lg p-4">
                        📄 Documento anexado
                      </div>
                    )}

                    {occurrence.attachments.protocol && (
                      <div className="bg-bg-theme border border-slate-700 rounded-lg p-4">
                        📑 Protocolo anexado
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* TRANSFER MODAL */}
      {isTransferModalOpen && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-6">
          <div className="bg-theme-input border border-theme-color rounded-lg w-full max-w-md p-6">
            <h3 className="text-lg text-theme-main mb-4">
              Transferir Ocorrência
            </h3>

            <select
              value={selectedOperatorId}
              onChange={(e) => setSelectedOperatorId(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white"
            >
              <option value="">Selecione um operator</option>

              {availableOperators.map((operator) => (
                <option key={operator.id} value={operator.id}>
                  {operator.name} - {operator.profile} ({operator.table})
                </option>
              ))}
            </select>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setIsTransferModalOpen(false)}
                className="flex-1 px-4 py-2 bg-theme-panel text-theme-main rounded-lg"
              >
                Cancelar
              </button>

              <button
                onClick={handleTransfer}
                disabled={!selectedOperatorId}
                className="flex-1 px-4 py-2 bg-green-500 text-white rounded-lg disabled:opacity-50"
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
