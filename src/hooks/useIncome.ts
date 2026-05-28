import { useState, useEffect, useCallback } from 'react';
import { apiCall } from '@/lib/api';
import type { Income, IncomeCreate } from '@/types';

export function useIncome(mes?: number, ano?: number) {
  const [incomes, setIncomes] = useState<Income[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = mes && ano ? `?mes=${mes}&ano=${ano}` : '';
      const data = await apiCall<Income[]>(`/api/income/${params}`);
      setIncomes(data ?? []);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [mes, ano]);

  const create = async (income: IncomeCreate) => {
    const result = await apiCall<Income>('/api/income/', {
      method: 'POST',
      body: JSON.stringify(income),
    });
    setIncomes((prev) => [result, ...prev]);
    return result;
  };

  const remove = async (id: number) => {
    await apiCall(`/api/income/${id}`, { method: 'DELETE' });
    setIncomes((prev) => prev.filter((i) => i.id !== id));
  };

  useEffect(() => { fetch(); }, [fetch]);

  return { incomes, loading, error, create, remove, refetch: fetch };
}
