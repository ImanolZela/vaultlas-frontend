import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/templates/DashboardLayout';
import { Card } from '@/components/atoms/Card';
import { Input } from '@/components/atoms/Input';
import { Button } from '@/components/atoms/Button';
import { apiCall } from '@/lib/api';
import type { Goal } from '@/types';

const MONTHS = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

export default function Settings() {
  const today = new Date();
  const [mes, setMes] = useState(today.getMonth() + 1);
  const [ano, setAno] = useState(today.getFullYear());
  const [metaIngresos, setMetaIngresos] = useState('');
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);

  const loadGoal = async () => {
    try {
      const goal = await apiCall<Goal>(`/api/goals/${mes}/${ano}`);
      setMetaIngresos(String(goal.meta_ingresos));
    } catch {
      setMetaIngresos('');
    }
  };

  useEffect(() => {
    loadGoal();
    setFeedback(null);
  }, [mes, ano]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const value = parseFloat(metaIngresos);
    if (isNaN(value) || value <= 0) {
      setFeedback({ type: 'error', msg: 'Ingresa un monto válido mayor a 0.' });
      return;
    }

    setSaving(true);
    setFeedback(null);
    try {
      await apiCall<Goal>('/api/goals/', {
        method: 'POST',
        body: JSON.stringify({ mes, ano, meta_ingresos: value }),
      });
      setFeedback({ type: 'success', msg: `Meta de ${MONTHS[mes - 1]} ${ano} guardada correctamente.` });
    } catch (err: unknown) {
      setFeedback({ type: 'error', msg: err instanceof Error ? err.message : 'Error al guardar.' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-md mx-auto space-y-6">
        <h1 className="text-3xl font-bold text-white">Configuración</h1>

        <Card title="Meta mensual de ingresos" neon>
          <form onSubmit={handleSave} className="space-y-5">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Mes</label>
                <select
                  value={mes}
                  onChange={(e) => setMes(Number(e.target.value))}
                  className="w-full bg-vault-dark border border-vault-dark text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-vault-neon"
                >
                  {MONTHS.map((m, i) => (
                    <option key={i} value={i + 1}>{m}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Año</label>
                <select
                  value={ano}
                  onChange={(e) => setAno(Number(e.target.value))}
                  className="w-full bg-vault-dark border border-vault-dark text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-vault-neon"
                >
                  {[today.getFullYear(), today.getFullYear() - 1].map((y) => (
                    <option key={y} value={y}>{y}</option>
                  ))}
                </select>
              </div>
            </div>

            <Input
              label="Meta de ingresos (S/)"
              type="number"
              min="0"
              step="0.01"
              placeholder="Ej: 5000.00"
              value={metaIngresos}
              onChange={(e) => setMetaIngresos(e.target.value)}
            />

            {feedback && (
              <div className={`rounded-lg p-3 border ${
                feedback.type === 'success'
                  ? 'bg-vault-emerald/10 border-vault-emerald'
                  : 'bg-vault-coral/10 border-vault-coral'
              }`}>
                <p className={`text-sm ${feedback.type === 'success' ? 'text-vault-emerald' : 'text-vault-coral'}`}>
                  {feedback.msg}
                </p>
              </div>
            )}

            <Button type="submit" variant="primary" loading={saving} className="w-full">
              {saving ? 'Guardando...' : 'Guardar meta'}
            </Button>
          </form>
        </Card>
      </div>
    </DashboardLayout>
  );
}
