import { useState, useEffect } from "react";
import { X, FileText, MapPin, } from "lucide-react";
import { createPortal } from "react-dom";
import type {
  Occurrence,
  OccurrenceCriticality,
  OccurrenceStatus,
} from "../../types/index";

interface EditOccurrenceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (occurrenceAtualizada: Occurrence) => void;
  occurrence: Occurrence;
}

export function EditOccurrenceModal({
  isOpen,
  onClose,
  onSave,
  occurrence,
}: EditOccurrenceModalProps) {

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [criticality, setCriticality] =
    useState<OccurrenceCriticality>("media");
  const [status, setStatus] = useState<OccurrenceStatus>("aberta");

  const [dateTime, setDateTime] = useState("");
  const [operator, setOperator] = useState("");
  const [table, setTable] = useState("");
  const [geographicBase, setGeographicBase] = useState("");
  const [substation, setSubstation] = useState("");
  const [feeder, setFeeder] = useState("");
  const [serviceOrder, setServiceOrder] = useState("");
  const [address, setAddress] = useState("");

  useEffect(() => {
    setTitle(occurrence.title);
    setDescription(occurrence.description);
    setCategory(occurrence.category);
    setCriticality(occurrence.criticality);
    setStatus(occurrence.status);

    setDateTime(occurrence.dateTime);
    setOperator(occurrence.operator);
    setTable(occurrence.table);
    setGeographicBase(occurrence.geographicBase);
    setSubstation(occurrence.substation);
    setFeeder(occurrence.feeder);
    setServiceOrder(occurrence.serviceOrder ?? "");
    setAddress(occurrence.location.address ?? "");
  }, [occurrence]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const updatedLocation = {
      ...occurrence.location,
      city: occurrence.location.city || "N/A",
      district: occurrence.location.district || "N/A",
      address,
    };

    onSave({
      ...occurrence,
      title,
      description,
      category,
      criticality,
      status,
      dateTime,
      operator,
      table,
      geographicBase,
      substation,
      feeder,
      serviceOrder,
      location: updatedLocation,
    });
  };

  const handleCancel = () => {
    onClose();
  };

  return createPortal(
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[9999] p-4">

      <div className="bg-white dark:bg-[#1e293b] border border-zinc-200 dark:border-[#334155] rounded-xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">

        {/* HEADER */}

        <div className="p-6 border-b border-zinc-200 dark:border-[#334155] flex items-center justify-between">

          <div className="flex items-center gap-3">

            <div className="w-10 h-10 rounded-lg bg-blue-500/10 dark:bg-blue-500/20 flex items-center justify-center">
              <FileText className="w-5 h-5 text-blue-500" />
            </div>

            <div>
              <h2 className="text-xl font-bold text-zinc-900 dark:text-white">
                Editar Ocorrência
              </h2>

              <p className="text-sm text-zinc-600 dark:text-[#94a3b8]">
                Atualize os dados da ocorrência
              </p>
            </div>

          </div>

          <button
            onClick={handleCancel}
            className="w-8 h-8 rounded-lg bg-zinc-100 dark:bg-[#0f172a] hover:bg-zinc-200 dark:hover:bg-[#0f172a]/80 flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5 text-zinc-600 dark:text-[#94a3b8]" />
          </button>

        </div>

        {/* BODY */}

        <div className="flex-1 overflow-y-auto p-6">

          <form onSubmit={handleSubmit} className="space-y-6">

            {/* TÍTULO */}

            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <FileText className="w-4 h-4 text-blue-500" />
                Título
              </label>

              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-3 bg-white dark:bg-[#0f172a] border border-zinc-200 dark:border-[#334155] rounded-lg"
              />
            </div>

            {/* DESCRIÇÃO */}

            <div className="space-y-2">

              <label className="text-sm font-medium flex items-center gap-2">
                <FileText className="w-4 h-4 text-blue-500" />
                Descrição
              </label>

              <textarea
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-4 py-3 bg-white dark:bg-[#0f172a] border border-zinc-200 dark:border-[#334155] rounded-lg"
              />

            </div>

            {/* GRID */}

            <div className="grid grid-cols-2 gap-4">

              <div>
                <label className="text-sm">Categoria</label>
                <input
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-4 py-3 bg-white dark:bg-[#0f172a] border border-zinc-200 dark:border-[#334155] rounded-lg"
                />
              </div>

              <div>
                <label className="text-sm">Criticidade</label>
                <select
                  value={criticality}
                  onChange={(e) =>
                    setCriticality(e.target.value as OccurrenceCriticality)
                  }
                  className="w-full px-4 py-3 bg-white dark:bg-[#0f172a] border border-zinc-200 dark:border-[#334155] rounded-lg"
                >
                  <option value="baixa">Baixa</option>
                  <option value="media">Média</option>
                  <option value="alta">Alta</option>
                  <option value="critica">Crítica</option>
                </select>
              </div>

              <div>
                <label className="text-sm">Status</label>
                <select
                  value={status}
                  onChange={(e) =>
                    setStatus(e.target.value as OccurrenceStatus)
                  }
                  className="w-full px-4 py-3 bg-white dark:bg-[#0f172a] border border-zinc-200 dark:border-[#334155] rounded-lg"
                >
                  <option value="aberta">Aberta</option>
                  <option value="em_andamento">Em andamento</option>
                  <option value="resolvida">Resolvida</option>
                  <option value="transferida">Transferida</option>
                </select>
              </div>

              <div>
                <label className="text-sm">Data/Hora</label>
                <input
                  value={dateTime}
                  onChange={(e) => setDateTime(e.target.value)}
                  className="w-full px-4 py-3 bg-white dark:bg-[#0f172a] border border-zinc-200 dark:border-[#334155] rounded-lg"
                />
              </div>

              <div>
                <label className="text-sm">Operador</label>
                <input
                  value={operator}
                  onChange={(e) => setOperator(e.target.value)}
                  className="w-full px-4 py-3 bg-white dark:bg-[#0f172a] border border-zinc-200 dark:border-[#334155] rounded-lg"
                />
              </div>

              <div>
                <label className="text-sm">Mesa</label>
                <input
                  value={table}
                  onChange={(e) => setTable(e.target.value)}
                  className="w-full px-4 py-3 bg-white dark:bg-[#0f172a] border border-zinc-200 dark:border-[#334155] rounded-lg"
                />
              </div>

              <div>
                <label className="text-sm">Base Geográfica</label>
                <input
                  value={geographicBase}
                  onChange={(e) => setGeographicBase(e.target.value)}
                  className="w-full px-4 py-3 bg-white dark:bg-[#0f172a] border border-zinc-200 dark:border-[#334155] rounded-lg"
                />
              </div>

              <div>
                <label className="text-sm">Subestação</label>
                <input
                  value={substation}
                  onChange={(e) => setSubstation(e.target.value)}
                  className="w-full px-4 py-3 bg-white dark:bg-[#0f172a] border border-zinc-200 dark:border-[#334155] rounded-lg"
                />
              </div>

              <div>
                <label className="text-sm">Alimentador</label>
                <input
                  value={feeder}
                  onChange={(e) => setFeeder(e.target.value)}
                  className="w-full px-4 py-3 bg-white dark:bg-[#0f172a] border border-zinc-200 dark:border-[#334155] rounded-lg"
                />
              </div>

              <div>
                <label className="text-sm">Ordem de Serviço</label>
                <input
                  value={serviceOrder}
                  onChange={(e) => setServiceOrder(e.target.value)}
                  className="w-full px-4 py-3 bg-white dark:bg-[#0f172a] border border-zinc-200 dark:border-[#334155] rounded-lg"
                />
              </div>

            </div>

            {/* ENDEREÇO */}

            <div>

              <label className="text-sm flex items-center gap-2">
                <MapPin className="w-4 h-4 text-blue-500" />
                Endereço
              </label>

              <textarea
                rows={2}
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full px-4 py-3 bg-white dark:bg-[#0f172a] border border-zinc-200 dark:border-[#334155] rounded-lg"
              />

            </div>

            {/* ACTIONS */}

            <div className="flex gap-3 pt-4 border-t">

              <button
                type="button"
                onClick={handleCancel}
                className="flex-1 px-4 py-3 border rounded-lg"
              >
                Cancelar
              </button>

              <button
                type="submit"
                className="flex-1 px-4 py-3 bg-blue-500 text-white rounded-lg"
              >
                Salvar Alterações
              </button>

            </div>

          </form>

        </div>

      </div>

    </div>,
    document.body
  );
}