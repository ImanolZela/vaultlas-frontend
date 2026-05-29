import { useState } from 'react';
import { DashboardLayout } from '@/components/templates/DashboardLayout';
import { Card } from '@/components/atoms/Card';
import { Button } from '@/components/atoms/Button';
import { Spinner } from '@/components/atoms/Spinner';
import { useReconciliation } from '@/hooks/useReconciliation';
import { formatCurrency } from '@/lib/utils';
import type { BudgetBucket } from '@/types';

const MONTHS = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];

const BUCKET_META: Record<BudgetBucket, { label: string; color: string }> = {
  needs:   { label: 'Necesidades', color: 'rgba(100,180,255,0.8)' },
  wants:   { label: 'Gustos',      color: 'rgba(255,160,100,0.8)' },
  savings: { label: 'Ahorros',     color: 'rgba(100,230,180,0.8)' },
  debt:    { label: 'Deuda',       color: 'rgba(255,100,100,0.8)' },
};

const CATEGORIES: Record<BudgetBucket, string[]> = {
  needs:   ['Mercado', 'Alquiler', 'Transporte', 'Salud', 'Servicios', 'Educación', 'Otro'],
  wants:   ['Restaurante', 'Entretenimiento', 'Ropa', 'Viajes', 'Café', 'Suscripciones', 'Otro'],
  savings: ['Ahorro mensual', 'Inversión', 'Fondo de emergencia', 'Otro'],
  debt:    ['Tarjeta de crédito', 'Préstamo personal', 'Préstamo a persona', 'Otro'],
};

export default function ReconciliationPage() {
  const now = new Date();
  const [mes, setMes] = useState(now.getMonth() + 1);
  const [ano, setAno] = useState(now.getFullYear());
  const [completing, setCompleting] = useState(false);
  const { report, loading, error, start, categorizeItem, complete } = useReconciliation(mes, ano);

  const [editing, setEditing] = useState<Record<number, { bucket: BudgetBucket; category: string }>>({});

  const pendingItems = report?.items.filter((i) => i.status === 'pending') ?? [];
  const categorizedItems = report?.items.filter((i) => i.status === 'categorized') ?? [];
  const ignoredItems = report?.items.filter((i) => i.status === 'ignored') ?? [];
  const allResolved = pendingItems.length === 0 && report !== null;

  const handleStart = async () => {
    try { await start(); } catch {}
  };

  const handleCategorize = async (itemId: number) => {
    const e = editing[itemId];
    if (!e) return;
    await categorizeItem(itemId, { status: 'categorized', user_bucket: e.bucket, user_category: e.category });
    setEditing((prev) => { const n = { ...prev }; delete n[itemId]; return n; });
  };

  const handleIgnore = async (itemId: number) => {
    await categorizeItem(itemId, { status: 'ignored' });
  };

  const handleComplete = async () => {
    setCompleting(true);
    try { await complete(); } finally { setCompleting(false); }
  };

  const startEdit = (itemId: number, defaultBucket: BudgetBucket = 'needs') => {
    setEditing((prev) => ({
      ...prev,
      [itemId]: prev[itemId] ?? { bucket: defaultBucket, category: CATEGORIES[defaultBucket][0] },
    }));
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <p className="font-mono text-[10px] tracking-[0.2em] uppercase mb-1"
               style={{ color: 'rgba(204,255,0,0.55)' }}>Análisis</p>
            <h1 className="text-2xl font-bold text-white">Reconciliación</h1>
          </div>
          <div className="flex items-center gap-2">
            <select value={mes} onChange={(e) => setMes(Number(e.target.value))}
              className="rounded-md px-2 py-1.5 text-white text-sm outline-none"
              style={{ background: 'rgba(20,20,20,0.95)', border: '1px solid rgba(255,255,255,0.1)' }}>
              {MONTHS.map((m, i) => <option key={i} value={i+1}>{m.slice(0,3)}</option>)}
            </select>
            <select value={ano} onChange={(e) => setAno(Number(e.target.value))}
              className="rounded-md px-2 py-1.5 text-white text-sm outline-none"
              style={{ background: 'rgba(20,20,20,0.95)', border: '1px solid rgba(255,255,255,0.1)' }}>
              {[ano-1, ano, ano+1].map((y) => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-16"><Spinner size="lg" /></div>
        ) : error ? (
          <p className="text-center py-8 text-sm" style={{ color: 'rgba(255,100,100,0.8)' }}>{error}</p>
        ) : !report ? (
          <Card title="Iniciar reconciliación">
            <div className="space-y-4">
              <div className="space-y-3 text-sm" style={{ color: 'rgba(255,255,255,0.6)' }}>
                <div className="flex items-start gap-3">
                  <span style={{ color: 'var(--neon)' }}>1.</span>
                  <span>El sistema compara los gastos e ingresos que registraste manualmente con los movimientos del PDF del BCP.</span>
                </div>
                <div className="flex items-start gap-3">
                  <span style={{ color: 'var(--neon)' }}>2.</span>
                  <span>Los movimientos del PDF que no tienen match manual aparecen como pendientes para categorizar.</span>
                </div>
                <div className="flex items-start gap-3">
                  <span style={{ color: 'var(--neon)' }}>3.</span>
                  <span>Asigna cada uno a un bucket y cierra el mes.</span>
                </div>
              </div>
              <Button variant="primary" onClick={handleStart} loading={loading}>
                Iniciar reconciliación — {MONTHS[mes-1]} {ano}
              </Button>
            </div>
          </Card>
        ) : (
          <>
            {/* Summary */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { label: 'Sin match', value: report.total_unmatched, color: 'rgba(255,200,80,0.8)' },
                { label: 'Categorizados', value: report.total_categorized, color: 'rgba(100,230,180,0.8)' },
                { label: 'Dif. ingresos', value: formatCurrency(Math.abs(report.income_difference)), color: report.income_difference !== 0 ? 'rgba(255,100,100,0.8)' : 'rgba(100,230,180,0.8)' },
                { label: 'Dif. gastos', value: formatCurrency(Math.abs(report.expense_difference)), color: report.expense_difference !== 0 ? 'rgba(255,100,100,0.8)' : 'rgba(100,230,180,0.8)' },
              ].map((s) => (
                <div key={s.label} className="rounded-lg p-3 text-center"
                  style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <p className="font-mono text-[9px] uppercase tracking-widest mb-1"
                     style={{ color: 'rgba(255,255,255,0.4)' }}>{s.label}</p>
                  <p className="font-mono text-lg font-bold" style={{ color: s.color }}>{s.value}</p>
                </div>
              ))}
            </div>

            {/* Status */}
            <div className="flex items-center justify-between px-1">
              <span className="font-mono text-[10px] uppercase" style={{ color: 'rgba(255,255,255,0.3)' }}>
                Estado
              </span>
              <span className="font-mono text-[10px] uppercase px-2 py-1 rounded"
                style={{
                  color: report.status === 'completed' ? 'rgba(100,230,180,0.8)' : 'rgba(204,255,0,0.7)',
                  background: report.status === 'completed' ? 'rgba(100,230,180,0.08)' : 'rgba(204,255,0,0.07)',
                }}>
                {report.status === 'completed' ? 'Completada' : report.status === 'in_progress' ? 'En progreso' : 'Pendiente'}
              </span>
            </div>

            {/* Pending items */}
            {pendingItems.length > 0 && (
              <Card title={`Movimientos sin categorizar (${pendingItems.length})`} neon>
                <div className="space-y-3">
                  {pendingItems.map((item) => {
                    const isEditing = !!editing[item.id];
                    const editState = editing[item.id];
                    return (
                      <div key={item.id} className="rounded-lg p-3 space-y-2"
                        style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <p className="text-white text-sm font-medium truncate">{item.pdf_description}</p>
                            <p className="font-mono text-[10px] mt-0.5" style={{ color: 'rgba(255,255,255,0.35)' }}>
                              {item.pdf_date} · {formatCurrency(item.pdf_amount)}
                              {item.suggested_bucket && (
                                <span className="ml-2 px-1.5 py-0.5 rounded text-[9px]"
                                  style={{ background: 'rgba(204,255,0,0.07)', color: 'rgba(204,255,0,0.6)' }}>
                                  sugerido: {BUCKET_META[item.suggested_bucket as BudgetBucket]?.label}
                                </span>
                              )}
                            </p>
                          </div>
                          {!isEditing && (
                            <div className="flex gap-2 ml-3 shrink-0">
                              <button onClick={() => startEdit(item.id, (item.suggested_bucket as BudgetBucket) ?? 'needs')}
                                className="text-xs px-2 py-1 rounded transition-colors"
                                style={{ color: 'rgba(204,255,0,0.8)', background: 'rgba(204,255,0,0.07)' }}>
                                Categorizar
                              </button>
                              <button onClick={() => handleIgnore(item.id)}
                                className="text-xs px-2 py-1 rounded"
                                style={{ color: 'rgba(255,255,255,0.4)', background: 'rgba(255,255,255,0.04)' }}>
                                Ignorar
                              </button>
                            </div>
                          )}
                        </div>
                        {isEditing && (
                          <div className="flex items-center gap-2 flex-wrap">
                            <select value={editState.bucket}
                              onChange={(e) => {
                                const b = e.target.value as BudgetBucket;
                                setEditing((prev) => ({ ...prev, [item.id]: { bucket: b, category: CATEGORIES[b][0] } }));
                              }}
                              className="rounded-md px-2 py-1.5 text-white text-xs outline-none"
                              style={{ background: 'rgba(20,20,20,0.95)', border: '1px solid rgba(255,255,255,0.1)' }}>
                              {(Object.keys(BUCKET_META) as BudgetBucket[]).map((b) => (
                                <option key={b} value={b}>{BUCKET_META[b].label}</option>
                              ))}
                            </select>
                            <select value={editState.category}
                              onChange={(e) => setEditing((prev) => ({ ...prev, [item.id]: { ...prev[item.id], category: e.target.value } }))}
                              className="rounded-md px-2 py-1.5 text-white text-xs outline-none flex-1"
                              style={{ background: 'rgba(20,20,20,0.95)', border: '1px solid rgba(255,255,255,0.1)' }}>
                              {CATEGORIES[editState.bucket].map((c) => <option key={c} value={c}>{c}</option>)}
                            </select>
                            <button onClick={() => handleCategorize(item.id)}
                              className="text-xs px-3 py-1.5 rounded font-medium"
                              style={{ background: 'rgba(204,255,0,0.15)', color: 'rgba(204,255,0,0.9)' }}>
                              Guardar
                            </button>
                            <button onClick={() => setEditing((prev) => { const n = { ...prev }; delete n[item.id]; return n; })}
                              className="text-xs px-2 py-1.5 rounded"
                              style={{ color: 'rgba(255,255,255,0.4)', background: 'rgba(255,255,255,0.04)' }}>
                              ✕
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </Card>
            )}

            {/* Categorized items */}
            {categorizedItems.length > 0 && (
              <Card title={`Categorizados (${categorizedItems.length})`}>
                <div className="divide-y" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
                  {categorizedItems.map((item) => {
                    const meta = item.user_bucket ? BUCKET_META[item.user_bucket as BudgetBucket] : null;
                    return (
                      <div key={item.id} className="flex items-center justify-between py-2.5">
                        <div className="flex-1 min-w-0">
                          <p className="text-white text-sm truncate">{item.pdf_description}</p>
                          <p className="font-mono text-[10px] mt-0.5" style={{ color: 'rgba(255,255,255,0.35)' }}>
                            {item.pdf_date}
                            {meta && <span className="ml-2" style={{ color: meta.color }}>{meta.label}</span>}
                            {item.user_category && <span className="ml-1 opacity-60">· {item.user_category}</span>}
                          </p>
                        </div>
                        <span className="font-mono text-sm ml-4" style={{ color: 'rgba(255,100,100,0.8)' }}>
                          {formatCurrency(item.pdf_amount)}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </Card>
            )}

            {/* Ignored items */}
            {ignoredItems.length > 0 && (
              <Card title={`Ignorados (${ignoredItems.length})`}>
                <div className="divide-y" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
                  {ignoredItems.map((item) => (
                    <div key={item.id} className="flex items-center justify-between py-2.5">
                      <p className="text-sm truncate" style={{ color: 'rgba(255,255,255,0.4)' }}>{item.pdf_description}</p>
                      <span className="font-mono text-sm ml-4" style={{ color: 'rgba(255,255,255,0.3)' }}>
                        {formatCurrency(item.pdf_amount)}
                      </span>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {/* Complete button */}
            {report.status !== 'completed' && allResolved && (
              <div className="flex justify-end">
                <Button variant="primary" loading={completing} onClick={handleComplete}>
                  Cerrar mes — {MONTHS[mes-1]} {ano}
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
