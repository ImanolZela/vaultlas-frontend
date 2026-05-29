import React, { useState } from 'react';
import { Button } from '@/components/atoms/Button';
import type { IncomeCreate, IncomType } from '@/types';

interface IncomeFormProps {
  onSubmit: (data: IncomeCreate) => Promise<void>;
  onCancel: () => void;
}

const INCOME_TYPES: { value: IncomType; label: string }[] = [
  { value: 'salary',    label: 'Sueldo' },
  { value: 'bonus',     label: 'Bono / Comisión' },
  { value: 'gift',      label: 'Regalo' },
  { value: 'freelance', label: 'Trabajo freelance' },
  { value: 'loan',      label: 'Préstamo recibido' },
  { value: 'sale',      label: 'Venta de artículos' },
  { value: 'other',     label: 'Otro' },
];

const inputStyle = {
  background: 'rgba(255,255,255,0.05)',
  border: '1px solid rgba(255,255,255,0.1)',
};

export const IncomeForm: React.FC<IncomeFormProps> = ({ onSubmit, onCancel }) => {
  const today = new Date().toISOString().split('T')[0];
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    date: today,
    type: 'salary' as IncomType,
    description: '',
    amount: '',
    is_recurring: false,
    recurring_day: 1,
  });

  const set = (key: string, value: any) => setForm((prev) => ({ ...prev, [key]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await onSubmit({
        date: form.date,
        type: form.type,
        description: form.description,
        amount: parseFloat(form.amount),
        is_recurring: form.is_recurring,
        recurring_day: form.is_recurring ? form.recurring_day : undefined,
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
          <label className={labelCls} style={labelStyle}>Tipo</label>
          <select value={form.type} onChange={(e) => set('type', e.target.value as IncomType)}
            className={inputCls} style={{ ...inputStyle, background: 'rgba(20,20,20,0.95)' }}>
            {INCOME_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
          </select>
        </div>
      </div>

      <div>
        <label className={labelCls} style={labelStyle}>Descripción</label>
        <input type="text" value={form.description} onChange={(e) => set('description', e.target.value)}
          placeholder="Ej: Sueldo de mayo" className={inputCls} style={inputStyle} required />
      </div>

      <div>
        <label className={labelCls} style={labelStyle}>Monto (S/.)</label>
        <input type="number" step="0.01" min="0.01" value={form.amount}
          onChange={(e) => set('amount', e.target.value)}
          placeholder="0.00" className={inputCls} style={inputStyle} required />
      </div>

      <div className="flex items-center gap-3 flex-wrap">
        <input type="checkbox" id="recurring" checked={form.is_recurring}
          onChange={(e) => set('is_recurring', e.target.checked)}
          className="accent-yellow-400" />
        <label htmlFor="recurring" className="text-sm" style={{ color: 'rgba(255,255,255,0.6)' }}>
          Se repite cada mes
        </label>
      </div>

      {form.is_recurring && (
        <div>
          <label className={labelCls} style={labelStyle}>Día del mes</label>
          <input type="number" min={1} max={31} value={form.recurring_day}
            onChange={(e) => set('recurring_day', parseInt(e.target.value))}
            className={inputCls} style={inputStyle} />
        </div>
      )}

      <div className="flex gap-3 pt-2">
        <Button type="submit" variant="primary" loading={saving} fullWidth>
          Registrar ingreso
        </Button>
        <Button type="button" variant="secondary" onClick={onCancel} fullWidth>
          Cancelar
        </Button>
      </div>
    </form>
  );
};
