import { DashboardLayout } from '@/components/templates/DashboardLayout';
import { Card } from '@/components/atoms/Card';
import { Button } from '@/components/atoms/Button';

export default function ExpensePage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-mono text-[10px] tracking-[0.2em] uppercase mb-1"
               style={{ color: 'rgba(204,255,0,0.55)' }}>
              Finanzas
            </p>
            <h1 className="text-2xl font-bold text-white">Gastos</h1>
          </div>
          <Button variant="primary">
            + Registrar gasto
          </Button>
        </div>

        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {(['needs', 'wants', 'savings', 'debt'] as const).map((bucket) => {
            const labels = {
              needs: { label: 'Necesidades', icon: '◧', color: 'rgba(100,180,255,0.7)' },
              wants: { label: 'Gustos',       icon: '◨', color: 'rgba(255,160,100,0.7)' },
              savings: { label: 'Ahorros',    icon: '◩', color: 'rgba(100,230,180,0.7)' },
              debt: { label: 'Deuda',         icon: '◪', color: 'rgba(255,100,100,0.7)' },
            };
            const { label, icon, color } = labels[bucket];
            return (
              <div
                key={bucket}
                className="rounded-lg p-4 text-center"
                style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
              >
                <span className="text-2xl block mb-1" style={{ color }}>{icon}</span>
                <p className="font-mono text-[9px] tracking-widest uppercase" style={{ color: 'rgba(255,255,255,0.4)' }}>{label}</p>
                <p className="text-white font-bold text-lg mt-1">S/. 0.00</p>
              </div>
            );
          })}
        </div>

        <Card title="Historial de gastos">
          <div className="flex flex-col items-center justify-center py-12 space-y-3">
            <span className="text-4xl" style={{ color: 'rgba(204,255,0,0.3)' }}>↓</span>
            <p className="text-white font-medium">Sin gastos registrados</p>
            <p className="text-sm" style={{ color: 'rgba(255,255,255,0.4)' }}>
              Registra tus gastos y asígnalos a un bucket del presupuesto 50-30-20.
            </p>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
}
