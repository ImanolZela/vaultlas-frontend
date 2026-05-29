import { useState, useEffect, useCallback } from 'react';
import { apiCall } from '@/lib/api';
import type { Expense, ExpenseCreate, ExpenseFixedMonthly, ExpenseFixedMonthlyCreate } from '@/types';

export function useExpense(mes?: number, ano?: number) {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [fixedExpenses, setFixedExpenses] = useState<ExpenseFixedMonthly[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = mes && ano ? `?mes=${mes}&ano=${ano}` : '';
      const [exp, fixed] = await Promise.all([
        apiCall<Expense[]>(`/api/expense/${params}`),
        apiCall<ExpenseFixedMonthly[]>('/api/expense/fixed/'),
      ]);
      setExpenses(exp ?? []);
      setFixedExpenses(fixed ?? []);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [mes, ano]);

  const create = async (expense: ExpenseCreate) => {
    const result = await apiCall<Expense>('/api/expense/', {
      method: 'POST',
      body: JSON.stringify(expense),
    });
    setExpenses((prev) => [result, ...prev]);
    return result;
  };

  const remove = async (id: number) => {
    await apiCall(`/api/expense/${id}`, { method: 'DELETE' });
    setExpenses((prev) => prev.filter((e) => e.id !== id));
  };

  const createFixed = async (data: ExpenseFixedMonthlyCreate) => {
    const result = await apiCall<ExpenseFixedMonthly>('/api/expense/fixed/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    setFixedExpenses((prev) => [result, ...prev]);
    return result;
  };

  const removeFixed = async (id: number) => {
    await apiCall(`/api/expense/fixed/${id}`, { method: 'DELETE' });
    setFixedExpenses((prev) => prev.filter((f) => f.id !== id));
  };

  useEffect(() => { fetch(); }, [fetch]);

  return { expenses, fixedExpenses, loading, error, create, remove, createFixed, removeFixed, refetch: fetch };
}
