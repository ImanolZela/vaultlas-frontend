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

const MONTHS_SHORT = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];
const MONTHS_FULL  = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];

const BUCKET_CONFIG = [
  { key: 'needs',   label: 'Necesidades', icon: '◧', color: 'rgba(100,180,255,0.85)', budgeted: 'budgeted_needs',   actual: 'actual_needs'   },
  { key: 'wants',   label: 'Gustos',      icon: '◨', color: 'rgba(255,160,100,0.85)', budgeted: 'budgeted_wants',   actual: 'actual_wants'   },
  { key: 'savings', label: 'Ahorros',     icon: '◩', color: 'rgba(100,230,180,0.85)', budgeted: 'budgeted_savings', actual: 'actual_savings' },
  { key: 'debt',    label: 'Deuda',       icon: '◪', color: 'rgba(255,100,100,0.85)', budgeted: 'debt_amount',      actual: 'actual_debt'    },
] as const;

const statusColor = (pct: number) =>
  pct > 90 ? 'rgba(255,100,100,0.9)' : pct > 70 ? 'rgba(255,200,80,0.85)' : 'rgba(100,230,180,0.85)';

function BarChart({ budgets }: { budgets: MonthlyBudget[] }) {
  // last 6 months with any data, ordered oldest→newest
  const sorted = [...budgets]
    .sort((a, b) => a.month.localeCompare(b.month))
    .slice(-6);

  if (sorted.length === 0) return (
    <p className="text-sm text-center py-6" style={{ color: 'rgba(255,255,255,0.25)' }}>
      Sin historial disponible
    </p>
  );

  const maxVal = Math.max(
    ...sorted.map((b) => Math.max(
      b.total_income,
      (b.actual_needs ?? 0) + (b.actual_wants ?? 0) + (b.actual_savings ?? 0) + (b.actual_debt ?? 0),
    )),
    1,
  );

  return (
    <div className="space-y-3">
      <div className="flex items-end gap-1.5 h-28">
        {sorted.map((b) => {
          const income   = b.total_income;
          const expenses = (b.actual_needs ?? 0) + (b.actual_wants ?? 0) + (b.actual_savings ?? 0) + (b.actual_debt ?? 0);
          const iH = income   > 0 ? Math.max((income   / maxVal) * 100, 4) : 0;
          const eH = expenses > 0 ? Math.max((expenses / maxVal) * 100, 4) : 0;
          const d  = new Date(b.month + 'T00:00:00');
          const label = MONTHS_SHORT[d.getMonth()];
          return (
            <div key={b.month} className="flex-1 flex flex-col items-center gap-1 group">
              <div className="relative w-full flex items-end justify-center gap-[2px]" style={{ height: '100px' }}>
                {/* income bar */}
                <div className="group/bar relative w-[45%]">
                  {income > 0 && (
                    <div className="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 hidden group-hover/bar:block z-10 whitespace-nowrap">
                      <div className="rounded px-1.5 py-0.5 text-[9px] font-mono"
                        style={{ background: 'rgba(0,0,0,0.9)', color: 'rgba(100,230,180,0.9)' }}>
                        {formatCurrency(income)}
                      </div>
                    </div>
                  )}
                  <div className="w-full rounded-t transition-all duration-700 absolute bottom-0"
                    style={{
                      height: `${iH}%`,
                      background: 'linear-gradient(to top, rgba(100,230,180,0.4), rgba(100,230,180,0.75))',
                    }} />
                </div>
                {/* expenses bar */}
                <div className="group/bar relative w-[45%]">
                  {expenses > 0 && (
                    <div className="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 hidden group-hover/bar:block z-10 whitespace-nowrap">
                      <div className="rounded px-1.5 py-0.5 text-[9px] font-mono"
                        style={{ background: 'rgba(0,0,0,0.9)', color: 'rgba(255,160,100,0.9)' }}>
                        {formatCurrency(expenses)}
                      </div>
                    </div>
                  )}
                  <div className="w-full rounded-t transition-all duration-700 absolute bottom-0"
                    style={{
                      height: `${eH}%`,
                      background: 'linear-gradient(to top, rgba(255,160,100,0.35), rgba(255,160,100,0.65))',
                    }} />
                </div>
              </div>
              <span className="font-mono text-[9px] uppercase" style={{ color: 'rgba(255,255,255,0.3)' }}>
                {label}
              </span>
            </div>
          );
        })}
      </div>
      {/* legend */}
      <div className="flex items-center gap-4 justify-end">
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-sm" style={{ background: 'rgba(100,230,180,0.65)' }} />
          <span className="font-mono text-[9px] uppercase" style={{ color: 'rgba(255,255,255,0.35)' }}>Ingresos</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-sm" style={{ background: 'rgba(255,160,100,0.55)' }} />
          <span className="font-mono text-[9px] uppercase" style={{ color: 'rgba(255,255,255,0.35)' }}>Gastos</span>
        </div>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const router = useRouter();
  const now = new Date();
  const mes = now.getMonth() + 1;
  const ano = now.getFullYear();

  const [report,    setReport]    = useState<MonthlyReport | null>(null);
  const [documents, setDocuments] = useState<VaultDocument[]>([]);
  const [goal,      setGoal]      = useState<Goal | null>(null);
  const [budget,    setBudget]    = useState<MonthlyBudget | null>(null);
  const [budgets,   setBudgets]   = useState<MonthlyBudget[]>([]);
  const [loading,   setLoading]   = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [docsData, reportData, goalData, budgetData, budgetsList] = await Promise.all([
          apiCall<DocumentsResponse>('/api/documents?limit=5'),
          apiCall<MonthlyReport>(`/api/reports/monthly?mes=${mes}&ano=${ano}`).catch(() => null),
          apiCall<Goal>(`/api/goals/${mes}/${ano}`).catch(() => null),
          apiCall<MonthlyBudget>(`/api/budget/${mes}/${ano}`).catch(() => null),
          apiCall<MonthlyBudget[]>('/api/budget/').catch(() => []),
        ]);
        setDocuments(docsData?.documents ?? []);
        setReport(reportData);
        setGoal(goalData);
        setBudget(budgetData);
        setBudgets(budgetsList ?? []);
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

  const totalExpenses = budget
    ? ((budget.actual_needs ?? 0) + (budget.actual_wants ?? 0) + (budget.actual_savings ?? 0) + (budget.actual_debt ?? 0))
    : 0;
  const income  = budget?.total_income ?? report?.total_ingresos ?? 0;
  const neto    = income - totalExpenses;
  const ahorros = budget?.actual_savings ?? 0;
  const hasBudget = budget && (budget.budgeted_needs > 0 || budget.budgeted_wants > 0 || budget.budgeted_savings > 0);

  const goalPct = goal && goal.meta_ingresos > 0
    ? Math.min((income / goal.meta_ingresos) * 100, 100) : 0;

  return (
    <DashboardLayout>
      <div className="space-y-6">

        {/* ── Header ── */}
        <div className="flex items-center justify-between">
          <div>
            <p className="font-mono text-[10px] tracking-[0.2em] uppercase mb-1"
               style={{ color: 'rgba(204,255,0,0.55)' }}>
              {MONTHS_FULL[mes - 1]} {ano}
            </p>
            <h1 className="text-2xl font-bold text-white">Dashboard</h1>
          </div>
          <Button variant="primary" onClick={() => router.push('/upload')}>
            + Subir estado de cuenta
          </Button>
        </div>

        {/* ── 4 stat cards ── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard title="Ingresos del mes"  value={formatCurrency(income)}        valueColor="text-vault-emerald" />
          <StatCard title="Gastos del mes"    value={formatCurrency(totalExpenses)}  valueColor="text-vault-coral" />
          <StatCard title="Neto"              value={formatCurrency(neto)}
            valueColor={neto >= 0 ? 'text-vault-blue' : 'text-vault-coral'} />
          <StatCard title="Ahorros"           value={formatCurrency(ahorros)}        valueColor="text-vault-blue" />
        </div>

        {/* ── Bar chart + Presupuesto 50-30-20 ── */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">

          {/* Bar chart */}
          <div className="lg:col-span-3">
            <Card title="Ingresos vs Gastos — últimos 6 meses">
              <BarChart budgets={budgets} />
            </Card>
          </div>

          {/* Budget progress */}
          <div className="lg:col-span-2">
            <Card title="Presupuesto 50-30-20">
              {hasBudget ? (
                <div className="space-y-3">
                  {BUCKET_CONFIG.map((b) => {
                    const budgeted = budget ? (budget as any)[b.budgeted] ?? 0 : 0;
                    const actual   = budget ? (budget as any)[b.actual]   ?? 0 : 0;
                    const pct      = budgeted > 0 ? Math.min((actual / budgeted) * 100, 100) : 0;
                    const sc       = statusColor(pct);
                    return (
                      <div key={b.key} className="space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <div className="flex items-center gap-1.5">
                            <span style={{ color: b.color, fontSize: '12px' }}>{b.icon}</span>
                            <span style={{ color: 'rgba(255,255,255,0.55)' }}>{b.label}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-[11px]" style={{ color: sc }}>
                              {formatCurrency(actual)}
                            </span>
                            <span className="font-mono text-[10px]" style={{ color: 'rgba(255,255,255,0.2)' }}>
                              / {formatCurrency(budgeted)}
                            </span>
                            <span className="font-mono text-[10px] w-7 text-right" style={{ color: sc }}>
                              {pct.toFixed(0)}%
                            </span>
                          </div>
                        </div>
                        <div className="w-full rounded-full h-1.5" style={{ background: 'rgba(255,255,255,0.06)' }}>
                          <div className="h-1.5 rounded-full transition-all duration-700"
                            style={{ width: `${pct}%`, background: sc }} />
                        </div>
                      </div>
                    );
                  })}
                  <div className="pt-1 flex justify-between items-center">
                    <span className="font-mono text-[9px]" style={{ color: 'rgba(255,255,255,0.25)' }}>
                      Ingresos: {formatCurrency(income)}
                    </span>
                    <button onClick={() => router.push('/budget')}
                      className="font-mono text-[9px] tracking-widest uppercase"
                      style={{ color: 'rgba(204,255,0,0.45)' }}>
                      Ver detalle →
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col gap-3 py-2">
                  <p className="text-sm" style={{ color: 'rgba(255,255,255,0.4)' }}>
                    Agrega ingresos para ver tu presupuesto 50-30-20.
                  </p>
                  <Button variant="secondary" onClick={() => router.push('/income')}>
                    Registrar ingreso
                  </Button>
                </div>
              )}
            </Card>
          </div>
        </div>

        {/* ── Meta + Documentos ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

          {/* Meta de ingresos */}
          <Card title={`Meta de ingresos — ${MONTHS_FULL[mes - 1]} ${ano}`} neon>
            {goal && goal.meta_ingresos > 0 ? (
              <div className="space-y-3">
                <div className="flex justify-between text-sm" style={{ color: 'rgba(255,255,255,0.5)' }}>
                  <span>{formatCurrency(income)} logrado</span>
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
                {documents.slice(0, 4).map((doc) => (
                  <div key={doc.id}
                    className="flex items-center justify-between py-2.5 cursor-pointer rounded px-1 transition-colors hover:bg-white/[0.02]"
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

      </div>
    </DashboardLayout>
  );
}
