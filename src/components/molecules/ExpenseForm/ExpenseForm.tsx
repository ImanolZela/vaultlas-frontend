import React, { useState } from 'react';
import { Button } from '@/components/atoms/Button';
import type { ExpenseCreate, BudgetBucket } from '@/types';

interface ExpenseFormProps {
  onSubmit: (data: ExpenseCreate) => Promise<void>;
  onCancel: () => void;
}

const BUCKETS: { value: BudgetBucket; label: string; color: string }[] = [
  { value: 'needs',   label: 'Necesidades', color: 'rgba(100,180,255,0.8)' },
  { value: 'wants',   label: 'Gustos',      color: 'rgba(255,160,100,0.8)' },
  { value: 'savings', label: 'Ahorros',     color: 'rgba(100,230,180,0.8)' },
  { value: 'debt',    label: 'Deuda',       color: 'rgba(255,100,100,0.8)' },
];

const CATEGORIES: Record<BudgetBucket, string[]> = {
  needs:   ['Mercado', 'Alquiler', 'Transporte', 'Salud', 'Servicios', 'Educación', 'Otro'],
  wants:   ['Restaurante', 'Entretenimiento', 'Ropa', 'Viajes', 'Café', 'Suscripciones', 'Otro'],
  savings: ['Ahorro mensual', 'Inversión', 'Fondo de emergencia', 'Otro'],
  debt:    ['Tarjeta de crédito', 'Préstamo personal', 'Préstamo a persona', 'Otro'],
};

const inputStyle = { background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' };

export const ExpenseForm: React.FC<ExpenseFormProps> = ({ onSubmit, onCancel }) => {
  const today = new Date().toISOString().split('T')[0];
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    date: today,
    amount: '',
    bucket: 'needs' as BudgetBucket,
    category_name: 'Mercado',
    description: '',
    payment_method: 'card',
  });

  const set = (key: string, value: any) => setForm((prev) => ({ ...prev, [key]: value }));

  const handleBucketChange = (bucket: BudgetBucket) => {
    set('bucket', bucket);
    set('category_name', CATEGORIES[bucket][0]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await onSubmit({
        date: form.date,
        amount: parseFloat(form.amount),
        bucket: form.bucket,
        category_name: form.category_name,
        description: form.description,
        payment_method: form.payment_method as any,
      });
    } finally {
      setSaving(false);
    }
  };

  const labelCls = 'block font-mono text-[9px] tracking-widest uppercase mb-1.5';
  const labelStyle = { color: 'rgba(204,255,0,0.5)' };
  const inputCls = 'w-full rounded-md px-3 py-2 text-white text-sm outline-none';

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className={labelCls} style={labelStyle}>Fecha</label>
          <input type="date" value={form.date} onChange={(e) => set('date', e.target.value)}
            className={inputCls} style={inputStyle} required />
        </div>
        <div>
          <label className={labelCls} style={labelStyle}>Monto (S/.)</label>
          <input type="number" step="0.01" min="0.01" value={form.amount}
            onChange={(e) => set('amount', e.target.value)}
            placeholder="0.00" className={inputCls} style={inputStyle} required />
        </div>
      </div>

      <div>
        <label className={labelCls} style={labelStyle}>Bucket</label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {BUCKETS.map((b) => (
            <button key={b.value} type="button"
              onClick={() => handleBucketChange(b.value)}
              className="rounded-md py-2 px-1 text-xs font-medium transition-all"
              style={{
                color: form.bucket === b.value ? '#000' : b.color,
                background: form.bucket === b.value ? b.color : 'rgba(255,255,255,0.04)',
                border: `1px solid ${b.color}`,
              }}>
              {b.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className={labelCls} style={labelStyle}>Categoría</label>
          <select value={form.category_name} onChange={(e) => set('category_name', e.target.value)}
            className={inputCls} style={{ ...inputStyle, background: 'rgba(20,20,20,0.95)' }}>
            {CATEGORIES[form.bucket].map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div>
          <label className={labelCls} style={labelStyle}>Método de pago</label>
          <select value={form.payment_method} onChange={(e) => set('payment_method', e.target.value)}
            className={inputCls} style={{ ...inputStyle, background: 'rgba(20,20,20,0.95)' }}>
            <option value="card">Tarjeta</option>
            <option value="cash">Efectivo</option>
            <option value="transfer">Transferencia</option>
            <option value="other">Otro</option>
          </select>
        </div>
      </div>

      <div>
        <label className={labelCls} style={labelStyle}>Descripción</label>
        <input type="text" value={form.description} onChange={(e) => set('description', e.target.value)}
          placeholder="Ej: Compra en Plaza Vea" className={inputCls} style={inputStyle} required />
      </div>

      <div className="flex gap-3 pt-2">
        <Button type="submit" variant="primary" loading={saving} fullWidth>
          Registrar gasto
        </Button>
        <Button type="button" variant="secondary" onClick={onCancel} fullWidth>
          Cancelar
        </Button>
      </div>
    </form>
  );
};
