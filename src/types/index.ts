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

// ─── NUEVOS TIPOS: SISTEMA 50-30-20 ───────────────────────────

export type IncomType =
  | 'salary'
  | 'bonus'
  | 'gift'
  | 'freelance'
  | 'loan'
  | 'sale'
  | 'other';

export type BudgetBucket = 'needs' | 'wants' | 'savings' | 'debt';

export type PaymentMethod = 'card' | 'cash' | 'transfer' | 'other';

export interface Income {
  id: number;
  user_id: number;
  date: string;
  type: IncomType;
  description: string;
  amount: number;
  is_recurring: boolean;
  recurring_day?: number;
  recurring_month_from?: string;
  recurring_month_to?: string;
  created_at: string;
  updated_at: string;
}

export interface IncomeCreate {
  date: string;
  type: IncomType;
  description: string;
  amount: number;
  is_recurring?: boolean;
  recurring_day?: number;
  recurring_month_from?: string;
  recurring_month_to?: string;
}

export interface Expense {
  id: number;
  user_id: number;
  date: string;
  amount: number;
  bucket: BudgetBucket;
  category_name: string;
  description: string;
  payment_method?: PaymentMethod;
  receipt_image_url?: string;
  created_at: string;
  updated_at: string;
}

export interface ExpenseCreate {
  date: string;
  amount: number;
  bucket: BudgetBucket;
  category_name: string;
  description: string;
  payment_method?: PaymentMethod;
}

export interface ExpenseFixedMonthly {
  id: number;
  user_id: number;
  name: string;
  category_name: string;
  bucket: BudgetBucket;
  amount: number;
  day_of_month: number;
  is_active: boolean;
  start_date: string;
  end_date?: string;
  created_at: string;
  updated_at: string;
}

export interface MonthlyBudget {
  id: number;
  user_id: number;
  month: string;
  total_income: number;
  needs_percent: number;
  wants_percent: number;
  savings_percent: number;
  debt_amount: number;
  budgeted_needs: number;
  budgeted_wants: number;
  budgeted_savings: number;
  actual_needs: number;
  actual_wants: number;
  actual_savings: number;
  actual_debt: number;
  status: 'draft' | 'active' | 'closed';
  pdf_received_date?: string;
  created_at: string;
  updated_at: string;
}

export interface ReconciliationItem {
  id: number;
  report_id: number;
  pdf_date: string;
  pdf_description: string;
  pdf_amount: number;
  status: 'pending' | 'categorized' | 'ignored';
  suggested_bucket?: BudgetBucket;
  user_bucket?: BudgetBucket;
  user_category?: string;
  created_at: string;
}

export interface ReconciliationReport {
  id: number;
  month: string;
  status: 'pending' | 'in_progress' | 'completed';
  total_unmatched: number;
  total_categorized: number;
  income_difference: number;
  expense_difference: number;
  items: ReconciliationItem[];
  created_at: string;
  completed_at?: string;
}
