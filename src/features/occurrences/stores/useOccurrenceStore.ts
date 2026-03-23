import { create } from 'zustand';
import { api } from '@/services/api';
import { type Occurrence } from '../types/index';
import { addCreatedThisShiftOccurrenceId } from '@/features/occurrences/utils/handoverPersistence';

const getCurrentUserIdFromStorage = (): string | null => {
  try {
    const raw = localStorage.getItem('auth-storage');
    if (!raw) return null;

    const parsed = JSON.parse(raw);
    const userId = parsed?.state?.user?.id;
    return userId ? String(userId) : null;
  } catch {
    return null;
  }
};

interface OccurrenceState {
  occurrences: Occurrence[];
  isLoading: boolean;
  fetchOccurrences: () => Promise<void>;
  createOccurrence: (data: Partial<Occurrence>) => Promise<void>; // NOVO
  updateOccurrence: (id: string, patch: Partial<Occurrence>) => Promise<void>; // ATUALIZADO
  deleteOccurrence: (id: string) => Promise<void>; // NOVO
  addOccurrences: (newItems: Occurrence[]) => void;
  reset: () => void;
}

export const useOccurrenceStore = create<OccurrenceState>((set) => ({
  occurrences: [],
  isLoading: false,

  // LISTAR (GET)
  fetchOccurrences: async () => {
    set({ isLoading: true });
    try {
      const response = await api.get('/occurrences');
      // Mapeamento opcional: Se o Laravel manda user_id e o React espera authorId
      const mappedData = response.data.map((occ: any) => ({
        ...occ,
        authorId: occ.user_id || occ.authorId, // Normaliza o ID do autor
        createdAt: occ.created_at ? new Date(occ.created_at).toLocaleString('pt-BR') : occ.createdAt
      }));
      
      set({ occurrences: mappedData, isLoading: false });
    } catch (err) {
      set({ isLoading: false });
    }
  },

  addOccurrences: (newItems) => {
    set((state) => {
      const existingIds = new Set(state.occurrences.map(o => o.id));
      const itemsToAdd = newItems.filter(item => !existingIds.has(item.id));
      
      return {
        occurrences: [...itemsToAdd, ...state.occurrences]
      };
    });
  },

  // CRIAR (POST)
  createOccurrence: async (data) => {
    try {
      const response = await api.post('/occurrences', data);

      const createdOccurrence =
        (response.data?.success && response.data?.data) ||
        response.data?.data ||
        response.data;

      if (createdOccurrence && createdOccurrence.id) {
        const normalizedCreated = {
          ...createdOccurrence,
          authorId: createdOccurrence.user_id || createdOccurrence.authorId,
          createdAt: createdOccurrence.created_at
            ? new Date(createdOccurrence.created_at).toLocaleString('pt-BR')
            : createdOccurrence.createdAt,
        };

        set((state) => ({
          occurrences: [normalizedCreated, ...state.occurrences]
        }));

        const userId = getCurrentUserIdFromStorage();
        if (userId) {
          addCreatedThisShiftOccurrenceId(userId, String(createdOccurrence.id));
        }
      }
    } catch (err) {
      console.error('Erro ao criar ocorrência:', err);
      throw err;
    }
  },

  // ATUALIZAR (PUT)
  updateOccurrence: async (id, patch) => {
    try {
      // 1. Atualiza no Banco
      await api.put(`/occurrences/${id}`, patch);
      
      // 2. Atualiza visualmente na tela sem precisar recarregar tudo
      set((state) => ({
        occurrences: state.occurrences.map(o =>
          o.id === id ? { ...o, ...patch } : o
        )
      }));
    } catch (err) {
      console.error('Erro ao atualizar:', err);
      throw err;
    }
  },

  // EXCLUIR (DELETE)
  deleteOccurrence: async (id) => {
    try {
      await api.delete(`/occurrences/${id}`);
      set((state) => ({
        occurrences: state.occurrences.filter(o => o.id !== id)
      }));
    } catch (err) {
      console.error('Erro ao excluir:', err);
      throw err;
    }
  },

  reset: () => set({ occurrences: [], isLoading: false }),
}));