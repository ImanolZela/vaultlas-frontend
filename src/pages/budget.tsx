import { useState } from 'react';
import { DashboardLayout } from '@/components/templates/DashboardLayout';
import { Card } from '@/components/atoms/Card';
import { Button } from '@/components/atoms/Button';
import { Spinner } from '@/components/atoms/Spinner';
import { useBudget } from '@/hooks/useBudget';
import { useExpense } from '@/hooks/useExpense';
import { formatCurrency } from '@/lib/utils';

const MONTHS = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];

const BUCKETS = [
  { key: 'needs',   label: 'Necesidades', icon: '◧', color: 'rgba(100,180,255,0.85)', pctKey: 'needs_percent',    budgeted: 'budgeted_needs',   actual: 'actual_needs' },
  { key: 'wants',   label: 'Gustos',      icon: '◨', color: 'rgba(255,160,100,0.85)', pctKey: 'wants_percent',    budgeted: 'budgeted_wants',   actual: 'actual_wants' },
  { key: 'savings', label: 'Ahorros',     icon: '◩', color: 'rgba(100,230,180,0.85)', pctKey: 'savings_percent',  budgeted: 'budgeted_savings', actual: 'actual_savings' },
  { key: 'debt',    label: 'Deuda',       icon: '◪', color: 'rgba(255,100,100,0.85)', pctKey: 'debt_amount',      budgeted: 'debt_amount',      actual: 'actual_debt' },
] as const;

const statusColor = (pct: number) =>
  pct > 90 ? 'rgba(255,100,100,0.9)' : pct > 70 ? 'rgba(255,200,80,0.85)' : 'rgba(100,230,180,0.85)';

export default function BudgetPage() {
  const now = new Date();
  const [mes, setMes] = useState(now.getMonth() + 1);
  const [ano, setAno] = useState(now.getFullYear());
  const [showConfig, setShowConfig] = useState(false);
  const [saving, setSaving] = useState(false);
  const { budget, loading, error, save } = useBudget(mes, ano);
  const { expenses } = useExpense(mes, ano);

  const [percents, setPercents] = useState({ needs: 50, wants: 30, savings: 20, debt_amount: 0 });

  const handleSave = async () => {
    setSaving(true);
    try {
      await save({
        month: `${ano}-${String(mes).padStart(2, '0')}-01`,
        needs_percent: percents.needs,
        wants_percent: percents.wants,
        savings_percent: percents.savings,
        debt_amount: percents.debt_amount,
      });
      setShowConfig(false);
    } finally {
      setSaving(false);
    }
  };

  const val = (key: string) => budget ? ((budget as any)[key] ?? 0) : 0;

  const totalBudgeted = BUCKETS.reduce((s, b) => s + val(b.budgeted), 0);
  const totalActual   = BUCKETS.reduce((s, b) => s + val(b.actual),   0);
  const totalAvail    = Math.max(totalBudgeted - totalActual, 0);
  const totalPct      = totalBudgeted > 0 ? Math.min((totalActual / totalBudgeted) * 100, 100) : 0;

  return (
    <DashboardLayout>
      <div className="space-y-6">

        {/* ── Header ─────────────────────────────────────────── */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <p className="font-mono text-[10px] tracking-[0.2em] uppercase mb-1"
               style={{ color: 'rgba(204,255,0,0.55)' }}>{MONTHS[mes-1]} {ano}</p>
            <h1 className="text-2xl font-bold text-white">Presupuesto 50-30-20</h1>
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
            <Button variant="primary" onClick={() => setShowConfig(!showConfig)}>
              {showConfig ? 'Cancelar' : 'Configurar'}
            </Button>
          </div>
        </div>

        {/* ── Config form ────────────────────────────────────── */}
        {showConfig && (
          <Card title="Configurar presupuesto" neon>
            <div className="space-y-4">
              <div className="flex items-center justify-between text-sm">
                <span style={{ color: 'rgba(255,255,255,0.5)' }}>Ingresos del mes</span>
                <span className="text-white font-semibold">{formatCurrency(val('total_income'))}</span>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { key: 'needs',       label: 'Necesidades %', color: 'rgba(100,180,255,0.8)' },
                  { key: 'wants',       label: 'Gustos %',      color: 'rgba(255,160,100,0.8)' },
                  { key: 'savings',     label: 'Ahorros %',     color: 'rgba(100,230,180,0.8)' },
                  { key: 'debt_amount', label: 'Deuda S/.',     color: 'rgba(255,100,100,0.8)' },
                ].map((f) => (
                  <div key={f.key}>
                    <label className="block font-mono text-[9px] tracking-widest uppercase mb-1.5"
                      style={{ color: f.color }}>{f.label}</label>
                    <input type="number" min="0"
                      step={f.key === 'debt_amount' ? '0.01' : '1'}
                      max={f.key === 'debt_amount' ? undefined : '100'}
                      value={(percents as any)[f.key]}
                      onChange={(e) => setPercents((p) => ({ ...p, [f.key]: parseFloat(e.target.value) || 0 }))}
                      className="w-full rounded-md px-3 py-2 text-white text-sm outline-none"
                      style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }} />
                  </div>
                ))}
              </div>
              <Button variant="primary" loading={saving} fullWidth onClick={handleSave}>
                Guardar presupuesto
              </Button>
            </div>
          </Card>
        )}

        {loading ? (
          <div className="flex justify-center py-16"><Spinner /></div>
        ) : error ? (
          <p className="text-sm text-center py-8" style={{ color: 'rgba(255,100,100,0.8)' }}>{error}</p>
        ) : (
          <>
            {/* ── 4 chips resumen ────────────────────────────── */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {BUCKETS.map((b) => {
                const budgeted = val(b.budgeted);
                const actual   = val(b.actual);
                const pct      = budgeted > 0 ? Math.min((actual / budgeted) * 100, 100) : 0;
                const sc       = statusColor(pct);
                return (
                  <div key={b.key} className="rounded-xl p-4"
                    style={{ background: 'rgba(255,255,255,0.03)', border: `1px solid ${b.color.replace('0.85','0.2')}` }}>
                    <div className="flex items-center gap-2 mb-3">
                      <span style={{ color: b.color, fontSize: '16px' }}>{b.icon}</span>
                      <span className="font-mono text-[10px] tracking-widest uppercase"
                        style={{ color: 'rgba(255,255,255,0.55)' }}>{b.label}</span>
                    </div>
                    <p className="font-mono text-base font-bold text-white">{formatCurrency(budgeted)}</p>
                    <div className="mt-2 w-full rounded-full h-1" style={{ background: 'rgba(255,255,255,0.08)' }}>
                      <div className="h-1 rounded-full transition-all duration-700"
                        style={{ width: `${pct}%`, background: sc }} />
                    </div>
                    <p className="font-mono text-[10px] mt-1.5" style={{ color: sc }}>
                      {pct.toFixed(0)}% usado
                    </p>
                  </div>
                );
              })}
            </div>

            {/* ── Tabla distribución ─────────────────────────── */}
            <Card title={`Distribución del presupuesto — ${MONTHS[mes-1]} ${ano}`}>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="font-mono text-[9px] tracking-widest uppercase border-b"
                      style={{ color: 'rgba(255,255,255,0.3)', borderColor: 'rgba(255,255,255,0.07)' }}>
                      <th className="text-left py-2.5 pr-4">Categoría</th>
                      <th className="text-right py-2.5 px-3">Presupuestado</th>
                      <th className="text-right py-2.5 px-3">Gastado</th>
                      <th className="text-right py-2.5 px-3">Disponible</th>
                      <th className="text-right py-2.5 pl-3 w-32">Progreso</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y" style={{ borderColor: 'rgba(255,255,255,0.04)' }}>
                    {BUCKETS.map((b) => {
                      const budgeted = val(b.budgeted);
                      const actual   = val(b.actual);
                      const avail    = Math.max(budgeted - actual, 0);
                      const pct      = budgeted > 0 ? Math.min((actual / budgeted) * 100, 100) : 0;
                      const sc       = statusColor(pct);
                      return (
                        <tr key={b.key} className="transition-colors hover:bg-white/[0.02]">
                          <td className="py-3.5 pr-4">
                            <div className="flex items-center gap-2.5">
                              <span style={{ color: b.color, fontSize: '15px' }}>{b.icon}</span>
                              <span className="text-white text-sm font-medium">{b.label}</span>
                            </div>
                          </td>
                          <td className="text-right py-3.5 px-3 font-mono text-sm text-white">
                            {formatCurrency(budgeted)}
                          </td>
                          <td className="text-right py-3.5 px-3 font-mono text-sm font-semibold"
                            style={{ color: sc }}>
                            {formatCurrency(actual)}
                          </td>
                          <td className="text-right py-3.5 px-3 font-mono text-sm"
                            style={{ color: avail > 0 ? b.color : 'rgba(255,100,100,0.8)' }}>
                            {formatCurrency(avail)}
                          </td>
                          <td className="py-3.5 pl-3">
                            <div className="flex items-center gap-2 justify-end">
                              <div className="w-20 rounded-full h-1.5 shrink-0"
                                style={{ background: 'rgba(255,255,255,0.07)' }}>
                                <div className="h-1.5 rounded-full transition-all duration-700"
                                  style={{ width: `${pct}%`, background: sc }} />
                              </div>
                              <span className="font-mono text-[10px] w-8 text-right shrink-0"
                                style={{ color: sc }}>
                                {pct.toFixed(0)}%
                              </span>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                  {/* ── Fila de totales ── */}
                  <tfoot>
                    <tr className="border-t" style={{ borderColor: 'rgba(255,255,255,0.1)' }}>
                      <td className="pt-3.5 pr-4">
                        <span className="font-mono text-[10px] tracking-widest uppercase"
                          style={{ color: 'rgba(255,255,255,0.4)' }}>Total</span>
                      </td>
                      <td className="text-right pt-3.5 px-3 font-mono text-sm font-bold text-white">
                        {formatCurrency(totalBudgeted)}
                      </td>
                      <td className="text-right pt-3.5 px-3 font-mono text-sm font-bold"
                        style={{ color: statusColor(totalPct) }}>
                        {formatCurrency(totalActual)}
                      </td>
                      <td className="text-right pt-3.5 px-3 font-mono text-sm font-bold"
                        style={{ color: 'rgba(204,255,0,0.8)' }}>
                        {formatCurrency(totalAvail)}
                      </td>
                      <td className="pt-3.5 pl-3">
                        <div className="flex items-center gap-2 justify-end">
                          <div className="w-20 rounded-full h-1.5 shrink-0"
                            style={{ background: 'rgba(255,255,255,0.07)' }}>
                            <div className="h-1.5 rounded-full transition-all duration-700"
                              style={{ width: `${totalPct}%`, background: statusColor(totalPct) }} />
                          </div>
                          <span className="font-mono text-[10px] w-8 text-right shrink-0"
                            style={{ color: statusColor(totalPct) }}>
                            {totalPct.toFixed(0)}%
                          </span>
                        </div>
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </Card>

            {/* ── Entradas por bucket ────────────────────────── */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 items-start">
              {BUCKETS.map((b) => {
                const items = expenses.filter((e) => e.bucket === b.key);
                return (
                  <div key={b.key} className="rounded-xl overflow-hidden"
                    style={{ background: 'rgba(255,255,255,0.03)', border: `1px solid ${b.color.replace('0.85','0.15')}` }}>
                    {/* header */}
                    <div className="flex items-center gap-1.5 px-3 py-2"
                      style={{ borderBottom: `1px solid ${b.color.replace('0.85','0.10')}`, background: b.color.replace('0.85','0.06') }}>
                      <span style={{ color: b.color, fontSize: '12px' }}>{b.icon}</span>
                      <span className="font-mono text-[9px] tracking-widest uppercase font-semibold"
                        style={{ color: b.color }}>{b.label}</span>
                    </div>
                    {/* rows */}
                    {items.length === 0 ? (
                      <p className="px-3 py-4 font-mono text-[9px] text-center"
                        style={{ color: 'rgba(255,255,255,0.2)' }}>Sin entradas</p>
                    ) : (
                      <div className="divide-y" style={{ borderColor: 'rgba(255,255,255,0.04)' }}>
                        {items.map((e) => (
                          <div key={e.id} className="flex items-center justify-between px-3 py-1.5 gap-2">
                            <span className="text-[11px] truncate" style={{ color: 'rgba(255,255,255,0.65)' }}>
                              {e.description || e.category_name}
                            </span>
                            <span className="font-mono text-[11px] font-semibold shrink-0"
                              style={{ color: b.color }}>
                              {formatCurrency(e.amount)}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* ── Estado ─────────────────────────────────────── */}
            {budget && (
              <div className="flex items-center justify-between px-1">
                <span className="font-mono text-[10px] uppercase" style={{ color: 'rgba(255,255,255,0.3)' }}>
                  Ingresos totales registrados
                </span>
                <div className="flex items-center gap-3">
                  <span className="font-mono text-sm font-bold" style={{ color: 'rgba(100,230,180,0.9)' }}>
                    {formatCurrency(val('total_income'))}
                  </span>
                  <span className="font-mono text-[10px] uppercase px-2 py-1 rounded"
                    style={{
                      color: budget.status === 'closed' ? 'rgba(100,230,180,0.8)' : 'rgba(204,255,0,0.7)',
                      background: budget.status === 'closed' ? 'rgba(100,230,180,0.08)' : 'rgba(204,255,0,0.07)',
                    }}>
                    {budget.status === 'closed' ? 'Cerrado' : budget.status === 'active' ? 'Activo' : 'Borrador'}
                  </span>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
