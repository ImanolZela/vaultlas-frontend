import { useState, useEffect, useCallback } from 'react';
import { apiCall } from '@/lib/api';
import type { ReconciliationReport, ReconciliationItem } from '@/types';

export function useReconciliation(mes: number, ano: number) {
  const [report, setReport] = useState<ReconciliationReport | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiCall<ReconciliationReport>(`/api/reconciliation/${mes}/${ano}`);
      setReport(data);
    } catch {
      setReport(null);
    } finally {
      setLoading(false);
    }
  }, [mes, ano]);

  const start = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiCall<ReconciliationReport>(`/api/reconciliation/${mes}/${ano}/start`, {
        method: 'POST',
      });
      setReport(data);
      return data;
    } catch (e: any) {
      setError(e.message);
      throw e;
    } finally {
      setLoading(false);
    }
  };

  const categorizeItem = async (
    itemId: number,
    payload: { status: string; user_bucket?: string; user_category?: string }
  ) => {
    const updated = await apiCall<ReconciliationItem>(`/api/reconciliation/item/${itemId}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
    setReport((prev) =>
      prev
        ? { ...prev, items: prev.items.map((it) => (it.id === updated.id ? updated : it)) }
        : prev
    );
    return updated;
  };

  const complete = async () => {
    const data = await apiCall<ReconciliationReport>(`/api/reconciliation/${mes}/${ano}/complete`, {
      method: 'POST',
    });
    setReport(data);
    return data;
  };

  useEffect(() => { fetch(); }, [fetch]);

  return { report, loading, error, start, categorizeItem, complete, refetch: fetch };
}
