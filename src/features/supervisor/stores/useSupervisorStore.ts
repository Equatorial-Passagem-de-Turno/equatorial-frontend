import { create } from 'zustand';
import type { Operator, Occurrence } from '../types/index.ts';
import type { AtividadeRecente } from '../types/index.ts';
import { fetchSupervisorData } from '../services/supervisorService';

type SupervisorState = {
  operators: Operator[];
  occurrences: Occurrence[];
  activities: AtividadeRecente[];
  hydratedAt: number | null;
  isLoading: boolean;
  loadError: string | null;
  setData: (payload: {
    operators: Operator[];
    occurrences: Occurrence[];
    activities: AtividadeRecente[];
  }) => void;
  loadData: (options?: { force?: boolean }) => Promise<void>;
};

const SUPERVISOR_CACHE_TTL_MS = 60_000;
let supervisorInFlight: Promise<void> | null = null;

export const useSupervisorStore = create<SupervisorState>((set) => ({
  operators: [],
  occurrences: [],
  activities: [],
  hydratedAt: null,
  isLoading: false,
  loadError: null,
  setData: (payload) =>
    set({
      operators: payload.operators,
      occurrences: payload.occurrences,
      activities: payload.activities,
      hydratedAt: Date.now(),
      loadError: null,
    }),
  loadData: async (options) => {
    const force = Boolean(options?.force);
    const state = useSupervisorStore.getState();
    const isFresh = Boolean(state.hydratedAt) && (Date.now() - Number(state.hydratedAt) < SUPERVISOR_CACHE_TTL_MS);

    if (!force && isFresh) {
      return;
    }

    if (!force && supervisorInFlight) {
      return supervisorInFlight;
    }

    const shouldShowBlockingLoader = state.operators.length === 0 && state.occurrences.length === 0;
    if (shouldShowBlockingLoader) {
      set({ isLoading: true, loadError: null });
    }

    supervisorInFlight = (async () => {
      try {
        const payload = await fetchSupervisorData();
        set({
          operators: payload.operators,
          occurrences: payload.occurrences,
          activities: payload.activities,
          hydratedAt: Date.now(),
          isLoading: false,
          loadError: null,
        });
      } catch {
        set({
          operators: [],
          occurrences: [],
          activities: [],
          hydratedAt: null,
          isLoading: false,
          loadError: 'Nao foi possivel carregar os dados do supervisor.',
        });
      }
    })().finally(() => {
      supervisorInFlight = null;
    });

    return supervisorInFlight;
  },
}));
