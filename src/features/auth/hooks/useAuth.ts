import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { type UserRole, type AuthState } from "../types/index";

// 1. IMPORTANTE: Importe a store de ocorrências para poder resetá-la
import { useOccurrenceStore } from "@/features/occurrences/stores/useOccurrenceStore";

const MOCK_USERS: Record<string, { role: UserRole; name: string; id: string }> =
  {
    "operador@equatorial.com": {
      role: null,
      name: "João",
      id: "user-op-1",
    },
    "supervisor@equatorial.com": {
      role: "supervisor",
      name: "Maria Supervisora",
      id: "user-sup-1",
    },
  };

export const useAuth = create<AuthState>()(
  persist(
    (set, get) => ({
      // --- Estados Iniciais ---
      user: null,
      role: null,
      table: null,

      isAuthenticated: false,
      isLoading: false,
      requires2FA: false,
      is2FAVerified: false,

      // --- Actions ---

      login: async (email: string, password: string) => {
        set({ isLoading: true });

        return new Promise<void>((resolve, reject) => {
          setTimeout(() => {
            // ... (Lógica de validação de senha e usuário igual ao anterior) ...

            // Mock para exemplo (copie sua lógica completa de login aqui)
            if (password !== "123456") {
              set({ isLoading: false });
              reject(new Error("Senha incorreta."));
              return;
            }

            // ... Validação de roles ...
            // ... Definição do objeto user ...

            // Exemplo simplificado do sucesso:
            const mockUser = MOCK_USERS[email.toLowerCase()];

            if (!mockUser) {
              set({ isLoading: false });
              reject(new Error("Usuário não encontrado."));
              return;
            }

            if (mockUser.role === "supervisor") {
              // Supervisor já entra direto
              set({
                user: {
                  id: mockUser.id,
                  name: mockUser.name,
                  email,
                },
                role: "supervisor",
                isAuthenticated: true,
                isLoading: false,
              });
            } else {
              // Operador entra sem role definido ainda
              set({
                user: {
                  id: mockUser.id,
                  name: mockUser.name,
                  email,
                },
                role: null, // 👈 IMPORTANTE
                isAuthenticated: true,
                isLoading: false,
              });
            }

            resolve();
          }, 1000);
        });
      },

      verify2FA: (code: string) => {
        if (code === "123456") {
          return true;
        }
        return false;
      },

      selectRole: (role: UserRole) => set({ role }),
      selectTable: (table) => set({ table }),

      // --- AQUI ESTÁ A MUDANÇA SOLICITADA ---
      logout: () => {
        const currentUser = get().user;

        // 1. Limpa a "memória" de que o usuário já viu o modal de passagem de turno
        if (currentUser?.id) {
          sessionStorage.removeItem(`handover_viewed_${currentUser.id}`);
          // Remove também a chave antiga caso tenha ficado lixo
          sessionStorage.removeItem(`inherited_viewed_${currentUser.id}`);
        }

        // 2. Limpa as ocorrências herdadas (Reseta a lista para o padrão inicial)
        // Acessamos a store diretamente sem precisar de hook
        useOccurrenceStore.getState().reset();

        // 3. Limpa o estado de Autenticação
        set({
          user: null,
          role: null,
          table: null,
          isAuthenticated: false,
        });

        // 4. Limpa o LocalStorage da Auth
        localStorage.removeItem("auth-storage");
      },
    }),
    {
      name: "auth-storage",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        user: state.user,
        role: state.role,
        table: state.table,
        isAuthenticated: state.isAuthenticated,
      }),
    },
  ),
);
