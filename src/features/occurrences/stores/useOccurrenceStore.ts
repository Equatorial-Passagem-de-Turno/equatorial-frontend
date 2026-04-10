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
  hydratedAt: number | null;
  fetchOccurrences: (options?: { force?: boolean; silent?: boolean }) => Promise<void>;
  createOccurrence: (data: Partial<Occurrence>) => Promise<void>; // NOVO
  updateOccurrence: (id: string, patch: Partial<Occurrence>) => Promise<void>; // ATUALIZADO
  deleteOccurrence: (id: string) => Promise<void>; // NOVO
  addOccurrences: (newItems: Occurrence[]) => void;
  reset: () => void;
}

const OCCURRENCES_CACHE_TTL_MS = 45_000;
let occurrencesInFlight: Promise<void> | null = null;
let emptyFetchRetryScheduled = false;

export const useOccurrenceStore = create<OccurrenceState>((set) => ({
  occurrences: [],
  isLoading: false,
  hydratedAt: null,

  // LISTAR (GET)
  fetchOccurrences: async (options) => {
    const force = Boolean(options?.force);
    const silent = Boolean(options?.silent);
    const state = useOccurrenceStore.getState();
    const isFresh = Boolean(state.hydratedAt) && (Date.now() - Number(state.hydratedAt) < OCCURRENCES_CACHE_TTL_MS);

    if (!force && isFresh) {
      return;
    }

    if (!force && occurrencesInFlight) {
      return occurrencesInFlight;
    }

    const shouldShowBlockingLoader = !silent && state.occurrences.length === 0;
    if (shouldShowBlockingLoader) {
      set({ isLoading: true });
    }

    occurrencesInFlight = (async () => {
    try {
      const response = await api.get('/occurrences');
      // Mapeamento opcional: Se o Laravel manda user_id e o React espera authorId
      const mappedData = response.data.map((occ: any) => ({
        ...occ,
        authorId: occ.user_id || occ.authorId, // Normaliza o ID do autor
        createdAt: occ.created_at ? new Date(occ.created_at).toLocaleString('pt-BR') : occ.createdAt
      }));

      const currentItems = useOccurrenceStore.getState().occurrences;

      if (mappedData.length === 0 && currentItems.length > 0) {
        // Mantem dados atuais quando o backend retorna vazio temporariamente.
        set({ hydratedAt: Date.now(), isLoading: false });
        return;
      }

      if (mappedData.length === 0 && currentItems.length === 0 && !emptyFetchRetryScheduled) {
        emptyFetchRetryScheduled = true;
        window.setTimeout(() => {
          emptyFetchRetryScheduled = false;
          void useOccurrenceStore.getState().fetchOccurrences({ force: true, silent: true });
        }, 1500);
      }
      
      set({ occurrences: mappedData, hydratedAt: Date.now(), isLoading: false });
    } catch (err) {
      const currentItems = useOccurrenceStore.getState().occurrences;

      if (currentItems.length > 0) {
        // Em erro transitório, preserva o ultimo snapshot ao inves de piscar vazio.
        set({ hydratedAt: Date.now(), isLoading: false });
      } else {
        set({ isLoading: false });
      }

      if (!emptyFetchRetryScheduled) {
        emptyFetchRetryScheduled = true;
        window.setTimeout(() => {
          emptyFetchRetryScheduled = false;
          void useOccurrenceStore.getState().fetchOccurrences({ force: true, silent: true });
        }, 2000);
      }
    }
    })().finally(() => {
      occurrencesInFlight = null;
    });

    return occurrencesInFlight;
  },

  addOccurrences: (newItems) => {
    set((state) => {
      const existingIds = new Set(state.occurrences.map(o => o.id));
      const itemsToAdd = newItems.filter(item => !existingIds.has(item.id));
      
      return {
        occurrences: [...itemsToAdd, ...state.occurrences],
        hydratedAt: Date.now(),
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

        set({ hydratedAt: Date.now() });

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
      set({ hydratedAt: Date.now() });
    } catch (err) {
      console.error('Erro ao excluir:', err);
      throw err;
    }
  },

  reset: () => set({ occurrences: [], isLoading: false, hydratedAt: null }),
}));