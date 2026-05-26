export interface User {
  id: number;
  email: string;
}

export interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (user: User, token: string) => void;
  logout: () => void;
}

export interface VaultDocument {
  id: number;
  filename: string;
  status: 'pending' | 'done' | 'error';
  periodo: string | null;
  created_at: string;
}

export interface Movement {
  id: number;
  fecha: string;
  descripcion: string;
  codigo_operacion: string | null;
  monto: number;
  tipo: 'ingreso' | 'egreso';
  confirmed: boolean;
  created_at: string;
}

export interface MonthlyReport {
  mes: number;
  ano: number;
  total_ingresos: number;
  total_egresos: number;
  neto: number;
  meta_ingresos: number | null;
  cumplimiento_porcentaje: number | null;
}

export interface Goal {
  id: number;
  mes: number;
  ano: number;
  meta_ingresos: number;
}

export type DocumentStatus = 'pending' | 'done' | 'error';
export type MovementType = 'ingreso' | 'egreso';
