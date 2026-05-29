import { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/templates/DashboardLayout';
import { StatCard } from '@/components/molecules/StatCard';
import { Card } from '@/components/atoms/Card';
import { Spinner } from '@/components/atoms/Spinner';
import { apiCall } from '@/lib/api';
import { apiDownload } from '@/lib/api';
import { formatCurrency } from '@/lib/utils';
import type { MonthlyBudget } from '@/types';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar, Line } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, Title, Tooltip, Legend);

const MONTHS_SHORT = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

export default function FinanceReports() {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [budgets, setBudgets] = useState<MonthlyBudget[]>([]);
  const [loading, setLoading] = useState(true);

  // Export state
  const [exportPeriodType, setExportPeriodType] = useState<'mes' | 'ano'>('ano');
  const [exportMes, setExportMes] = useState(now.getMonth() + 1);
  const [exporting, setExporting] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBudgets = async () => {
      setLoading(true);
      try {
        const data = await apiCall<MonthlyBudget[]>('/api/budget/');
        setBudgets(data ?? []);
      } catch (err) {
        console.error('Error cargando presupuestos:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchBudgets();
  }, []);

  // Filter by selected year
  const yearBudgets = budgets.filter((b) => {
    const d = new Date(b.month + 'T00:00:00');
    return d.getFullYear() === year;
  });

  // Build a 12-slot array indexed by month (0=Jan)
  const monthlySlots: (MonthlyBudget | null)[] = Array(12).fill(null);
  yearBudgets.forEach((b) => {
    const d = new Date(b.month + 'T00:00:00');
    monthlySlots[d.getMonth()] = b;
  });

  // Stat cards
  const totalIngresos = yearBudgets.reduce((s, b) => s + (b.total_income ?? 0), 0);
  const totalGastos = yearBudgets.reduce(
    (s, b) => s + (b.actual_needs ?? 0) + (b.actual_wants ?? 0) + (b.actual_savings ?? 0) + (b.actual_debt ?? 0),
    0
  );
  const totalNeto = totalIngresos - totalGastos;

  // Export handler
  const handleExport = async (format: 'pdf' | 'excel') => {
    setExporting(true);
    setExportError(null);
    try {
      const ext = format === 'pdf' ? 'pdf' : 'xlsx';
      const params = exportPeriodType === 'mes'
        ? `ano=${year}&mes=${exportMes}`
        : `ano=${year}`;
      const filename = exportPeriodType === 'mes'
        ? `presupuesto_${year}_${String(exportMes).padStart(2, '0')}.${ext}`
        : `presupuesto_${year}.${ext}`;
      await apiDownload(`/api/exports/budget/${format}?${params}`, filename);
    } catch (err: unknown) {
      setExportError(err instanceof Error ? err.message : 'Error al exportar');
    } finally {
      setExporting(false);
    }
  };

  // Income vs expenses bar chart
  const incomeVsExpensesData = {
    labels: MONTHS_SHORT,
    datasets: [
      {
        label: 'Ingresos',
        data: monthlySlots.map((b) => b?.total_income ?? 0),
        backgroundColor: 'rgba(52,211,153,0.75)',
        borderRadius: 4,
      },
      {
        label: 'Gastos',
        data: monthlySlots.map((b) =>
          b ? (b.actual_needs ?? 0) + (b.actual_wants ?? 0) + (b.actual_savings ?? 0) + (b.actual_debt ?? 0) : 0
        ),
        backgroundColor: 'rgba(252,129,107,0.75)',
        borderRadius: 4,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { labels: { color: '#9CA3AF' } },
      title: { display: false },
    },
    scales: {
      x: { ticks: { color: '#9CA3AF' }, grid: { color: '#1A1A1A' } },
      y: { ticks: { color: '#9CA3AF' }, grid: { color: '#1A1A1A' } },
    },
  };

  // Net monthly bar chart
  const netData = {
    labels: MONTHS_SHORT,
    datasets: [
      {
        label: 'Neto mensual',
        data: monthlySlots.map((b) =>
          b
            ? +((b.total_income ?? 0) - (b.actual_needs ?? 0) - (b.actual_wants ?? 0) - (b.actual_savings ?? 0) - (b.actual_debt ?? 0)).toFixed(2)
            : null
        ),
        backgroundColor: monthlySlots.map((b) => {
          if (!b) return 'transparent';
          const net =
            (b.total_income ?? 0) -
            (b.actual_needs ?? 0) -
            (b.actual_wants ?? 0) -
            (b.actual_savings ?? 0) -
            (b.actual_debt ?? 0);
          return net >= 0 ? 'rgba(100,230,180,0.7)' : 'rgba(255,100,100,0.7)';
        }),
        borderRadius: 4,
      },
    ],
  };

  const netOptions = {
    responsive: true,
    plugins: {
      legend: { labels: { color: '#9CA3AF' } },
      title: { display: false },
    },
    scales: {
      x: { ticks: { color: '#9CA3AF' }, grid: { color: '#1A1A1A' } },
      y: { ticks: { color: '#9CA3AF' }, grid: { color: '#1A1A1A' } },
    },
  };

  // Stacked distribution chart
  const stackedData = {
    labels: MONTHS_SHORT,
    datasets: [
      {
        label: 'Necesidades',
        data: monthlySlots.map((b) => b?.actual_needs ?? 0),
        backgroundColor: 'rgba(100,180,255,0.75)',
        borderRadius: 2,
      },
      {
        label: 'Gustos',
        data: monthlySlots.map((b) => b?.actual_wants ?? 0),
        backgroundColor: 'rgba(255,160,100,0.75)',
        borderRadius: 2,
      },
      {
        label: 'Ahorros',
        data: monthlySlots.map((b) => b?.actual_savings ?? 0),
        backgroundColor: 'rgba(100,230,180,0.75)',
        borderRadius: 2,
      },
      {
        label: 'Deuda',
        data: monthlySlots.map((b) => b?.actual_debt ?? 0),
        backgroundColor: 'rgba(255,100,100,0.75)',
        borderRadius: 2,
      },
    ],
  };

  const stackedOptions = {
    responsive: true,
    plugins: {
      legend: { labels: { color: '#9CA3AF' } },
      title: { display: false },
    },
    scales: {
      x: { stacked: true, ticks: { color: '#9CA3AF' }, grid: { color: '#1A1A1A' } },
      y: { stacked: true, ticks: { color: '#9CA3AF' }, grid: { color: '#1A1A1A' } },
    },
  };

  // Savings rate line chart
  const savingsRateData = {
    labels: MONTHS_SHORT,
    datasets: [
      {
        label: 'Tasa de ahorro %',
        data: monthlySlots.map((b) =>
          b && (b.total_income ?? 0) > 0
            ? +((b.actual_savings ?? 0) / b.total_income * 100).toFixed(1)
            : null
        ),
        borderColor: 'rgba(100,230,180,0.8)',
        backgroundColor: 'rgba(100,230,180,0.1)',
        tension: 0.4,
        fill: true,
        pointBackgroundColor: 'rgba(100,230,180,0.9)',
        spanGaps: true,
      },
    ],
  };

  const lineOptions = {
    responsive: true,
    plugins: {
      legend: { labels: { color: '#9CA3AF' } },
      title: { display: false },
    },
    scales: {
      x: { ticks: { color: '#9CA3AF' }, grid: { color: '#1A1A1A' } },
      y: {
        ticks: { color: '#9CA3AF', callback: (v: unknown) => v + '%' },
        grid: { color: '#1A1A1A' },
        min: 0,
      },
    },
  };

  // Year options: current year ± 3
  const yearOptions = Array.from({ length: 7 }, (_, i) => now.getFullYear() - 3 + i);

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <p className="font-mono text-xs tracking-widest uppercase" style={{ color: 'rgba(204,255,0,0.45)' }}>
              Finanzas
            </p>
            <h1 className="text-3xl font-bold text-white mt-1">Reportes Financieros</h1>
          </div>
          <div className="flex items-center gap-2">
            <label className="text-xs text-gray-400 font-mono">Año</label>
            <select
              value={year}
              onChange={(e) => setYear(Number(e.target.value))}
              className="rounded-md px-3 py-1.5 text-white text-sm outline-none"
              style={{ background: 'rgba(20,20,20,0.95)', border: '1px solid rgba(255,255,255,0.1)' }}
            >
              {yearOptions.map((y) => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-16"><Spinner size="lg" /></div>
        ) : yearBudgets.length === 0 ? (
          <Card>
            <div className="flex flex-col items-center py-12 space-y-3">
              <span className="text-4xl" style={{ color: 'rgba(204,255,0,0.2)' }}>◎</span>
              <p className="text-white font-medium">Sin datos para {year}</p>
              <p className="text-sm text-center max-w-sm" style={{ color: 'rgba(255,255,255,0.4)' }}>
                Registra ingresos y gastos para ver tus reportes financieros aquí.
              </p>
            </div>
          </Card>
        ) : (
          <>
            {/* Stat cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <StatCard
                title={`Ingresos ${year}`}
                value={formatCurrency(totalIngresos)}
                valueColor="text-vault-emerald"
              />
              <StatCard
                title={`Gastos ${year}`}
                value={formatCurrency(totalGastos)}
                valueColor="text-vault-coral"
              />
              <StatCard
                title={`Neto ${year}`}
                value={formatCurrency(totalNeto)}
                valueColor={totalNeto >= 0 ? 'text-vault-blue' : 'text-vault-coral'}
              />
            </div>

            {/* Export card */}
            <Card title="Exportar reporte">
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Período</label>
                    <select
                      value={exportPeriodType}
                      onChange={(e) => setExportPeriodType(e.target.value as 'mes' | 'ano')}
                      className="w-full bg-vault-dark border border-gray-700 text-white text-sm rounded px-3 py-2 focus:outline-none focus:border-vault-neon"
                    >
                      <option value="ano">Año completo</option>
                      <option value="mes">Mes específico</option>
                    </select>
                  </div>
                  {exportPeriodType === 'mes' && (
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">Mes</label>
                      <select
                        value={exportMes}
                        onChange={(e) => setExportMes(Number(e.target.value))}
                        className="w-full bg-vault-dark border border-gray-700 text-white text-sm rounded px-3 py-2 focus:outline-none focus:border-vault-neon"
                      >
                        {MONTHS_SHORT.map((m, i) => (
                          <option key={i + 1} value={i + 1}>{m}</option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>

                {exportError && (
                  <p className="text-vault-coral text-sm">{exportError}</p>
                )}

                <div className="flex gap-3">
                  <button
                    onClick={() => handleExport('pdf')}
                    disabled={exporting}
                    className="flex items-center gap-2 px-4 py-2 bg-vault-neon text-vault-dark text-sm font-semibold rounded hover:bg-vault-neon/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {exporting ? '...' : '↓ PDF'}
                  </button>
                  <button
                    onClick={() => handleExport('excel')}
                    disabled={exporting}
                    className="flex items-center gap-2 px-4 py-2 bg-vault-dark border border-vault-neon text-vault-neon text-sm font-semibold rounded hover:bg-vault-neon/10 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {exporting ? '...' : '↓ Excel'}
                  </button>
                </div>
              </div>
            </Card>

            {/* Section: Evolución mensual */}
            <div className="flex items-center gap-3">
              <span className="font-mono text-[9px] tracking-[0.2em] uppercase" style={{ color: 'rgba(204,255,0,0.45)' }}>
                Evolución mensual
              </span>
              <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.06)' }} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card title="Ingresos vs Gastos por mes">
                <Bar data={incomeVsExpensesData} options={chartOptions} />
              </Card>
              <Card title="Neto mensual">
                <Bar data={netData} options={netOptions} />
              </Card>
            </div>

            {/* Section: Composición del gasto */}
            <div className="flex items-center gap-3">
              <span className="font-mono text-[9px] tracking-[0.2em] uppercase" style={{ color: 'rgba(204,255,0,0.45)' }}>
                Composición del gasto
              </span>
              <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.06)' }} />
            </div>

            <Card title="Distribución por categoría">
              <Bar data={stackedData} options={stackedOptions} />
            </Card>

            {/* Section: Eficiencia financiera */}
            <div className="flex items-center gap-3">
              <span className="font-mono text-[9px] tracking-[0.2em] uppercase" style={{ color: 'rgba(204,255,0,0.45)' }}>
                Eficiencia financiera
              </span>
              <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.06)' }} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card title="Tasa de ahorro mensual %">
                <Line data={savingsRateData} options={lineOptions} />
              </Card>

              <Card title="Cumplimiento 50-30-20">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-left border-b border-gray-800">
                        <th className="pb-3 font-mono text-xs text-gray-400 uppercase tracking-wider">Mes</th>
                        <th className="pb-3 font-mono text-xs text-gray-400 uppercase tracking-wider">Ingresos</th>
                        <th className="pb-3 font-mono text-xs text-gray-400 uppercase tracking-wider">Necesidades</th>
                        <th className="pb-3 font-mono text-xs text-gray-400 uppercase tracking-wider">Gustos</th>
                        <th className="pb-3 font-mono text-xs text-gray-400 uppercase tracking-wider">Ahorros</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-800/50">
                      {monthlySlots.map((b, idx) => {
                        if (!b) return null;
                        const needsPct = b.budgeted_needs > 0 ? (b.actual_needs / b.budgeted_needs) * 100 : null;
                        const wantsPct = b.budgeted_wants > 0 ? (b.actual_wants / b.budgeted_wants) * 100 : null;
                        const savingsPct = b.budgeted_savings > 0 ? (b.actual_savings / b.budgeted_savings) * 100 : null;

                        const pctColor = (pct: number | null) =>
                          pct === null ? 'text-gray-500' : pct > 100 ? 'text-red-400' : 'text-emerald-400';

                        const fmtPct = (actual: number, budgeted: number, pct: number | null) =>
                          pct === null
                            ? `${formatCurrency(actual)}`
                            : `${formatCurrency(actual)} · ${pct.toFixed(0)}%`;

                        return (
                          <tr key={idx} className="hover:bg-white/[0.02] transition-colors">
                            <td className="py-3 font-mono text-white font-semibold">{MONTHS_SHORT[idx]}</td>
                            <td className="py-3 text-gray-300">{formatCurrency(b.total_income)}</td>
                            <td className={`py-3 font-mono ${pctColor(needsPct)}`}>
                              {fmtPct(b.actual_needs, b.budgeted_needs, needsPct)}
                            </td>
                            <td className={`py-3 font-mono ${pctColor(wantsPct)}`}>
                              {fmtPct(b.actual_wants, b.budgeted_wants, wantsPct)}
                            </td>
                            <td className={`py-3 font-mono ${pctColor(savingsPct)}`}>
                              {fmtPct(b.actual_savings, b.budgeted_savings, savingsPct)}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </Card>
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
