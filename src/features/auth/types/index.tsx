// Definição dos Tipos
export interface User {
  id: string;
  name: string;
  email: string;
  password?: string;
  avatar?: string;
}

export type UserRole = 'bt' | 'mt' | 'at' | 'pre_op' | 'supervisor' | null;
export type OperationTable = string | null;

export interface AuthState {
  user: User | null;
  role: UserRole | null;
  table: OperationTable | null; 
  selectTable: (tableId: string) => void;
  isAuthenticated: boolean;
  isLoading: boolean;

  login: (email: string, password: string) => Promise<void>;
  selectRole: (role: UserRole) => void;
  logout: () => void;

  verify2FA: (code: string) => boolean;
}