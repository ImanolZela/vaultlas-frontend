import { useState } from 'react';
import { DashboardLayout } from '@/components/templates/DashboardLayout';
import { Card } from '@/components/atoms/Card';
import { StatCard } from '@/components/molecules/StatCard';
import { Spinner } from '@/components/atoms/Spinner';
import { useAnnualSummary } from '@/hooks/useAnnualSummary';
import { formatCurrency } from '@/lib/utils';

const MONTH_NAMES = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];

export default function AnnualSummaryPage() {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const { summary, loading, error } = useAnnualSummary(year);

  const maxIncome = summary
    ? Math.max(...summary.months.map((m) => m.total_income), 1)
    : 1;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <p className="font-mono text-[10px] tracking-[0.2em] uppercase mb-1"
               style={{ color: 'rgba(204,255,0,0.55)' }}>Estadísticas</p>
            <h1 className="text-2xl font-bold text-white">Resumen Anual</h1>
          </div>
          <select value={year} onChange={(e) => setYear(Number(e.target.value))}
            className="rounded-md px-3 py-1.5 text-white text-sm outline-none"
            style={{ background: 'rgba(20,20,20,0.95)', border: '1px solid rgba(255,255,255,0.1)' }}>
            {[year-2, year-1, year, year+1].map((y) => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>

        {loading ? (
          <div className="flex justify-center py-16"><Spinner size="lg" /></div>
        ) : error || !summary ? (
          <Card title={`${year}`}>
            <div className="flex flex-col items-center py-12 space-y-3">
              <span className="text-4xl" style={{ color: 'rgba(204,255,0,0.3)' }}>◐</span>
              <p className="text-white font-medium">Sin datos anuales para {year}</p>
              <p className="text-sm text-center max-w-sm" style={{ color: 'rgba(255,255,255,0.4)' }}>
                El resumen anual se genera automáticamente a medida que cierras meses con reconciliación.
              </p>
            </div>
          </Card>
        ) : (
          <>
            {/* Annual totals */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <StatCard title="Ingresos totales" value={formatCurrency(summary.total_income)} valueColor="text-vault-emerald" />
              <StatCard title="Gastos totales"   value={formatCurrency(summary.total_expenses)} valueColor="text-vault-coral" />
              <StatCard title="Ahorrado"          value={formatCurrency(summary.total_savings)} valueColor="text-vault-blue" />
              <StatCard title="Neto del año"      value={formatCurrency(summary.net)}
                valueColor={summary.net >= 0 ? 'text-vault-blue' : 'text-vault-coral'} />
            </div>

            {/* Monthly bar chart */}
            <Card title={`Ingresos por mes — ${year}`}>
              <div className="flex items-end gap-1 sm:gap-2 h-36 pt-4">
                {MONTH_NAMES.map((name, i) => {
                  const monthData = summary.months.find((m) => {
                    const d = new Date(m.month);
                    return d.getUTCMonth() === i;
                  });
                  const income = monthData?.total_income ?? 0;
                  const net = monthData?.net ?? 0;
                  const barH = income > 0 ? Math.max((income / maxIncome) * 100, 4) : 0;
                  return (
                    <div key={name} className="flex-1 flex flex-col items-center gap-1 group">
                      <div className="relative w-full flex justify-center">
                        {income > 0 && (
                          <div className="absolute bottom-full mb-1 hidden group-hover:block text-center z-10">
                            <div className="rounded px-2 py-1 text-[10px] font-mono whitespace-nowrap"
                              style={{ background: 'rgba(0,0,0,0.85)', color: 'rgba(255,255,255,0.8)' }}>
                              {formatCurrency(income)}
                            </div>
                          </div>
                        )}
                        <div className="w-full rounded-t transition-all duration-700"
                          style={{
                            height: `${barH}%`,
                            minHeight: income > 0 ? '4px' : '0',
                            background: net >= 0
                              ? 'linear-gradient(to top, rgba(100,230,180,0.6), rgba(100,230,180,0.85))'
                              : 'linear-gradient(to top, rgba(255,100,100,0.5), rgba(255,100,100,0.75))',
                          }} />
                      </div>
                      <span className="font-mono text-[9px] uppercase" style={{ color: 'rgba(255,255,255,0.3)' }}>
                        {name}
                      </span>
                    </div>
                  );
                })}
              </div>
            </Card>

            {/* Monthly breakdown table */}
            <Card title="Desglose mensual">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="font-mono text-[9px] uppercase tracking-widest"
                      style={{ color: 'rgba(255,255,255,0.3)' }}>
                      <th className="text-left py-2 pr-4">Mes</th>
                      <th className="text-right py-2 px-2">Ingresos</th>
                      <th className="text-right py-2 px-2">Necesidades</th>
                      <th className="text-right py-2 px-2">Gustos</th>
                      <th className="text-right py-2 px-2">Ahorros</th>
                      <th className="text-right py-2 pl-2">Neto</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y" style={{ borderColor: 'rgba(255,255,255,0.04)' }}>
                    {summary.months.map((m) => {
                      const d = new Date(m.month);
                      const monthName = MONTH_NAMES[d.getUTCMonth()];
                      return (
                        <tr key={m.month} className="transition-colors hover:bg-white/[0.02]">
                          <td className="py-2.5 pr-4">
                            <span className="text-white font-medium">{monthName}</span>
                          </td>
                          <td className="text-right py-2.5 px-2 font-mono text-xs"
                            style={{ color: 'rgba(100,230,180,0.8)' }}>
                            {formatCurrency(m.total_income)}
                          </td>
                          <td className="text-right py-2.5 px-2 font-mono text-xs"
                            style={{ color: 'rgba(100,180,255,0.7)' }}>
                            {formatCurrency(m.total_needs)}
                          </td>
                          <td className="text-right py-2.5 px-2 font-mono text-xs"
                            style={{ color: 'rgba(255,160,100,0.7)' }}>
                            {formatCurrency(m.total_wants)}
                          </td>
                          <td className="text-right py-2.5 px-2 font-mono text-xs"
                            style={{ color: 'rgba(100,230,180,0.7)' }}>
                            {formatCurrency(m.total_savings)}
                          </td>
                          <td className="text-right py-2.5 pl-2 font-mono text-xs font-semibold"
                            style={{ color: m.net >= 0 ? 'rgba(100,230,180,0.9)' : 'rgba(255,100,100,0.8)' }}>
                            {m.net >= 0 ? '+' : ''}{formatCurrency(m.net)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </Card>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
