import { DashboardLayout } from '@/components/templates/DashboardLayout';
import { Card } from '@/components/atoms/Card';
import { Button } from '@/components/atoms/Button';

export default function ReconciliationPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-mono text-[10px] tracking-[0.2em] uppercase mb-1"
               style={{ color: 'rgba(204,255,0,0.55)' }}>
              Análisis
            </p>
            <h1 className="text-2xl font-bold text-white">Reconciliación</h1>
          </div>
        </div>

        <Card title="Cómo funciona">
          <div className="space-y-3 text-sm" style={{ color: 'rgba(255,255,255,0.6)' }}>
            <div className="flex items-start gap-3">
              <span style={{ color: 'var(--neon)', fontSize: '16px' }}>⊕</span>
              <span>Registras gastos e ingresos durante el mes</span>
            </div>
            <div className="flex items-start gap-3">
              <span style={{ color: 'var(--neon)', fontSize: '16px' }}>⇌</span>
              <span>Al fin de mes, subes el PDF del BCP</span>
            </div>
            <div className="flex items-start gap-3">
              <span style={{ color: 'var(--neon)', fontSize: '16px' }}>⇄</span>
              <span>El sistema compara automáticamente y detecta gastos olvidados</span>
            </div>
          </div>
        </Card>

        <Card title="Historial de reconciliaciones">
          <div className="flex flex-col items-center justify-center py-12 space-y-3">
            <span className="text-4xl" style={{ color: 'rgba(204,255,0,0.3)' }}>⇄</span>
            <p className="text-white font-medium">Sin reconciliaciones</p>
            <p className="text-sm" style={{ color: 'rgba(255,255,255,0.4)' }}>
              La reconciliación se inicia automáticamente al subir un PDF del BCP.
            </p>
            <Button variant="secondary" onClick={() => window.location.href = '/upload'}>
              Subir estado de cuenta
            </Button>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
}
