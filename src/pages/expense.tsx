import { useState } from 'react';
import { DashboardLayout } from '@/components/templates/DashboardLayout';
import { Card } from '@/components/atoms/Card';
import { Button } from '@/components/atoms/Button';
import { Spinner } from '@/components/atoms/Spinner';
import { ExpenseForm } from '@/components/molecules/ExpenseForm';
import { useExpense } from '@/hooks/useExpense';
import { formatCurrency } from '@/lib/utils';
import type { BudgetBucket } from '@/types';

const MONTHS = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];

const BUCKET_CONFIG: Record<BudgetBucket, { label: string; icon: string; color: string }> = {
  needs:   { label: 'Necesidades', icon: '◧', color: 'rgba(100,180,255,0.8)' },
  wants:   { label: 'Gustos',      icon: '◨', color: 'rgba(255,160,100,0.8)' },
  savings: { label: 'Ahorros',     icon: '◩', color: 'rgba(100,230,180,0.8)' },
  debt:    { label: 'Deuda',       icon: '◪', color: 'rgba(255,100,100,0.8)' },
};

export default function ExpensePage() {
  const now = new Date();
  const [mes, setMes] = useState(now.getMonth() + 1);
  const [ano, setAno] = useState(now.getFullYear());
  const [showForm, setShowForm] = useState(false);
  const [filterBucket, setFilterBucket] = useState<BudgetBucket | 'all'>('all');
  const { expenses, fixedExpenses, loading, error, create, remove } = useExpense(mes, ano);

  const filtered = filterBucket === 'all' ? expenses : expenses.filter((e) => e.bucket === filterBucket);
  const totalByBucket = (b: BudgetBucket) => expenses.filter((e) => e.bucket === b).reduce((s, e) => s + e.amount, 0);
  const totalFixed = fixedExpenses.reduce((s, f) => s + f.amount, 0);

  const handleCreate = async (data: any) => {
    await create(data);
    setShowForm(false);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <p className="font-mono text-[10px] tracking-[0.2em] uppercase mb-1"
               style={{ color: 'rgba(204,255,0,0.55)' }}>Finanzas</p>
            <h1 className="text-2xl font-bold text-white">Gastos</h1>
          </div>
          <Button variant="primary" onClick={() => setShowForm(!showForm)}>
            {showForm ? 'Cancelar' : '+ Registrar gasto'}
          </Button>
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

        {/* Form */}
        {showForm && (
          <Card title="Nuevo gasto" neon>
            <ExpenseForm onSubmit={handleCreate} onCancel={() => setShowForm(false)} />
          </Card>
        )}

        {/* Gastos fijos */}
        {fixedExpenses.length > 0 && (
          <Card title="Gastos fijos activos">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm" style={{ color: 'rgba(255,255,255,0.5)' }}>
                {fixedExpenses.length} gastos fijos · Total mensual:
              </span>
              <span className="font-mono text-sm font-semibold" style={{ color: 'rgba(255,160,100,0.8)' }}>
                {formatCurrency(totalFixed)}
              </span>
            </div>
            <div className="space-y-2">
              {fixedExpenses.map((f) => {
                const cfg = BUCKET_CONFIG[f.bucket as BudgetBucket];
                return (
                  <div key={f.id} className="flex items-center justify-between py-2 border-b"
                    style={{ borderColor: 'rgba(255,255,255,0.04)' }}>
                    <div>
                      <p className="text-white text-sm">{f.name}</p>
                      <p className="font-mono text-[10px]" style={{ color: 'rgba(255,255,255,0.35)' }}>
                        día {f.day_of_month} · <span style={{ color: cfg?.color }}>{cfg?.label}</span>
                      </p>
                    </div>
                    <span className="font-mono text-sm" style={{ color: 'rgba(255,255,255,0.7)' }}>
                      {formatCurrency(f.amount)}
                    </span>
                  </div>
                );
              })}
            </div>
          </Card>
        )}

        {/* Lista gastos */}
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
                return (
                  <div key={exp.id} className="flex items-center justify-between py-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-sm font-medium truncate">{exp.description}</p>
                      <p className="font-mono text-[10px] mt-0.5" style={{ color: 'rgba(255,255,255,0.35)' }}>
                        {exp.date} · {exp.category_name} ·
                        <span style={{ color: cfg?.color }}> {cfg?.label}</span>
                      </p>
                    </div>
                    <div className="flex items-center gap-3 ml-4">
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
