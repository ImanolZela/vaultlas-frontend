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
import type { VaultDocument, MonthlyReport, Goal, MonthlyBudget } from '@/types';

interface DocumentsResponse { documents: VaultDocument[]; total: number; }

const MONTHS = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];

const BUCKET_CONFIG = [
  { key: 'needs',   label: 'Necesidades', icon: '◧', color: 'rgba(100,180,255,0.85)', budgeted: 'budgeted_needs', actual: 'actual_needs' },
  { key: 'wants',   label: 'Gustos',      icon: '◨', color: 'rgba(255,160,100,0.85)', budgeted: 'budgeted_wants', actual: 'actual_wants' },
  { key: 'savings', label: 'Ahorros',     icon: '◩', color: 'rgba(100,230,180,0.85)', budgeted: 'budgeted_savings', actual: 'actual_savings' },
  { key: 'debt',    label: 'Deuda',       icon: '◪', color: 'rgba(255,100,100,0.85)', budgeted: 'debt_amount', actual: 'actual_debt' },
] as const;

export default function Dashboard() {
  const router = useRouter();
  const [report, setReport] = useState<MonthlyReport | null>(null);
  const [documents, setDocuments] = useState<VaultDocument[]>([]);
  const [goal, setGoal] = useState<Goal | null>(null);
  const [budget, setBudget] = useState<MonthlyBudget | null>(null);
  const [periodo, setPeriodo] = useState<{ mes: number; ano: number } | null>(null);
  const [loading, setLoading] = useState(true);

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

        const [reportData, goalData, budgetData] = await Promise.all([
          apiCall<MonthlyReport>(`/api/reports/monthly?mes=${mes}&ano=${ano}`),
          apiCall<Goal>(`/api/goals/${mes}/${ano}`).catch(() => null),
          apiCall<MonthlyBudget>(`/api/budget/${mes}/${ano}`).catch(() => null),
        ]);

        setReport(reportData);
        setGoal(goalData);
        setBudget(budgetData);
        setPeriodo({ mes, ano });
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
        <div className="flex items-center justify-center h-64"><Spinner size="lg" /></div>
      </DashboardLayout>
    );
  }

  const goalPct = goal && report && goal.meta_ingresos > 0
    ? Math.min((report.total_ingresos / goal.meta_ingresos) * 100, 100) : 0;

  const hasBudget = budget && (budget.budgeted_needs > 0 || budget.budgeted_wants > 0 || budget.budgeted_savings > 0);

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <p className="font-mono text-[10px] tracking-[0.2em] uppercase mb-1"
               style={{ color: 'rgba(204,255,0,0.55)' }}>
              {periodo ? `${MONTHS[periodo.mes - 1]} ${periodo.ano}` : ''}
            </p>
            <h1 className="text-2xl font-bold text-white">Dashboard</h1>
          </div>
          <Button variant="primary" onClick={() => router.push('/upload')}>
            + Subir estado de cuenta
          </Button>
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatCard title="Ingresos del mes" value={formatCurrency(report?.total_ingresos ?? 0)} valueColor="text-vault-emerald" />
          <StatCard title="Egresos del mes"  value={formatCurrency(report?.total_egresos ?? 0)}  valueColor="text-vault-coral" />
          <StatCard title="Neto"             value={formatCurrency(report?.neto ?? 0)}
            valueColor={(report?.neto ?? 0) >= 0 ? 'text-vault-blue' : 'text-vault-coral'} />
        </div>

        {/* Presupuesto 50-30-20 */}
        <Card title="Presupuesto 50-30-20">
          {hasBudget ? (
            <div className="space-y-3">
              {BUCKET_CONFIG.map((b) => {
                const budgeted = budget ? (budget as any)[b.budgeted] ?? 0 : 0;
                const actual = budget ? (budget as any)[b.actual] ?? 0 : 0;
                const pct = budgeted > 0 ? Math.min((actual / budgeted) * 100, 100) : 0;
                const overBudget = actual > budgeted && budgeted > 0;
                return (
                  <div key={b.key} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span style={{ color: b.color }}>{b.icon}</span>
                        <span style={{ color: 'rgba(255,255,255,0.6)' }}>{b.label}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span style={{ color: overBudget ? 'rgba(255,100,100,0.8)' : 'rgba(255,255,255,0.4)' }}>
                          {formatCurrency(actual)}
                        </span>
                        <span style={{ color: 'rgba(255,255,255,0.25)' }}>/ {formatCurrency(budgeted)}</span>
                        <span className="font-mono w-10 text-right"
                          style={{ color: overBudget ? 'rgba(255,100,100,0.8)' : b.color }}>
                          {pct.toFixed(0)}%
                        </span>
                      </div>
                    </div>
                    <div className="w-full rounded-full h-1.5" style={{ background: 'rgba(255,255,255,0.06)' }}>
                      <div className="h-1.5 rounded-full transition-all duration-700"
                        style={{ width: `${pct}%`, background: overBudget ? 'rgba(255,100,100,0.8)' : b.color }} />
                    </div>
                  </div>
                );
              })}
              <div className="pt-2 flex justify-end">
                <button onClick={() => router.push('/budget')}
                  className="font-mono text-[9px] tracking-widest uppercase"
                  style={{ color: 'rgba(204,255,0,0.45)' }}>
                  Ver detalle →
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between py-2">
              <p className="text-sm" style={{ color: 'rgba(255,255,255,0.4)' }}>
                Sin presupuesto configurado para este mes.
              </p>
              <Button variant="secondary" onClick={() => router.push('/budget')}>
                Configurar
              </Button>
            </div>
          )}
        </Card>

        {/* Meta de ingresos */}
        <Card title={`Meta de ingresos — ${periodo ? `${MONTHS[periodo.mes - 1]} ${periodo.ano}` : ''}`} neon>
          {goal && goal.meta_ingresos > 0 ? (
            <div className="space-y-3">
              <div className="flex justify-between text-sm" style={{ color: 'rgba(255,255,255,0.5)' }}>
                <span>{formatCurrency(report?.total_ingresos ?? 0)} logrado</span>
                <span>Meta: {formatCurrency(goal.meta_ingresos)}</span>
              </div>
              <div className="w-full rounded-full h-2.5" style={{ background: 'rgba(255,255,255,0.07)' }}>
                <div className="h-2.5 rounded-full transition-all duration-500"
                  style={{ width: `${goalPct}%`, background: 'var(--neon)' }} />
              </div>
              <div className="flex items-center justify-between">
                <p className="text-sm" style={{ color: 'rgba(255,255,255,0.5)' }}>
                  <span className="font-bold" style={{ color: 'var(--neon)' }}>{goalPct.toFixed(1)}%</span> cumplido
                </p>
                <button onClick={() => router.push('/settings')}
                  className="font-mono text-[9px] tracking-widest uppercase"
                  style={{ color: 'rgba(204,255,0,0.4)' }}>
                  Editar →
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <p className="text-sm" style={{ color: 'rgba(255,255,255,0.4)' }}>
                Sin meta configurada para este mes.
              </p>
              <Button variant="secondary" onClick={() => router.push('/settings')}>
                + Configurar meta
              </Button>
            </div>
          )}
        </Card>

        {/* Documentos recientes */}
        <Card title="Documentos recientes">
          {documents.length === 0 ? (
            <p className="text-sm py-2" style={{ color: 'rgba(255,255,255,0.35)' }}>
              No hay documentos procesados aún.
            </p>
          ) : (
            <div className="divide-y" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
              {documents.map((doc) => (
                <div key={doc.id}
                  className="flex items-center justify-between py-3 cursor-pointer rounded px-1 transition-colors"
                  onClick={() => router.push(`/movements/${doc.id}`)}>
                  <div>
                    <p className="text-white text-sm font-medium">{doc.filename}</p>
                    <p className="font-mono text-[10px] mt-0.5" style={{ color: 'rgba(255,255,255,0.35)' }}>
                      {formatDate(doc.created_at)}{doc.periodo ? ` · ${doc.periodo}` : ''}
                    </p>
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
