import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { DashboardLayout } from '@/components/templates/DashboardLayout';
import { StatCard } from '@/components/molecules/StatCard';
import { Card } from '@/components/atoms/Card';
import { Badge } from '@/components/atoms/Badge';
import { Button } from '@/components/atoms/Button';
import { Spinner } from '@/components/atoms/Spinner';
import { apiCall } from '@/lib/api';
import { formatCurrency, formatDate } from '@/lib/utils';
import type { VaultDocument, MonthlyReport, Goal } from '@/types';

interface DocumentsResponse {
  documents: VaultDocument[];
  total: number;
}

export default function Dashboard() {
  const router = useRouter();
  const [report, setReport] = useState<MonthlyReport | null>(null);
  const [documents, setDocuments] = useState<VaultDocument[]>([]);
  const [goal, setGoal] = useState<Goal | null>(null);
  const [reportPeriodo, setReportPeriodo] = useState<{ mes: number; ano: number } | null>(null);
  const [loading, setLoading] = useState(true);

  const MONTHS = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];

  useEffect(() => {
    const load = async () => {
      try {
        const docsData = await apiCall<DocumentsResponse>('/api/documents?limit=5');
        const docs = docsData.documents ?? [];
        setDocuments(docs);

        const today = new Date();
        const latestDone = docs.find((d) => d.status === 'done' && d.periodo);
        let mes = today.getMonth() + 1;
        let ano = today.getFullYear();
        if (latestDone?.periodo) {
          const [y, m] = latestDone.periodo.split('-').map(Number);
          if (y && m) { ano = y; mes = m; }
        }

        const [reportData, goalData] = await Promise.all([
          apiCall<MonthlyReport>(`/api/reports/monthly?mes=${mes}&ano=${ano}`),
          apiCall<Goal>(`/api/goals/${mes}/${ano}`).catch(() => null),
        ]);
        setReport(reportData);
        setGoal(goalData);
        setReportPeriodo({ mes, ano });
      } catch (err) {
        console.error('Error cargando datos:', err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <Spinner size="lg" />
        </div>
      </DashboardLayout>
    );
  }

  const goalPct = goal && report && goal.meta_ingresos > 0
    ? Math.min((report.total_ingresos / goal.meta_ingresos) * 100, 100)
    : 0;

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-white">Dashboard</h1>
          <Button variant="primary" onClick={() => router.push('/upload')}>
            + Subir estado de cuenta
          </Button>
        </div>

        {/* Resumen del mes */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatCard
            title="Ingresos del mes"
            value={formatCurrency(report?.total_ingresos ?? 0)}
            valueColor="text-vault-emerald"
          />
          <StatCard
            title="Egresos del mes"
            value={formatCurrency(report?.total_egresos ?? 0)}
            valueColor="text-vault-coral"
          />
          <StatCard
            title="Neto"
            value={formatCurrency(report?.neto ?? 0)}
            valueColor={(report?.neto ?? 0) >= 0 ? 'text-vault-blue' : 'text-vault-coral'}
          />
        </div>

        {/* Meta de ingresos */}
        {goal && (
          <Card title={`Cumplimiento de meta — ${reportPeriodo ? `${MONTHS[reportPeriodo.mes - 1]} ${reportPeriodo.ano}` : ''}`} neon>
            <div className="space-y-3">
              <div className="flex justify-between text-sm text-gray-400">
                <span>{formatCurrency(report?.total_ingresos ?? 0)} logrado</span>
                <span>Meta: {formatCurrency(goal.meta_ingresos)}</span>
              </div>
              <div className="w-full bg-vault-dark rounded-full h-3">
                <div
                  className="h-3 rounded-full bg-vault-neon transition-all duration-500"
                  style={{ width: `${goalPct}%` }}
                />
              </div>
              <p className="text-sm text-gray-400">
                <span className="text-vault-neon font-bold">{goalPct.toFixed(1)}%</span> de la meta cumplida
              </p>
            </div>
          </Card>
        )}

        {/* Documentos recientes */}
        <Card title="Documentos recientes">
          {documents.length === 0 ? (
            <p className="text-gray-500 text-sm">No hay documentos procesados aún.</p>
          ) : (
            <div className="divide-y divide-vault-dark">
              {documents.map((doc) => (
                <div
                  key={doc.id}
                  className="flex items-center justify-between py-3 cursor-pointer hover:bg-vault-dark/30 px-2 rounded transition-colors"
                  onClick={() => router.push(`/movements/${doc.id}`)}
                >
                  <div>
                    <p className="text-white font-medium text-sm">{doc.filename}</p>
                    <p className="text-gray-500 text-xs">{formatDate(doc.created_at)}{doc.periodo ? ` · ${doc.periodo}` : ''}</p>
                  </div>
                  <Badge status={doc.status} />
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </DashboardLayout>
  );
}
