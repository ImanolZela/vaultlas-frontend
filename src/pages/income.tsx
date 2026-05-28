import { useState } from 'react';
import { DashboardLayout } from '@/components/templates/DashboardLayout';
import { Card } from '@/components/atoms/Card';
import { Button } from '@/components/atoms/Button';
import { Spinner } from '@/components/atoms/Spinner';
import { IncomeForm } from '@/components/molecules/IncomeForm';
import { useIncome } from '@/hooks/useIncome';
import { formatCurrency } from '@/lib/utils';

const MONTHS = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];

const TYPE_LABELS: Record<string, string> = {
  salary: 'Sueldo', bonus: 'Bono', gift: 'Regalo',
  freelance: 'Freelance', loan: 'Préstamo', sale: 'Venta', other: 'Otro',
};

export default function IncomePage() {
  const now = new Date();
  const [mes, setMes] = useState(now.getMonth() + 1);
  const [ano, setAno] = useState(now.getFullYear());
  const [showForm, setShowForm] = useState(false);
  const { incomes, loading, error, create, remove } = useIncome(mes, ano);

  const totalMonth = incomes.reduce((s, i) => s + i.amount, 0);

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
            <h1 className="text-2xl font-bold text-white">Ingresos</h1>
          </div>
          <Button variant="primary" onClick={() => setShowForm(!showForm)}>
            {showForm ? 'Cancelar' : '+ Registrar ingreso'}
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
          <span className="font-mono text-sm font-semibold" style={{ color: 'rgba(100,230,180,0.9)' }}>
            Total: {formatCurrency(totalMonth)}
          </span>
        </div>

        {/* Form */}
        {showForm && (
          <Card title="Nuevo ingreso" neon>
            <IncomeForm onSubmit={handleCreate} onCancel={() => setShowForm(false)} />
          </Card>
        )}

        {/* Lista */}
        <Card title={`Ingresos — ${MONTHS[mes-1]} ${ano}`}>
          {loading ? (
            <div className="flex justify-center py-8"><Spinner /></div>
          ) : error ? (
            <p className="text-sm py-4 text-center" style={{ color: 'rgba(255,100,100,0.8)' }}>{error}</p>
          ) : incomes.length === 0 ? (
            <div className="flex flex-col items-center py-10 space-y-2">
              <span className="text-3xl" style={{ color: 'rgba(204,255,0,0.25)' }}>↑</span>
              <p className="text-white text-sm">Sin ingresos en este periodo</p>
            </div>
          ) : (
            <div className="divide-y" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
              {incomes.map((inc) => (
                <div key={inc.id} className="flex items-center justify-between py-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm font-medium truncate">{inc.description}</p>
                    <p className="font-mono text-[10px] mt-0.5" style={{ color: 'rgba(255,255,255,0.35)' }}>
                      {inc.date} · {TYPE_LABELS[inc.type] ?? inc.type}
                      {inc.is_recurring && <span style={{ color: 'rgba(204,255,0,0.5)' }}> · recurrente</span>}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 ml-4">
                    <span className="font-mono text-sm font-semibold" style={{ color: 'rgba(100,230,180,0.9)' }}>
                      +{formatCurrency(inc.amount)}
                    </span>
                    <button onClick={() => remove(inc.id)}
                      className="text-xs px-2 py-1 rounded transition-colors"
                      style={{ color: 'rgba(255,100,100,0.6)', background: 'rgba(255,100,100,0.06)' }}>
                      ×
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </DashboardLayout>
  );
}
