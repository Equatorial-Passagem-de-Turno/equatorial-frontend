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
  isUsingCachedData: boolean;
  setData: (payload: {
    operators: Operator[];
    occurrences: Occurrence[];
    activities: AtividadeRecente[];
  }) => void;
  loadData: (options?: { force?: boolean }) => Promise<void>;
};

const SUPERVISOR_CACHE_TTL_MS = 60_000;
const SUPERVISOR_STORAGE_KEY = 'supervisor-dashboard-cache-v1';
const MAX_RETRY_ATTEMPTS = 1;
let supervisorInFlight: Promise<void> | null = null;
let retryAttempts = 0;

const readStoredSnapshot = (): {
  operators: Operator[];
  occurrences: Occurrence[];
  activities: AtividadeRecente[];
  hydratedAt: number | null;
} => {
  if (typeof window === 'undefined') {
    return { operators: [], occurrences: [], activities: [], hydratedAt: null };
  }

  try {
    const raw = window.localStorage.getItem(SUPERVISOR_STORAGE_KEY);
    if (!raw) {
      return { operators: [], occurrences: [], activities: [], hydratedAt: null };
    }

    const parsed = JSON.parse(raw) as Partial<{
      operators: Operator[];
      occurrences: Occurrence[];
      activities: AtividadeRecente[];
      hydratedAt: number;
    }>;

    return {
      operators: Array.isArray(parsed.operators) ? parsed.operators : [],
      occurrences: Array.isArray(parsed.occurrences) ? parsed.occurrences : [],
      activities: Array.isArray(parsed.activities) ? parsed.activities : [],
      hydratedAt: typeof parsed.hydratedAt === 'number' ? parsed.hydratedAt : null,
    };
  } catch {
    return { operators: [], occurrences: [], activities: [], hydratedAt: null };
  }
};

const persistSnapshot = (payload: {
  operators: Operator[];
  occurrences: Occurrence[];
  activities: AtividadeRecente[];
  hydratedAt: number;
}) => {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    window.localStorage.setItem(SUPERVISOR_STORAGE_KEY, JSON.stringify(payload));
  } catch {
    // Ignora erros de quota/storage para nao quebrar a UI.
  }
};

const initialSnapshot = readStoredSnapshot();

export const useSupervisorStore = create<SupervisorState>((set) => ({
  operators: initialSnapshot.operators,
  occurrences: initialSnapshot.occurrences,
  activities: initialSnapshot.activities,
  hydratedAt: initialSnapshot.hydratedAt,
  isLoading: false,
  loadError: null,
  isUsingCachedData: false,
  setData: (payload) =>
    set(() => {
      const hydratedAt = Date.now();
      persistSnapshot({
        operators: payload.operators,
        occurrences: payload.occurrences,
        activities: payload.activities,
        hydratedAt,
      });

      return {
        operators: payload.operators,
        occurrences: payload.occurrences,
        activities: payload.activities,
        hydratedAt,
        loadError: null,
        isUsingCachedData: false,
      };
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
        const hydratedAt = Date.now();
        retryAttempts = 0;

        persistSnapshot({
          operators: payload.operators,
          occurrences: payload.occurrences,
          activities: payload.activities,
          hydratedAt,
        });

        set({
          operators: payload.operators,
          occurrences: payload.occurrences,
          activities: payload.activities,
          hydratedAt,
          isLoading: false,
          loadError: null,
          isUsingCachedData: false,
        });
      } catch {
        const current = useSupervisorStore.getState();
        const hasExistingData =
          current.operators.length > 0 ||
          current.occurrences.length > 0 ||
          current.activities.length > 0;

        if (hasExistingData) {
          set({
            isLoading: false,
            loadError: null,
            hydratedAt: current.hydratedAt ?? Date.now(),
            isUsingCachedData: true,
          });

          if (retryAttempts < MAX_RETRY_ATTEMPTS) {
            retryAttempts += 1;
            window.setTimeout(() => {
              void useSupervisorStore.getState().loadData({ force: true });
            }, 2500);
          }
        } else {
          set({
            operators: [],
            occurrences: [],
            activities: [],
            hydratedAt: null,
            isLoading: false,
            loadError: 'Nao foi possivel carregar os dados do supervisor.',
            isUsingCachedData: false,
          });
        }
      }
    })().finally(() => {
      supervisorInFlight = null;
    });

    return supervisorInFlight;
  },
}));
