// Definição dos Tipos
export interface User {
  id: string;
  name: string;
  email: string;
  password?: string;
  avatar?: string;
}

export type UserRole = 'bt' | 'mt' | 'at' | 'pre_op' | 'admin' | null;
export type OperationTable = string | null;

export interface AuthState {
  user: User | null;
  token: string | null; 
  role: UserRole | null;
  table: OperationTable | null; 
  isAuthenticated: boolean;
  isLoading: boolean;

  login: (email: string, password: string) => Promise<void>;
  selectRole: (role: UserRole) => void;
  selectTable: (tableId: string) => void;
  logout: () => Promise<void>; 
}