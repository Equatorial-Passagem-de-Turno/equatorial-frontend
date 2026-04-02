import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { MOCK_OCCURRENCES } from '../../../mocks/data';
import { type Occurrence } from '../types/index';

interface OccurrenceState {
  occurrences: Occurrence[];
  addOccurrences: (newItems: Occurrence[]) => void;
  isLoading: boolean;                  
  fetchOccurrences: () => Promise<void>; 
  updateOccurrence: (id: string, patch: Partial<Occurrence>) => void;
  reset: () => void;
}

export const useOccurrenceStore = create<OccurrenceState>()(
  persist(
    (set) => ({
      occurrences: MOCK_OCCURRENCES,
      isLoading: false,

      fetchOccurrences: async () => {
        set({ isLoading: true });

        try {
          const res = await fetch('/api/occurrences'); // ajuste conforme seu backend
          const data = await res.json();

          set({
            occurrences: data,
            isLoading: false
          });
        } catch (err) {
          console.error('Erro ao carregar ocorrências', err);
          set({ isLoading: false });
        }
      },

      addOccurrences: (newItems) =>
        set((state) => ({
          occurrences: [...newItems, ...state.occurrences],
        })),

      updateOccurrence: (id, patch) =>
        set((state) => ({
          occurrences: state.occurrences.map(o =>
            o.id === id ? { ...o, ...patch } : o
          )
        })),

      reset: () => set({ occurrences: MOCK_OCCURRENCES }),
    }),
    {
      name: 'occurrence-storage',
      storage: createJSONStorage(() => sessionStorage),
    }
  )
);
