// Definição dos Tipos
export interface User {
  id: string;
  name: string;
  table: string;
  email: string;
  password?: string;
  avatar?: string;
}
export interface Table {
  id: string;
  name: string;
  code: string;
}

export type UserRole = string;
export type OperationTable = Table | null;

export interface AuthState {
  user: User | null;
  token: string | null; 
  role: UserRole | null;
  table: OperationTable; 
  isAuthenticated: boolean;
  isLoading: boolean;

  login: (email: string, password: string) => Promise<void>;
  selectRole: (role: UserRole | null) => void;
  selectTable: (table: OperationTable) => void;
  logout: () => Promise<void>; 
}