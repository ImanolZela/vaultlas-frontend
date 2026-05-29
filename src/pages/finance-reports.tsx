import { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/templates/DashboardLayout';
import { StatCard } from '@/components/molecules/StatCard';
import { Card } from '@/components/atoms/Card';
import { Spinner } from '@/components/atoms/Spinner';
import { apiCall } from '@/lib/api';
import { formatCurrency } from '@/lib/utils';
import type { MonthlyBudget } from '@/types';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const MONTHS_SHORT = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

export default function FinanceReports() {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [budgets, setBudgets] = useState<MonthlyBudget[]>([]);
  const [loading, setLoading] = useState(true);

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
              className="bg-vault-dark border border-gray-700 text-white text-sm rounded px-3 py-2 focus:outline-none focus:border-vault-neon"
            >
              {yearOptions.map((y) => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-16"><Spinner size="lg" /></div>
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

            {/* Income vs expenses chart */}
            <Card title="Ingresos vs Gastos por mes">
              {yearBudgets.length > 0 ? (
                <Bar data={incomeVsExpensesData} options={chartOptions} />
              ) : (
                <p className="text-gray-500 text-sm text-center py-8">
                  No hay datos para {year}.
                </p>
              )}
            </Card>

            {/* 50-30-20 compliance table */}
            <Card title="Cumplimiento 50-30-20">
              {yearBudgets.length > 0 ? (
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
              ) : (
                <p className="text-gray-500 text-sm text-center py-8">
                  No hay datos de presupuesto para {year}.
                </p>
              )}
            </Card>

            {/* Stacked distribution chart */}
            <Card title="Distribución por categoría">
              {yearBudgets.length > 0 ? (
                <Bar data={stackedData} options={stackedOptions} />
              ) : (
                <p className="text-gray-500 text-sm text-center py-8">
                  No hay datos para {year}.
                </p>
              )}
            </Card>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
