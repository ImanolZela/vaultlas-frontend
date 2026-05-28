import { useState, useEffect, useCallback } from 'react';
import { apiCall } from '@/lib/api';

interface MonthSummary {
  month: string;
  total_income: number;
  total_needs: number;
  total_wants: number;
  total_savings: number;
  total_debt: number;
  net: number;
}

interface AnnualSummary {
  year: number;
  total_income: number;
  total_expenses: number;
  total_savings: number;
  net: number;
  months: MonthSummary[];
}

export function useAnnualSummary(year: number) {
  const [summary, setSummary] = useState<AnnualSummary | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiCall<AnnualSummary>(`/api/annual/${year}`);
      setSummary(data);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [year]);

  useEffect(() => { fetch(); }, [fetch]);

  return { summary, loading, error, refetch: fetch };
}
