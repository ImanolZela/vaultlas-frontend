import { useState } from 'react';
import { DashboardLayout } from '@/components/templates/DashboardLayout';
import { Card } from '@/components/atoms/Card';
import { Button } from '@/components/atoms/Button';
import { Spinner } from '@/components/atoms/Spinner';
import { ExpenseForm } from '@/components/molecules/ExpenseForm';
import { useExpense } from '@/hooks/useExpense';
import { formatCurrency } from '@/lib/utils';
import type { BudgetBucket, ExpenseFixedMonthlyCreate } from '@/types';

const MONTHS = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];

const BUCKET_CONFIG: Record<BudgetBucket, { label: string; icon: string; color: string }> = {
  needs:   { label: 'Necesidades', icon: '◧', color: 'rgba(100,180,255,0.8)' },
  wants:   { label: 'Gustos',      icon: '◨', color: 'rgba(255,160,100,0.8)' },
  savings: { label: 'Ahorros',     icon: '◩', color: 'rgba(100,230,180,0.8)' },
  debt:    { label: 'Deuda',       icon: '◪', color: 'rgba(255,100,100,0.8)' },
};

const CATEGORIES: Record<BudgetBucket, string[]> = {
  needs:   ['Mercado', 'Alquiler', 'Transporte', 'Salud', 'Servicios', 'Educación', 'Otro'],
  wants:   ['Restaurante', 'Entretenimiento', 'Ropa', 'Viajes', 'Café', 'Suscripciones', 'Otro'],
  savings: ['Ahorro mensual', 'Inversión', 'Fondo de emergencia', 'Otro'],
  debt:    ['Tarjeta de crédito', 'Préstamo personal', 'Préstamo a persona', 'Otro'],
};

const inputStyle = { background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' };
const inputCls = 'w-full rounded-md px-3 py-2 text-white text-sm outline-none';
const labelCls = 'block font-mono text-[9px] tracking-widest uppercase mb-1.5';
const labelStyle = { color: 'rgba(204,255,0,0.5)' };

function FixedExpenseForm({ onSubmit, onCancel }: { onSubmit: (d: ExpenseFixedMonthlyCreate) => Promise<void>; onCancel: () => void }) {
  const today = new Date().toISOString().split('T')[0];
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: '',
    bucket: 'needs' as BudgetBucket,
    category_name: 'Mercado',
    amount: '',
    day_of_month: '1',
    start_date: today,
  });

  const set = (k: string, v: any) => setForm((p) => ({ ...p, [k]: v }));

  const handleBucketChange = (b: BudgetBucket) => { set('bucket', b); set('category_name', CATEGORIES[b][0]); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await onSubmit({
        name: form.name,
        bucket: form.bucket,
        category_name: form.category_name,
        amount: parseFloat(form.amount),
        day_of_month: parseInt(form.day_of_month),
        start_date: form.start_date,
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelCls} style={labelStyle}>Nombre del gasto</label>
          <input type="text" value={form.name} onChange={(e) => set('name', e.target.value)}
            placeholder="Ej: Netflix, Alquiler..." className={inputCls} style={inputStyle} required />
        </div>
        <div>
          <label className={labelCls} style={labelStyle}>Monto mensual (S/.)</label>
          <input type="number" step="0.01" min="0.01" value={form.amount}
            onChange={(e) => set('amount', e.target.value)}
            placeholder="0.00" className={inputCls} style={inputStyle} required />
        </div>
      </div>

      <div>
        <label className={labelCls} style={labelStyle}>Bucket</label>
        <div className="grid grid-cols-4 gap-2">
          {(Object.entries(BUCKET_CONFIG) as [BudgetBucket, any][]).map(([b, cfg]) => (
            <button key={b} type="button" onClick={() => handleBucketChange(b)}
              className="rounded-md py-2 px-1 text-xs font-medium transition-all"
              style={{
                color: form.bucket === b ? '#000' : cfg.color,
                background: form.bucket === b ? cfg.color : 'rgba(255,255,255,0.04)',
                border: `1px solid ${cfg.color}`,
              }}>
              {cfg.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className={labelCls} style={labelStyle}>Categoría</label>
          <select value={form.category_name} onChange={(e) => set('category_name', e.target.value)}
            className={inputCls} style={{ ...inputStyle, background: 'rgba(20,20,20,0.95)' }}>
            {CATEGORIES[form.bucket].map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div>
          <label className={labelCls} style={labelStyle}>Día del mes</label>
          <input type="number" min="1" max="31" value={form.day_of_month}
            onChange={(e) => set('day_of_month', e.target.value)}
            className={inputCls} style={inputStyle} required />
        </div>
        <div>
          <label className={labelCls} style={labelStyle}>Desde</label>
          <input type="date" value={form.start_date} onChange={(e) => set('start_date', e.target.value)}
            className={inputCls} style={inputStyle} required />
        </div>
      </div>

      <div className="flex gap-3 pt-1">
        <Button type="submit" variant="primary" loading={saving} fullWidth>
          Guardar gasto fijo
        </Button>
        <Button type="button" variant="secondary" onClick={onCancel} fullWidth>
          Cancelar
        </Button>
      </div>
    </form>
  );
}

export default function ExpensePage() {
  const now = new Date();
  const [mes, setMes] = useState(now.getMonth() + 1);
  const [ano, setAno] = useState(now.getFullYear());
  const [showForm, setShowForm] = useState(false);
  const [showFixedForm, setShowFixedForm] = useState(false);
  const [filterBucket, setFilterBucket] = useState<BudgetBucket | 'all'>('all');
  const { expenses, fixedExpenses, loading, error, create, remove, createFixed, removeFixed } = useExpense(mes, ano);

  const filtered = filterBucket === 'all' ? expenses : expenses.filter((e) => e.bucket === filterBucket);
  const totalByBucket = (b: BudgetBucket) => expenses.filter((e) => e.bucket === b).reduce((s, e) => s + e.amount, 0);
  const totalFixed = fixedExpenses.reduce((s, f) => s + f.amount, 0);
  const totalMonth = expenses.reduce((s, e) => s + e.amount, 0);

  const handleCreate = async (data: any) => { await create(data); setShowForm(false); };
  const handleCreateFixed = async (data: ExpenseFixedMonthlyCreate) => { await createFixed(data); setShowFixedForm(false); };

  return (
    <DashboardLayout>
      <div className="space-y-6">

        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <p className="font-mono text-[10px] tracking-[0.2em] uppercase mb-1"
               style={{ color: 'rgba(204,255,0,0.55)' }}>Finanzas</p>
            <h1 className="text-2xl font-bold text-white">Gastos</h1>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="secondary" onClick={() => { setShowFixedForm(!showFixedForm); setShowForm(false); }}>
              {showFixedForm ? 'Cancelar' : '↺ Gasto recurrente'}
            </Button>
            <Button variant="primary" onClick={() => { setShowForm(!showForm); setShowFixedForm(false); }}>
              {showForm ? 'Cancelar' : '+ Registrar gasto'}
            </Button>
          </div>
        </div>

        {/* Selector mes */}
        <div className="flex items-center gap-3">
          <select value={mes} onChange={(e) => setMes(Number(e.target.value))}
            className="rounded-md px-3 py-1.5 text-white text-sm outline-none"
            style={{ background: 'rgba(20,20,20,0.95)', border: '1px solid rgba(255,255,255,0.1)' }}>
            {MONTHS.map((m, i) => <option key={i} value={i+1}>{m}</option>)}
          </select>
          <select value={ano} onChange={(e) => setAno(Number(e.target.value))}
            className="rounded-md px-3 py-1.5 text-white text-sm outline-none"
            style={{ background: 'rgba(20,20,20,0.95)', border: '1px solid rgba(255,255,255,0.1)' }}>
            {[ano-1, ano, ano+1].map((y) => <option key={y} value={y}>{y}</option>)}
          </select>
          <span className="font-mono text-sm font-semibold" style={{ color: 'rgba(255,100,100,0.8)' }}>
            Total: {formatCurrency(totalMonth)}
          </span>
        </div>

        {/* Resumen por bucket */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {(Object.entries(BUCKET_CONFIG) as [BudgetBucket, any][]).map(([b, cfg]) => (
            <button key={b} onClick={() => setFilterBucket(filterBucket === b ? 'all' : b)}
              className="rounded-lg p-3 text-left transition-all"
              style={{
                background: filterBucket === b ? `${cfg.color.replace('0.8', '0.12')}` : 'rgba(255,255,255,0.03)',
                border: `1px solid ${filterBucket === b ? cfg.color : 'rgba(255,255,255,0.06)'}`,
              }}>
              <div className="flex items-center gap-2 mb-1">
                <span style={{ color: cfg.color }}>{cfg.icon}</span>
                <span className="font-mono text-[9px] tracking-widest uppercase" style={{ color: 'rgba(255,255,255,0.4)' }}>
                  {cfg.label}
                </span>
              </div>
              <p className="font-mono text-sm font-semibold" style={{ color: cfg.color }}>
                {formatCurrency(totalByBucket(b))}
              </p>
            </button>
          ))}
        </div>

        {/* Form gasto puntual */}
        {showForm && (
          <Card title="Nuevo gasto" neon>
            <ExpenseForm onSubmit={handleCreate} onCancel={() => setShowForm(false)} />
          </Card>
        )}

        {/* Form gasto recurrente */}
        {showFixedForm && (
          <Card title="Nuevo gasto recurrente" neon>
            <p className="text-xs mb-4" style={{ color: 'rgba(255,255,255,0.4)' }}>
              Los gastos recurrentes se suman automáticamente al presupuesto de cada mes.
            </p>
            <FixedExpenseForm onSubmit={handleCreateFixed} onCancel={() => setShowFixedForm(false)} />
          </Card>
        )}

        {/* Gastos fijos */}
        <Card title={`Gastos recurrentes activos${fixedExpenses.length > 0 ? ` — ${formatCurrency(totalFixed)}/mes` : ''}`}>
          {fixedExpenses.length === 0 ? (
            <div className="flex items-center justify-between py-2">
              <p className="text-sm" style={{ color: 'rgba(255,255,255,0.35)' }}>
                Sin gastos recurrentes. Los servicios, alquiler o suscripciones que pagas cada mes van aquí.
              </p>
              <Button variant="secondary" onClick={() => setShowFixedForm(true)}>Agregar</Button>
            </div>
          ) : (
            <div className="divide-y" style={{ borderColor: 'rgba(255,255,255,0.04)' }}>
              {fixedExpenses.map((f) => {
                const cfg = BUCKET_CONFIG[f.bucket as BudgetBucket];
                return (
                  <div key={f.id} className="flex items-center justify-between py-2.5">
                    <div className="flex items-center gap-3">
                      <div className="flex flex-col items-center justify-center w-8 h-8 rounded-md shrink-0"
                        style={{ background: cfg?.color.replace('0.8','0.1'), border: `1px solid ${cfg?.color.replace('0.8','0.25')}` }}>
                        <span className="font-mono text-[10px] font-bold" style={{ color: cfg?.color }}>
                          {f.day_of_month}
                        </span>
                      </div>
                      <div>
                        <p className="text-white text-sm font-medium">{f.name}</p>
                        <p className="font-mono text-[10px]" style={{ color: 'rgba(255,255,255,0.35)' }}>
                          {f.category_name} · <span style={{ color: cfg?.color }}>{cfg?.label}</span>
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <p className="font-mono text-sm font-semibold" style={{ color: 'rgba(255,255,255,0.75)' }}>
                          {formatCurrency(f.amount)}
                        </p>
                        <p className="font-mono text-[9px]" style={{ color: 'rgba(255,255,255,0.3)' }}>cada mes</p>
                      </div>
                      <button onClick={() => removeFixed(f.id)}
                        className="text-xs px-2 py-1 rounded transition-colors"
                        style={{ color: 'rgba(255,100,100,0.5)', background: 'rgba(255,100,100,0.06)' }}>
                        ×
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Card>

        {/* Lista gastos del mes */}
        <Card title={`${filterBucket === 'all' ? 'Todos los gastos' : BUCKET_CONFIG[filterBucket].label} — ${MONTHS[mes-1]} ${ano}`}>
          {loading ? (
            <div className="flex justify-center py-8"><Spinner /></div>
          ) : error ? (
            <p className="text-sm py-4 text-center" style={{ color: 'rgba(255,100,100,0.8)' }}>{error}</p>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center py-10 space-y-2">
              <span className="text-3xl" style={{ color: 'rgba(204,255,0,0.25)' }}>↓</span>
              <p className="text-white text-sm">Sin gastos en este periodo</p>
            </div>
          ) : (
            <div className="divide-y" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
              {filtered.map((exp) => {
                const cfg = BUCKET_CONFIG[exp.bucket as BudgetBucket];
                const d = new Date(exp.date + 'T00:00:00');
                const dayLabel = `${String(d.getDate()).padStart(2,'0')}/${String(d.getMonth()+1).padStart(2,'0')}`;
                return (
                  <div key={exp.id} className="flex items-center justify-between py-3">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <span className="font-mono text-[10px] shrink-0" style={{ color: 'rgba(255,255,255,0.3)' }}>
                        {dayLabel}
                      </span>
                      <div className="min-w-0">
                        <p className="text-white text-sm font-medium truncate">{exp.description}</p>
                        <p className="font-mono text-[10px] mt-0.5" style={{ color: 'rgba(255,255,255,0.35)' }}>
                          {exp.category_name} · <span style={{ color: cfg?.color }}>{cfg?.label}</span>
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 ml-4 shrink-0">
                      <span className="font-mono text-sm font-semibold" style={{ color: 'rgba(255,100,100,0.8)' }}>
                        -{formatCurrency(exp.amount)}
                      </span>
                      <button onClick={() => remove(exp.id)}
                        className="text-xs px-2 py-1 rounded"
                        style={{ color: 'rgba(255,100,100,0.6)', background: 'rgba(255,100,100,0.06)' }}>
                        ×
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Card>

      </div>
    </DashboardLayout>
  );
}
