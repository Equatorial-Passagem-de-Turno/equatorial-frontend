import { useEffect, useMemo, useState } from "react";
import {
  Users,
  Search,
  Filter,
  UserCheck,
  MapPin,
  Plus,
  UserX,
  Mail,
  Trash2,
  Edit,
  Calendar,
} from "lucide-react";
import { ConfirmRemovalModal } from "../components/manager/ConfirmRemovalOperator";
import { OperatorHistoryModal } from "../components/OperatorHistoryModal";
import { ShiftHistoryModal } from "@/features/supervisor/components/ShiftHistoryModal";
import { RegisterOperatorModal } from "../components/manager/RegisterOperatorModal";
import { EditOperatorModal } from "../components/manager/EditOperatorModal";
import type { Operator, OperatorProfile } from "../types/index.ts";
import { PROFILE_COLORS_DETAILED } from "../constants";
import { AddTableModal } from "../components/manager/AddTable";
import { EditTableModal } from "../components/manager/EditTableModal";
import { useSupervisorStore } from "../stores/useSupervisorStore";
import { api } from "@/services/api";
import { showErrorModal } from "@/shared/ui/feedbackModal";

interface Table {
  id?: string;
  name: string;
  description: string;
}

export function ManegementPage() {
  const loadData = useSupervisorStore((state) => state.loadData);
  const sourceOperators = useSupervisorStore((state) => state.operators);
  const isLoading = useSupervisorStore((state) => state.isLoading);
  const hydratedAt = useSupervisorStore((state) => state.hydratedAt);

  const TABLE_DESCRIPTIONS: Record<string, string> = {
  "MCZ I": "Operação da região central de Maceió",
  "MCZ II": "Monitoramento complementar da capital",
  "DMG / SDI": "Distribuição média tensão e supervisão industrial",
  "RLU / SMC": "Regulação e supervisão de manutenção de campo",
  "DMG / SDI / PND": "Controle integrado de distribuição e planejamento",
  "LESTE / OESTE": "Operação regional leste e oeste do estado",
  "MCZ I / RLU": "Suporte compartilhado entre capital e regulação",
  "OUTRAS": "Mesas auxiliares ou temporárias do COI",
};
  const [tablesData, setTablesData] = useState<Table[]>([]);

  const [selectedTable, setSelectedTable] = useState<Table | null>(null);

  const [showAddTableModal, setShowAddTableModal] = useState(false);
  const [showEditTableModal, setShowEditTableModal] = useState(false);
  const [showRemoveTableModal, setShowRemoveTableModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showRemoveOperatorModal, setShowRemoveOperatorModal] = useState(false);
  const [operatorsData, setOperatorsData] =
    useState<Operator[]>([]);

  const [selectedOperator, setSelectedOperator] = useState<Operator | null>(
    null,
  );

  const [showShiftHistoryModal, setShowShiftHistoryModal] = useState(false);

  const [showOperatorHistoryModal, setShowOperatorHistoryModal] =
    useState(false);

  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");

  useEffect(() => {
    if (!hydratedAt) {
      void loadData();
    }
  }, [hydratedAt, loadData]);

  useEffect(() => {
    setOperatorsData(sourceOperators);
  }, [sourceOperators]);

  useEffect(() => {
    const loadTables = async () => {
      try {
        const response = await api.get<Array<{ id: string; name: string; code: string; location?: string }>>('/operation-desks');
        const mapped = (response.data || []).map((desk) => ({
          id: String(desk.id),
          name: desk.name,
          description: desk.location ?? TABLE_DESCRIPTIONS[desk.name] ?? desk.code,
        }));
        setTablesData(mapped);
      } catch {
        setTablesData([]);
      }
    };

    void loadTables();
  }, []);

  const handleProfileClick = (operator: Operator) => {
    setSelectedOperator(operator);
    setShowOperatorHistoryModal(true);
  };

  const handleCloseOperatorModal = () => {
    setSelectedOperator(null);
    setShowOperatorHistoryModal(false);
  };

  const handleEditOperator = (operator: Operator) => {
    setSelectedOperator(operator);
    setShowEditModal(true);
  };

  const findDeskByName = (deskName: string) => {
    return tablesData.find((table) => table.name === deskName);
  };

  const handleUpdateOperator = async (updatedOperator: Operator) => {
    try {
      const desk = findDeskByName(updatedOperator.table);

      await api.put(`/users/${updatedOperator.id}`, {
        name: updatedOperator.name,
        email: updatedOperator.email,
        role: 'operador',
        voltage_level: updatedOperator.profile,
        active: updatedOperator.accountActive !== false,
        operation_desk_id: desk?.id ?? null,
        operation_desk_name: updatedOperator.table,
      });

      await loadData();
      setShowEditModal(false);
      setSelectedOperator(null);
    } catch {
      void showErrorModal('Nao foi possivel atualizar o operador.');
    }
  };

  const handleDeactivateOperator = async (updatedOperator: Operator) => {
    try {
      const desk = findDeskByName(updatedOperator.table);

      await api.put(`/users/${updatedOperator.id}`, {
        name: updatedOperator.name,
        email: updatedOperator.email,
        role: 'operador',
        voltage_level: updatedOperator.profile,
        active: false,
        operation_desk_id: desk?.id ?? null,
        operation_desk_name: updatedOperator.table,
      });

      await loadData();
      setShowEditModal(false);
      setSelectedOperator(null);
    } catch {
      void showErrorModal('Nao foi possivel desativar o operador.');
    }
  };

  const handleReactivateOperator = async (updatedOperator: Operator) => {
    try {
      const desk = findDeskByName(updatedOperator.table);

      await api.put(`/users/${updatedOperator.id}`, {
        name: updatedOperator.name,
        email: updatedOperator.email,
        role: 'operador',
        voltage_level: updatedOperator.profile,
        active: true,
        operation_desk_id: desk?.id ?? null,
        operation_desk_name: updatedOperator.table,
      });

      await loadData();
      setShowEditModal(false);
      setSelectedOperator(null);
    } catch {
      void showErrorModal('Nao foi possivel reativar o operador.');
    }
  };

  const handleRemoveOperator = (operator: Operator) => {
    setSelectedOperator(operator);
    setShowRemoveOperatorModal(true);
  };

  const handleConfirmRemoveOperator = () => {
    if (!selectedOperator) return;

    void (async () => {
      try {
        await api.delete(`/users/${selectedOperator.id}`);
        await loadData();
        setShowRemoveOperatorModal(false);
        setSelectedOperator(null);
      } catch {
        void showErrorModal('Nao foi possivel desativar o operador.');
      }
    })();
  };

  const handleRegisterOperator = async (newOperator: {
    name: string;
    email: string;
    profile: OperatorProfile;
    table: string;
  }) => {
    try {
      const desk = findDeskByName(newOperator.table);

      await api.post('/users', {
        name: newOperator.name,
        email: newOperator.email,
        role: 'operador',
        voltage_level: newOperator.profile,
        active: true,
        operation_desk_id: desk?.id ?? null,
        operation_desk_name: newOperator.table,
      });

      await loadData();
      setShowRegisterModal(false);
    } catch {
      void showErrorModal('Nao foi possivel cadastrar o operador.');
    }
  };

  const filteredOperators = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();

    return operatorsData.filter((op) => {
      const accountIsActive = op.accountActive !== false;
      const matchesStatus =
        statusFilter === "all"
          ? true
          : statusFilter === "active"
            ? accountIsActive
            : !accountIsActive;

      const matchesSearch =
        q.length === 0 ||
        op.name.toLowerCase().includes(q) ||
        op.email.toLowerCase().includes(q) ||
        op.table.toLowerCase().includes(q);

      return matchesStatus && matchesSearch;
    });
  }, [operatorsData, searchTerm, statusFilter]);

  const totalOperators = useMemo(() => operatorsData.length, [operatorsData]);
  const activeOperators = useMemo(
    () => operatorsData.filter((op) => op.accountActive !== false).length,
    [operatorsData],
  );
  const inactiveOperators = useMemo(
    () => operatorsData.filter((op) => op.accountActive === false).length,
    [operatorsData],
  );

  const reloadTables = async () => {
    try {
      const response = await api.get<Array<{ id: string; name: string; code: string; location?: string }>>('/operation-desks');
      const mapped = (response.data || []).map((desk) => ({
        id: String(desk.id),
        name: desk.name,
        description: desk.location ?? TABLE_DESCRIPTIONS[desk.name] ?? desk.code,
      }));
      setTablesData(mapped);
    } catch {
      setTablesData([]);
    }
  };

  const handleAddTable = async (newTable: { name: string; description: string }) => {
    try {
      await api.post('/operation-desks', {
        name: newTable.name,
        location: newTable.description || null,
      });

      await reloadTables();
      setShowAddTableModal(false);
    } catch {
      void showErrorModal('Nao foi possivel cadastrar a mesa.');
    }
  };

  const handleEditTable = (table: Table) => {
    setSelectedTable(table);
    setShowEditTableModal(true);
  };

  const handleSaveTableEdit = async (updatedTable: Table, _originalName: string): Promise<void> => {
    if (!selectedTable?.id) {
      return;
    }

    try {
      await api.put(`/operation-desks/${selectedTable.id}`, {
        name: updatedTable.name,
        location: updatedTable.description || null,
      });

      await Promise.all([reloadTables(), loadData()]);
      setShowEditTableModal(false);
      setSelectedTable(null);
    } catch {
      void showErrorModal('Nao foi possivel atualizar a mesa.');
    }
  };

  const handleRemoveTable = (table: Table) => {
    setSelectedTable(table);
    setShowRemoveTableModal(true);
  };
  const handleConfirmRemoveTable = () => {
    if (!selectedTable?.id) return;

    void (async () => {
      try {
        await api.delete(`/operation-desks/${selectedTable.id}`);
        await Promise.all([reloadTables(), loadData()]);
        setShowRemoveTableModal(false);
        setSelectedTable(null);
      } catch {
        void showErrorModal('Nao foi possivel remover a mesa.');
      }
    })();
  };

  return (
    <div className="min-h-screen bg-theme-background text-theme-main p-6 space-y-6">
      {/* HEADER */}
      <div>
        <h1 className="text-2xl font-bold text-theme-main">Gestão do COI</h1>
        <p className="text-sm text-slate-400 mt-1">
          Gerenciamento de operadores e mesas de trabalho
        </p>
      </div>

      {/* ===== SEÇÃO MESAS ===== */}

      <div className="space-y-6 pt-6 border-t border-slate-700">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold flex items-center gap-2">
              <MapPin className="w-5 h-5 text-theme-accent" />
              Mesas de Trabalho
            </h2>

            {/* <p className="text-sm text-slate-400 mt-1">
              Gerenciar mesas disponíveis no COI
            </p> */}
          </div>

          <button
            onClick={() => setShowAddTableModal(true)}
            className="px-4 py-2 bg-theme-accent hover:bg-emerald-400 rounded-lg text-sm text-white flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Adicionar Mesa
          </button>
        </div>

        <div className="bg-slate-800 border border-slate-700 rounded-lg overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-theme-panel border-b border-theme-input">
                <th className="px-6 py-3 text-left text-xs text-slate-400 uppercase">
                  Nome
                </th>

                <th className="px-6 py-3 text-left text-xs text-slate-400 uppercase">
                  Descrição
                </th>

                {/* <th className="px-6 py-3 text-center text-xs text-slate-400 uppercase">
                  Operadores
                </th> */}

                <th className="px-6 py-3 text-center text-xs text-slate-400 uppercase">
                  Ações
                </th>
              </tr>
            </thead>

            <tbody>
              {tablesData.map((table) => {
                return (
                  <tr key={table.name} className="hover:bg-theme-hover">
                    <td className="px-6 py-4 font-medium">{table.name}</td>

                    <td className="px-6 py-4 text-slate-400">
                      {table.description || "-"}
                    </td>

                    {/* <td className="px-6 py-4 text-center">
                      {operatorsOnTable.length}
                    </td> */}

                    <td className="px-6 py-4">
                      <div className="flex justify-center gap-2">
                        <button
                          onClick={() => handleEditTable(table)}
                          className="p-2 hover:bg-blue-500/10 text-blue-500 rounded-lg"
                        >
                          <Edit className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => handleRemoveTable(table)}
                          className="p-2 hover:bg-red-500/10 text-red-500 rounded-lg"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
      <AddTableModal
        isOpen={showAddTableModal}
        onClose={() => setShowAddTableModal(false)}
        onSave={handleAddTable}
      />

      {selectedTable && (
        <EditTableModal
          isOpen={showEditTableModal}
          onClose={() => {
            setShowEditTableModal(false);
            setSelectedTable(null);
          }}
          onSave={handleSaveTableEdit}
          table={selectedTable}
        />
      )}

      {selectedTable && showRemoveTableModal && (
        <ConfirmRemovalModal
          isOpen={showRemoveTableModal}
          onClose={() => {
            setShowRemoveTableModal(false);
            setSelectedTable(null);
          }}
          onConfirm={handleConfirmRemoveTable}
          titulo="Remover Mesa"
          descricao="Tem certeza que deseja remover esta mesa?"
          itemNome={selectedTable.name}
        />
      )}
      {/* Seção operadores */}
      <div className="flex items-center justify-between  border-t border-slate-700 pt-6">
        <div>
          <h2 className="text-lg font-bold flex items-center gap-2">
            <Users className="w-5 h-5 text-theme-accent" />
            Operadores
          </h2>
        </div>

        <button
          onClick={() => setShowRegisterModal(true)}
          className="px-4 py-2 bg-theme-accent hover:bg-emerald-400 rounded-lg text-sm text-white flex items-center gap-2"
        >
          <Users className="w-4 h-4" />
          Adicionar Operator
        </button>
      </div>

      {/* STATS */}
      {isLoading && (
        <div className="rounded-lg border border-slate-700 bg-slate-900 p-4 text-slate-300 text-sm">
          Carregando operadores...
        </div>
      )}

      <div className="grid grid-cols-3 gap-4">
        <StatCard
          icon={<Users className="w-5 h-5 text-blue-400" />}
          value={totalOperators}
          label="Total Operatores"
        />
        <StatCard
          icon={<UserCheck className="w-5 h-5 text-green-400" />}
          value={activeOperators}
          label="Ativos"
        />
        <StatCard
          icon={<UserX className="w-5 h-5 text-slate-400" />}
          value={inactiveOperators}
          label="Inativos"
        />
      </div>

      {/* SEARCH + ACTIONS */}
      <div className="flex gap-3">
        <div className="flex-1 relative">
          <Search className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar operator..."
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
          />
        </div>

        <button
          onClick={() => setShowShiftHistoryModal(true)}
          className="px-4 py-2 bg-theme-accent hover:bg-emerald-400 rounded-lg text-sm text-white transition-all flex items-center gap-2 shadow-lg shadow-blue-600/20"
        >
          <Calendar className="w-4 h-4" />
          Ver Histórico Completo
        </button>

        <div className="px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-slate-400 hover:bg-theme-hover transition-all flex items-center gap-2">
          <Filter className="w-4 h-4" />
          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value as "all" | "active" | "inactive")}
            className="bg-transparent text-slate-300 focus:outline-none"
          >
            <option value="all" className="bg-slate-800 text-slate-100">Todos</option>
            <option value="active" className="bg-slate-800 text-slate-100">Ativos</option>
            <option value="inactive" className="bg-slate-800 text-slate-100">Inativos</option>
          </select>
        </div>
      </div>

      {/* TABLE */}
      <div className="bg-slate-800 border border-slate-700 rounded-lg shadow-md overflow-hidden ">
        <table className="w-full">
          <thead>
            <tr className="bg-theme-panel border-b border-theme-input">
              <th className="px-6 py-3 text-left text-xs font-semibold text-slate-400 uppercase">
                ID
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-slate-400 uppercase">
                Operator
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-slate-400 uppercase">
                Perfil
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-slate-400 uppercase">
                Mesa
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-slate-400 uppercase">
                Contato
              </th>
              <th className="px-6 py-3 text-center text-xs font-semibold text-slate-400 uppercase">
                Status
              </th>
              <th className="px-6 py-3 text-center text-xs font-semibold text-slate-400 uppercase">
                Ações
              </th>
            </tr>
          </thead>

          <tbody>
            {filteredOperators.map((op) => {
              const profileStyle = PROFILE_COLORS_DETAILED[op.profile];
              const visibleStatus = op.accountActive === false ? "Inativo" : "Ativo";

              return (
                <tr
                  key={op.id}
                  onClick={() => handleProfileClick(op)}
                  className="hover:bg-theme-hover transition-colors cursor-pointer"
                >
                  <td className="px-6 py-4 font-medium text-theme-muted">
                    {op.id}
                  </td>
                  <td className="px-6 py-4 font-medium text-theme-muted">
                    {op.name}
                  </td>

                  <td className="px-6 py-4">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${profileStyle.bg} ${profileStyle.text}`}
                    >
                      {op.profile}
                    </span>
                  </td>

                  <td className="px-6 py-4 text-slate-300">{op.table}</td>

                  <td className="px-6 py-4 flex items-center gap-2 text-sm text-slate-400">
                    <Mail className="w-4 h-4" />
                    {op.email}
                  </td>

                  <td className="px-6 py-4 text-center text-slate-300">
                    {visibleStatus}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleProfileClick(op);
                        }}
                        className="p-2 hover:bg-emerald-500/10 text-emerald-400 rounded-lg transition-all"
                        title="Historico de turnos"
                      >
                        <Calendar className="w-4 h-4" />
                      </button>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditOperator(op);
                        }}
                        className="p-2 hover:bg-blue-500/10 text-blue-500 rounded-lg transition-all"
                        title="Editar operator"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      {op.accountActive === false && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            void handleReactivateOperator(op);
                          }}
                          className="p-2 hover:bg-emerald-500/10 text-emerald-400 rounded-lg transition-all"
                          title="Reativar operador"
                        >
                          <UserCheck className="w-4 h-4" />
                        </button>
                      )}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveOperator(op);
                        }}
                        className="p-2 hover:bg-red-500/10 text-red-500 rounded-lg transition-all"
                        title="Remove operator"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <ShiftHistoryModal
        isOpen={showShiftHistoryModal}
        onClose={() => setShowShiftHistoryModal(false)}
      />

      {selectedOperator && (
        <OperatorHistoryModal
          isOpen={showOperatorHistoryModal}
          onClose={handleCloseOperatorModal}
          operatorId={selectedOperator.id}
          operatorName={selectedOperator.name}
          operatorEmail={selectedOperator.email}
          operatorProfile={selectedOperator.profile}
        />
      )}

      {selectedOperator && showEditModal && (
        <EditOperatorModal
          isOpen={showEditModal}
          onClose={() => setShowEditModal(false)}
          operator={selectedOperator}
          tables={tablesData.map((table) => table.name)}
          onSave={handleUpdateOperator}
          onDeactivate={handleDeactivateOperator}
          onReactivate={handleReactivateOperator}
        />
      )}

      <RegisterOperatorModal
        isOpen={showRegisterModal}
        onClose={() => setShowRegisterModal(false)}
        tables={tablesData.map((table) => table.name)}
        onSave={handleRegisterOperator}
      />

      {selectedOperator && showRemoveOperatorModal && (
        <ConfirmRemovalModal
          isOpen={showRemoveOperatorModal}
          onClose={() => {
            setShowRemoveOperatorModal(false);
            setSelectedOperator(null);
          }}
          onConfirm={handleConfirmRemoveOperator}
          titulo="Remover Operador"
          descricao="Tem certeza que deseja remover este operador?"
          itemNome={selectedOperator.name}
        />
      )}
    </div>
  );
}

/* STAT CARD */
function StatCard({
  icon,
  value,
  label,
}: {
  icon: React.ReactNode;
  value: number;
  label: string;
}) {
  return (
    <div className="bg-theme-panel border border-theme rounded-lg shadow-md p-5 flex items-center gap-3">
      <div className="w-10 h-10 rounded-lg bg-theme-background flex items-center justify-center">
        {icon}
      </div>

      <div>
        <div className="text-2xl font-bold text-theme-text">{value}</div>
        <div className="text-xs text-theme-muted">{label}</div>
      </div>
    </div>
  );
}
