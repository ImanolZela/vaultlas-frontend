import { DashboardLayout } from '@/components/templates/DashboardLayout';
import { Card } from '@/components/atoms/Card';
import { Button } from '@/components/atoms/Button';

export default function BudgetPage() {
  const currentMonth = new Date().toLocaleString('es-PE', { month: 'long', year: 'numeric' });

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-mono text-[10px] tracking-[0.2em] uppercase mb-1"
               style={{ color: 'rgba(204,255,0,0.55)' }}>
              {currentMonth}
            </p>
            <h1 className="text-2xl font-bold text-white">Presupuesto 50-30-20</h1>
          </div>
          <Button variant="primary">
            Configurar presupuesto
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { label: 'Necesidades', pct: 50, icon: '◧', color: 'rgba(100,180,255,0.8)' },
            { label: 'Gustos',      pct: 30, icon: '◨', color: 'rgba(255,160,100,0.8)' },
            { label: 'Ahorros',     pct: 20, icon: '◩', color: 'rgba(100,230,180,0.8)' },
            { label: 'Deuda',       pct: 0,  icon: '◪', color: 'rgba(255,100,100,0.8)' },
          ].map((bucket) => (
            <div
              key={bucket.label}
              className="rounded-lg p-5"
              style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span style={{ color: bucket.color, fontSize: '18px' }}>{bucket.icon}</span>
                  <span className="text-white font-medium">{bucket.label}</span>
                </div>
                <span className="font-mono text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>
                  {bucket.pct}%
                </span>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm" style={{ color: 'rgba(255,255,255,0.5)' }}>
                  <span>Presupuestado</span>
                  <span>S/. 0.00</span>
                </div>
                <div className="w-full rounded-full h-1.5" style={{ background: 'rgba(255,255,255,0.08)' }}>
                  <div className="h-1.5 rounded-full" style={{ width: '0%', background: bucket.color }} />
                </div>
                <div className="flex justify-between text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>
                  <span>0% usado</span>
                  <span>S/. 0.00 disponible</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        <Card title="Configura tu presupuesto">
          <div className="flex flex-col items-center justify-center py-8 space-y-3">
            <span className="text-4xl" style={{ color: 'rgba(204,255,0,0.3)' }}>◉</span>
            <p className="text-white font-medium">Sin presupuesto configurado</p>
            <p className="text-sm text-center max-w-sm" style={{ color: 'rgba(255,255,255,0.4)' }}>
              Configura tu presupuesto mensual usando el modelo 50-30-20 o personaliza tus propios porcentajes.
            </p>
            <Button variant="primary">Configurar ahora</Button>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
}
