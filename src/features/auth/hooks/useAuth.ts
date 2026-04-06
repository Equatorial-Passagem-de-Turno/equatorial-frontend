import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { type UserRole, type AuthState } from '../types/index';
import { api } from '@/services/api';
import axios from 'axios';

// Importe a store de ocorrências para poder resetá-la
import { useOccurrenceStore } from '@/features/occurrences/stores/useOccurrenceStore';

export const useAuth = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      role: null,
      table: null,
      
      isAuthenticated: false,
      isLoading: false,
      requires2FA: false,

      login: async (email: string, password: string) => {
        set({ isLoading: true });

        try {
          const response = await api.post('/login', { email, password });
          const data = response.data;
          const activeShift = data?.active_shift;
          const hasActiveShift = Boolean(activeShift);

        const accountRole = String(data?.usuario?.role || '').toLowerCase();
        const isSupervisor = accountRole === 'supervisor';
        const operatorRoleFromShift = activeShift?.role
          ? String(activeShift.role)
          : (data?.usuario?.voltage_level ? String(data.usuario.voltage_level) : null);

        set({
          user: data.usuario,
          token: data.token,
          isAuthenticated: true,
          isLoading: false,
          // Supervisor entra direto no dashboard geral de supervisão.
          // Operador com turno ativo retorna direto para a home (sem iniciar novo turno).
          role: isSupervisor
            ? 'supervisor'
            : hasActiveShift
              ? operatorRoleFromShift
              : null,
          table: (isSupervisor || hasActiveShift) ? (activeShift?.desk || null) : null,
        });

        } catch (error) {
          let message = 'Erro de autenticação';

          if (axios.isAxiosError(error)) {
            message = error.response?.data?.message || message;
          } else if (error instanceof Error) {
            message = error.message;
          }

          set({ isLoading: false });
          throw new Error(message); 
        }
      },

      selectRole: (role: UserRole | null) => set((state) => ({ 
        role: role, 
        table: role === null ? null : state.table 
      })),
      selectTable: (table) => set({ table }),

      logout: async () => {
        const { user } = get();

        // 1. Invalida o token no Laravel
        try {
          await api.post('/logout');
        } catch (e) {
          console.error('Erro ao comunicar logout ao servidor:', e);
        }

        // 2. Limpa a "memória" de que o usuário já viu o modal
        if (user?.id) {
            sessionStorage.removeItem(`handover_viewed_${user.id}`);
            sessionStorage.removeItem(`inherited_viewed_${user.id}`);
          localStorage.removeItem(`shift_finish_locked_${user.id}`);
          localStorage.removeItem(`shift_finish_snapshot_${user.id}`);
          window.dispatchEvent(new Event('shift-lock-changed'));
        }

        // 3. Limpa as ocorrências herdadas
        useOccurrenceStore.getState().reset();

        // 4. Limpa o estado de Autenticação no Zustand
        set({ 
          user: null, 
          token: null,
          role: null, 
          table: null,  
          isAuthenticated: false,
        });
        
        // 5. Limpa o LocalStorage
        localStorage.removeItem('auth-storage');
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ 
        user: state.user, 
        token: state.token,
        role: state.role, 
        table: state.table,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);