import { useState } from 'react';
import { DashboardLayout } from '@/components/templates/DashboardLayout';
import { Card } from '@/components/atoms/Card';
import { Button } from '@/components/atoms/Button';
import { Spinner } from '@/components/atoms/Spinner';
import { useBudget } from '@/hooks/useBudget';
import { formatCurrency } from '@/lib/utils';

const MONTHS = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];

const BUCKET_CONFIG = [
  { key: 'needs',   label: 'Necesidades', icon: '◧', color: 'rgba(100,180,255,0.85)', budgeted: 'budgeted_needs', actual: 'actual_needs' },
  { key: 'wants',   label: 'Gustos',      icon: '◨', color: 'rgba(255,160,100,0.85)', budgeted: 'budgeted_wants', actual: 'actual_wants' },
  { key: 'savings', label: 'Ahorros',     icon: '◩', color: 'rgba(100,230,180,0.85)', budgeted: 'budgeted_savings', actual: 'actual_savings' },
  { key: 'debt',    label: 'Deuda',       icon: '◪', color: 'rgba(255,100,100,0.85)', budgeted: 'debt_amount', actual: 'actual_debt' },
] as const;

export default function BudgetPage() {
  const now = new Date();
  const [mes, setMes] = useState(now.getMonth() + 1);
  const [ano, setAno] = useState(now.getFullYear());
  const [showConfig, setShowConfig] = useState(false);
  const [saving, setSaving] = useState(false);
  const { budget, loading, error, save } = useBudget(mes, ano);

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

  const getUsedPct = (budgeted: number, actual: number) =>
    budgeted > 0 ? Math.min((actual / budgeted) * 100, 100) : 0;

  const getStatusColor = (pct: number) =>
    pct > 90 ? 'rgba(255,100,100,0.85)' : pct > 70 ? 'rgba(255,200,80,0.85)' : 'rgba(100,230,180,0.85)';

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <p className="font-mono text-[10px] tracking-[0.2em] uppercase mb-1"
               style={{ color: 'rgba(204,255,0,0.55)' }}>
              {MONTHS[mes-1]} {ano}
            </p>
            <h1 className="text-2xl font-bold text-white">Presupuesto 50-30-20</h1>
          </div>
          <div className="flex gap-2">
            <div className="flex gap-2">
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
            <Button variant="primary" onClick={() => setShowConfig(!showConfig)}>
              {showConfig ? 'Cancelar' : 'Configurar'}
            </Button>
          </div>
        </div>

        {/* Config form */}
        {showConfig && (
          <Card title="Configurar presupuesto" neon>
            <div className="space-y-4">
              <p className="text-sm" style={{ color: 'rgba(255,255,255,0.5)' }}>
                Ingresos del mes (calculados automáticamente):
                <span className="text-white font-semibold ml-2">{formatCurrency(budget?.total_income ?? 0)}</span>
              </p>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { key: 'needs',       label: 'Necesidades %', color: 'rgba(100,180,255,0.8)' },
                  { key: 'wants',       label: 'Gustos %',      color: 'rgba(255,160,100,0.8)' },
                  { key: 'savings',     label: 'Ahorros %',     color: 'rgba(100,230,180,0.8)' },
                  { key: 'debt_amount', label: 'Deuda S/.',     color: 'rgba(255,100,100,0.8)' },
                ].map((f) => (
                  <div key={f.key}>
                    <label className="block font-mono text-[9px] tracking-widest uppercase mb-1.5"
                      style={{ color: f.color }}>
                      {f.label}
                    </label>
                    <input type="number" min="0" step={f.key === 'debt_amount' ? '0.01' : '1'}
                      max={f.key === 'debt_amount' ? undefined : '100'}
                      value={(percents as any)[f.key]}
                      onChange={(e) => setPercents((p) => ({ ...p, [f.key]: parseFloat(e.target.value) || 0 }))}
                      className="w-full rounded-md px-3 py-2 text-white text-sm outline-none"
                      style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }} />
                  </div>
                ))}
              </div>
              <div className="flex gap-3">
                <Button variant="primary" loading={saving} fullWidth onClick={handleSave}>
                  Guardar presupuesto
                </Button>
              </div>
            </div>
          </Card>
        )}

        {/* Buckets */}
        {loading ? (
          <div className="flex justify-center py-12"><Spinner /></div>
        ) : error ? (
          <p className="text-sm text-center py-8" style={{ color: 'rgba(255,100,100,0.8)' }}>{error}</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {BUCKET_CONFIG.map((b) => {
              const budgeted = budget ? (budget as any)[b.budgeted] ?? 0 : 0;
              const actual = budget ? (budget as any)[b.actual] ?? 0 : 0;
              const pct = getUsedPct(budgeted, actual);
              const statusColor = getStatusColor(pct);
              return (
                <div key={b.key} className="rounded-lg p-5"
                  style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <span style={{ color: b.color, fontSize: '18px' }}>{b.icon}</span>
                      <span className="text-white font-medium">{b.label}</span>
                    </div>
                    <span className="font-mono text-xs px-2 py-0.5 rounded"
                      style={{ color: statusColor, background: `${statusColor.replace('0.85', '0.1')}` }}>
                      {pct.toFixed(0)}% usado
                    </span>
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span style={{ color: 'rgba(255,255,255,0.5)' }}>Presupuestado</span>
                      <span className="text-white font-medium">{formatCurrency(budgeted)}</span>
                    </div>
                    <div className="w-full rounded-full h-2" style={{ background: 'rgba(255,255,255,0.07)' }}>
                      <div className="h-2 rounded-full transition-all duration-700"
                        style={{ width: `${pct}%`, background: b.color }} />
                    </div>
                    <div className="flex justify-between">
                      <div>
                        <p className="font-mono text-[9px] uppercase" style={{ color: 'rgba(255,255,255,0.3)' }}>Gastado</p>
                        <p className="font-mono text-sm font-semibold mt-0.5" style={{ color: statusColor }}>
                          {formatCurrency(actual)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-mono text-[9px] uppercase" style={{ color: 'rgba(255,255,255,0.3)' }}>Disponible</p>
                        <p className="font-mono text-sm font-semibold mt-0.5" style={{ color: b.color }}>
                          {formatCurrency(Math.max(budgeted - actual, 0))}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {budget && (
          <div className="flex items-center justify-between px-1">
            <span className="font-mono text-[10px] uppercase" style={{ color: 'rgba(255,255,255,0.3)' }}>
              Estado del presupuesto
            </span>
            <span className="font-mono text-[10px] uppercase px-2 py-1 rounded"
              style={{
                color: budget.status === 'closed' ? 'rgba(100,230,180,0.8)' : 'rgba(204,255,0,0.7)',
                background: budget.status === 'closed' ? 'rgba(100,230,180,0.08)' : 'rgba(204,255,0,0.07)',
              }}>
              {budget.status === 'closed' ? 'Cerrado' : budget.status === 'active' ? 'Activo' : 'Borrador'}
            </span>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
