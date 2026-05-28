import { useState, useEffect, useCallback } from 'react';
import { apiCall } from '@/lib/api';
import type { MonthlyBudget } from '@/types';

export function useBudget(mes: number, ano: number) {
  const [budget, setBudget] = useState<MonthlyBudget | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiCall<MonthlyBudget>(`/api/budget/${mes}/${ano}`);
      setBudget(data);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [mes, ano]);

  const save = async (data: {
    month: string;
    needs_percent: number;
    wants_percent: number;
    savings_percent: number;
    debt_amount: number;
  }) => {
    const result = await apiCall<MonthlyBudget>('/api/budget/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    setBudget(result);
    return result;
  };

  useEffect(() => { fetch(); }, [fetch]);

  return { budget, loading, error, save, refetch: fetch };
}
