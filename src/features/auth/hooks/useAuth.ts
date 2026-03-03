import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { type UserRole, type AuthState } from '../types/index';

// Importe a store de ocorrências para poder resetá-la
import { useOccurrenceStore } from '@/features/occurrences/stores/useOccurrenceStore';

// URL base da sua API (O ideal é colocar isso num arquivo .env como import.meta.env.VITE_API_URL)
const API_URL = 'http://localhost:8000/api';

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
          const response = await fetch(`${API_URL}/login`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json'
            },
            body: JSON.stringify({ email, password })
          });

          const data = await response.json();

          if (!response.ok) {
            // Lança o erro vindo direto do Laravel (ex: "Email ou senha inválidos.")
            throw new Error(data.message || 'Erro de autenticação'); 
          }

          set({
            user: data.usuario,
            token: data.token,
            isAuthenticated: true,
            isLoading: false,
          });

        } catch (error) {
          set({ isLoading: false });
          throw error; 
        }
      },

      verify2FA: (code: string) => {
        // Mantenha sua lógica de 2FA aqui
        if (code === '123456') {
          return true;
        }
        return false;
      },

      selectRole: (role: UserRole) => set({ role }),
      selectTable: (table) => set({ table }),

      logout: async () => {
        const { token, user } = get();

        // 1. Invalida o token no Laravel
        if (token) {
          try {
            await fetch(`${API_URL}/logout`, {
              method: 'POST',
              headers: {
                'Accept': 'application/json',
                'Authorization': `Bearer ${token}`
              }
            });
          } catch (e) {
            console.error('Erro ao comunicar logout ao servidor:', e);
          }
        }

        // 2. Limpa a "memória" de que o usuário já viu o modal
        if (user?.id) {
            sessionStorage.removeItem(`handover_viewed_${user.id}`);
            sessionStorage.removeItem(`inherited_viewed_${user.id}`);
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
        token: state.token, // Salva o token para sobreviver ao F5
        role: state.role, 
        table: state.table,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);