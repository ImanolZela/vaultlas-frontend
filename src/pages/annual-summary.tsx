import { DashboardLayout } from '@/components/templates/DashboardLayout';
import { Card } from '@/components/atoms/Card';
import { StatCard } from '@/components/molecules/StatCard';

export default function AnnualSummaryPage() {
  const year = new Date().getFullYear();

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <p className="font-mono text-[10px] tracking-[0.2em] uppercase mb-1"
             style={{ color: 'rgba(204,255,0,0.55)' }}>
            Estadísticas
          </p>
          <h1 className="text-2xl font-bold text-white">Resumen Anual {year}</h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatCard
            title="Ingresos del año"
            value="S/. 0.00"
            valueColor="text-vault-emerald"
          />
          <StatCard
            title="Gastos del año"
            value="S/. 0.00"
            valueColor="text-vault-coral"
          />
          <StatCard
            title="Ahorrado"
            value="S/. 0.00"
            valueColor="text-vault-blue"
          />
        </div>

        <Card title={`Evolución ${year}`}>
          <div className="flex flex-col items-center justify-center py-12 space-y-3">
            <span className="text-4xl" style={{ color: 'rgba(204,255,0,0.3)' }}>◐</span>
            <p className="text-white font-medium">Sin datos anuales todavía</p>
            <p className="text-sm text-center max-w-sm" style={{ color: 'rgba(255,255,255,0.4)' }}>
              El resumen anual se genera automáticamente a medida que cierras meses con reconciliación.
            </p>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
}
