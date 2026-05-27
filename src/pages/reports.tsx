import { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/templates/DashboardLayout';
import { StatCard } from '@/components/molecules/StatCard';
import { Card } from '@/components/atoms/Card';
import { Spinner } from '@/components/atoms/Spinner';
import { apiCall } from '@/lib/api';
import { apiDownload } from '@/lib/api';
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
  const [historic, setHistoric] = useState<MonthlyReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [exportType, setExportType] = useState<'ingresos' | 'egresos' | 'ambos'>('ambos');
  const [exportPeriodType, setExportPeriodType] = useState<'mes' | 'ano' | 'historico'>('historico');
  const [exportMes, setExportMes] = useState<number>(new Date().getMonth() + 1);
  const [exportAno, setExportAno] = useState<number>(new Date().getFullYear());
  const [exporting, setExporting] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);

  const handleExport = async (format: 'pdf' | 'excel') => {
    setExporting(true);
    setExportError(null);
    try {
      const params = new URLSearchParams({ report_type: exportType });
      if (exportPeriodType === 'mes') {
        params.set('mes', String(exportMes));
        params.set('ano', String(exportAno));
      } else if (exportPeriodType === 'ano') {
        params.set('ano', String(exportAno));
      }
      const ext = format === 'pdf' ? 'pdf' : 'xlsx';
      const endpoint = `/api/exports/${format}?${params.toString()}`;
      const MONTHS_LOWER = ['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre'];
      let filename: string;
      if (exportPeriodType === 'mes') {
        filename = `${MONTHS_LOWER[exportMes - 1]}_${exportAno}_${exportType}_mensual.${ext}`;
      } else if (exportPeriodType === 'ano') {
        filename = `${exportAno}_${exportType}_anual.${ext}`;
      } else {
        filename = `historico_${exportType}.${ext}`;
      }
      await apiDownload(endpoint, filename);
    } catch (err: unknown) {
      setExportError(err instanceof Error ? err.message : 'Error al exportar');
    } finally {
      setExporting(false);
    }
  };

  const loadReport = async () => {
    setLoading(true);
    try {
      const hist = await apiCall<HistoricResponse>('/api/reports/historic?months=12');
      setHistoric(hist.reportes ?? []);
    } catch (err) {
      console.error('Error cargando reporte:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadReport(); }, []);

  const historicFiltered = historic.filter((r) => r.total_ingresos > 0 || r.total_egresos > 0);

  const totalIngresos = historicFiltered.reduce((s, r) => s + r.total_ingresos, 0);
  const totalEgresos = historicFiltered.reduce((s, r) => s + r.total_egresos, 0);
  const totalNeto = totalIngresos - totalEgresos;

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
        </div>

        {loading ? (
          <div className="flex justify-center py-16"><Spinner size="lg" /></div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <StatCard title="Ingresos históricos" value={formatCurrency(totalIngresos)} valueColor="text-vault-emerald" />
              <StatCard title="Egresos históricos" value={formatCurrency(totalEgresos)} valueColor="text-vault-coral" />
              <StatCard
                title="Neto histórico"
                value={formatCurrency(totalNeto)}
                valueColor={totalNeto >= 0 ? 'text-vault-blue' : 'text-vault-coral'}
              />
            </div>

            <Card title="Exportar reporte">
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Tipo de reporte</label>
                    <select
                      value={exportType}
                      onChange={(e) => setExportType(e.target.value as 'ingresos' | 'egresos' | 'ambos')}
                      className="w-full bg-vault-dark border border-gray-700 text-white text-sm rounded px-3 py-2 focus:outline-none focus:border-vault-neon"
                    >
                      <option value="ingresos">Solo ingresos</option>
                      <option value="egresos">Solo egresos</option>
                      <option value="ambos">Ingresos y egresos</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Período</label>
                    <select
                      value={exportPeriodType}
                      onChange={(e) => setExportPeriodType(e.target.value as 'mes' | 'ano' | 'historico')}
                      className="w-full bg-vault-dark border border-gray-700 text-white text-sm rounded px-3 py-2 focus:outline-none focus:border-vault-neon"
                    >
                      <option value="historico">Histórico completo</option>
                      <option value="ano">Por año</option>
                      <option value="mes">Por mes</option>
                    </select>
                  </div>
                  {exportPeriodType !== 'historico' && (
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">
                        {exportPeriodType === 'mes' ? 'Mes y año' : 'Año'}
                      </label>
                      <div className="flex gap-2">
                        {exportPeriodType === 'mes' && (
                          <select
                            value={exportMes}
                            onChange={(e) => setExportMes(Number(e.target.value))}
                            className="flex-1 bg-vault-dark border border-gray-700 text-white text-sm rounded px-3 py-2 focus:outline-none focus:border-vault-neon"
                          >
                            {['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'].map((m, i) => (
                              <option key={i + 1} value={i + 1}>{m}</option>
                            ))}
                          </select>
                        )}
                        <input
                          type="number"
                          value={exportAno}
                          onChange={(e) => setExportAno(Number(e.target.value))}
                          min={2000}
                          max={2100}
                          className="w-24 bg-vault-dark border border-gray-700 text-white text-sm rounded px-3 py-2 focus:outline-none focus:border-vault-neon"
                        />
                      </div>
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

            <Card title="Evolución histórica (últimos 12 meses)">
              {historicFiltered.length > 0 ? (
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
