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
  loadData: () => Promise<void>;
};

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
  loadData: async () => {
    set({ isLoading: true, loadError: null });

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
  },
}));
