import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/templates/DashboardLayout';
import { StatCard } from '@/components/molecules/StatCard';
import { Card } from '@/components/atoms/Card';
import { Spinner } from '@/components/atoms/Spinner';
import { apiCall } from '@/lib/api';
import { formatCurrency } from '@/lib/utils';
import type { MonthlyReport } from '@/types';
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

interface HistoricResponse {
  reportes: MonthlyReport[];
}

export default function Reports() {
  const today = new Date();
  const [mes, setMes] = useState(today.getMonth() + 1);
  const [ano, setAno] = useState(today.getFullYear());
  const [report, setReport] = useState<MonthlyReport | null>(null);
  const [historic, setHistoric] = useState<MonthlyReport[]>([]);
  const [loading, setLoading] = useState(true);

  const loadReport = async () => {
    setLoading(true);
    try {
      const [monthly, hist] = await Promise.all([
        apiCall<MonthlyReport>(`/api/reports/monthly?mes=${mes}&ano=${ano}`),
        apiCall<HistoricResponse>('/api/reports/historic?months=6'),
      ]);
      setReport(monthly);
      setHistoric(hist.reportes ?? []);
    } catch (err) {
      console.error('Error cargando reporte:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadReport(); }, [mes, ano]);

  const MONTHS = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

  const chartData = {
    labels: [...historic].reverse().map((r) => `${MONTHS[r.mes - 1]} ${r.ano}`),
    datasets: [
      {
        label: 'Ingresos',
        data: [...historic].reverse().map((r) => r.total_ingresos),
        backgroundColor: '#10B981',
        borderRadius: 4,
      },
      {
        label: 'Egresos',
        data: [...historic].reverse().map((r) => r.total_egresos),
        backgroundColor: '#EF4444',
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

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <h1 className="text-3xl font-bold text-white">Reportes</h1>
          <div className="flex gap-3 items-center">
            <select
              value={mes}
              onChange={(e) => setMes(Number(e.target.value))}
              className="bg-vault-dark border border-vault-dark text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-vault-neon"
            >
              {MONTHS.map((m, i) => (
                <option key={i} value={i + 1}>{m}</option>
              ))}
            </select>
            <select
              value={ano}
              onChange={(e) => setAno(Number(e.target.value))}
              className="bg-vault-dark border border-vault-dark text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-vault-neon"
            >
              {[today.getFullYear(), today.getFullYear() - 1, today.getFullYear() - 2].map((y) => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-16"><Spinner size="lg" /></div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard title="Ingresos" value={formatCurrency(report?.total_ingresos ?? 0)} valueColor="text-vault-emerald" />
              <StatCard title="Egresos" value={formatCurrency(report?.total_egresos ?? 0)} valueColor="text-vault-coral" />
              <StatCard
                title="Neto"
                value={formatCurrency(report?.neto ?? 0)}
                valueColor={(report?.neto ?? 0) >= 0 ? 'text-vault-blue' : 'text-vault-coral'}
              />
              <StatCard
                title="Meta cumplida"
                value={report?.cumplimiento_porcentaje != null ? `${report.cumplimiento_porcentaje.toFixed(1)}%` : '—'}
                valueColor={
                  report?.cumplimiento_porcentaje == null ? 'text-gray-500'
                  : report.cumplimiento_porcentaje >= 100 ? 'text-vault-emerald'
                  : 'text-vault-amber'
                }
              />
            </div>

            <Card title="Evolución histórica (últimos 6 meses)">
              {historic.length > 0 ? (
                <Bar data={chartData} options={chartOptions} />
              ) : (
                <p className="text-gray-500 text-sm text-center py-8">No hay datos históricos disponibles.</p>
              )}
            </Card>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
