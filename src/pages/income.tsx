import { DashboardLayout } from '@/components/templates/DashboardLayout';
import { Card } from '@/components/atoms/Card';
import { Button } from '@/components/atoms/Button';
import { useRouter } from 'next/router';

export default function IncomePage() {
  const router = useRouter();

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-mono text-[10px] tracking-[0.2em] uppercase mb-1"
               style={{ color: 'rgba(204,255,0,0.55)' }}>
              Finanzas
            </p>
            <h1 className="text-2xl font-bold text-white">Ingresos</h1>
          </div>
          <Button variant="primary">
            + Registrar ingreso
          </Button>
        </div>

        <Card title="Historial de ingresos">
          <div className="flex flex-col items-center justify-center py-12 space-y-3">
            <span className="text-4xl" style={{ color: 'rgba(204,255,0,0.3)' }}>↑</span>
            <p className="text-white font-medium">Sin ingresos registrados</p>
            <p className="text-sm" style={{ color: 'rgba(255,255,255,0.4)' }}>
              Registra tus ingresos diarios para llevar un control preciso.
            </p>
            <Button variant="primary" onClick={() => {}}>
              Registrar primer ingreso
            </Button>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
}
