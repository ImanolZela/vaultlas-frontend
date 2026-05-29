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
  { key: 'needs',   label: 'Necesidades', icon: '◧', color: 'rgba(100,180,255,0.85)',  budgeted: 'budgeted_needs',   actual: 'actual_needs'   },
  { key: 'wants',   label: 'Gustos',      icon: '◨', color: 'rgba(255,160,100,0.85)',  budgeted: 'budgeted_wants',   actual: 'actual_wants'   },
  { key: 'savings', label: 'Ahorros',     icon: '◩', color: 'rgba(100,230,180,0.85)',  budgeted: 'budgeted_savings', actual: 'actual_savings' },
  { key: 'debt',    label: 'Deuda',       icon: '◪', color: 'rgba(255,100,100,0.85)',  budgeted: 'debt_amount',      actual: 'actual_debt'    },
] as const;

const statusColor = (pct: number) =>
  pct > 90 ? 'rgba(255,100,100,0.9)' : pct > 70 ? 'rgba(255,200,80,0.85)' : 'rgba(100,230,180,0.85)';

/* ── Bar chart: income vs expenses last 6 months ── */
function BarChart({ budgets }: { budgets: MonthlyBudget[] }) {
  const CHART_H = 160;
  const sorted = [...budgets].sort((a, b) => a.month.localeCompare(b.month)).slice(-6);

  if (sorted.length === 0)
    return <p className="text-sm text-center py-8" style={{ color: 'rgba(255,255,255,0.2)' }}>Sin historial disponible</p>;

  const maxVal = Math.max(
    ...sorted.flatMap((b) => [
      b.total_income,
      (b.actual_needs ?? 0) + (b.actual_wants ?? 0) + (b.actual_savings ?? 0) + (b.actual_debt ?? 0),
    ]),
    1,
  );

  const toPx = (v: number) => v > 0 ? Math.max((v / maxVal) * CHART_H, 4) : 0;

  // Y-axis tick values: 4 evenly spaced
  const ticks = [0.25, 0.5, 0.75, 1].map((f) => maxVal * f);

  return (
    <div className="space-y-2">
      <div className="flex gap-1 sm:gap-2">
        {/* Y-axis labels */}
        <div className="hidden sm:flex flex-col justify-between items-end shrink-0 pb-6" style={{ height: CHART_H }}>
          {[...ticks].reverse().map((t) => (
            <span key={t} className="font-mono text-[9px]" style={{ color: 'rgba(255,255,255,0.2)' }}>
              {t >= 1000 ? `${(t / 1000).toFixed(0)}k` : t.toFixed(0)}
            </span>
          ))}
        </div>

        {/* Chart area */}
        <div className="flex-1 flex flex-col gap-1">
          {/* Grid + bars */}
          <div className="relative" style={{ height: CHART_H }}>
            {/* Horizontal grid lines */}
            {ticks.map((t) => (
              <div key={t} className="absolute w-full"
                style={{ bottom: `${(t / maxVal) * 100}%`, borderTop: '1px solid rgba(255,255,255,0.04)' }} />
            ))}

            {/* Bar columns */}
            <div className="absolute inset-0 flex items-end gap-2">
              {sorted.map((b) => {
                const income   = b.total_income;
                const expenses = (b.actual_needs ?? 0) + (b.actual_wants ?? 0) + (b.actual_savings ?? 0) + (b.actual_debt ?? 0);
                const iH = toPx(income);
                const eH = toPx(expenses);
                const d  = new Date(b.month + 'T00:00:00');
                return (
                  <div key={b.month} className="flex-1 flex flex-col items-end justify-end gap-0" style={{ height: '100%' }}>
                    <div className="flex items-end justify-center gap-[3px] w-full" style={{ height: '100%' }}>
                      {/* Income bar */}
                      <div className="flex-1 flex flex-col justify-end group/i relative">
                        {income > 0 && (
                          <div className="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 hidden group-hover/i:flex z-20 whitespace-nowrap flex-col items-center pointer-events-none">
                            <div className="rounded px-2 py-1 text-[9px] font-mono"
                              style={{ background: 'rgba(10,10,10,0.95)', color: 'rgba(100,230,180,0.95)', border: '1px solid rgba(100,230,180,0.2)' }}>
                              {formatCurrency(income)}
                            </div>
                            <div className="w-px h-1.5" style={{ background: 'rgba(100,230,180,0.3)' }} />
                          </div>
                        )}
                        <div className="w-full rounded-t-md transition-all duration-700"
                          style={{
                            height: iH,
                            background: 'linear-gradient(to top, rgba(100,230,180,0.45), rgba(100,230,180,0.8))',
                          }} />
                      </div>
                      {/* Expense bar */}
                      <div className="flex-1 flex flex-col justify-end group/e relative">
                        {expenses > 0 && (
                          <div className="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 hidden group-hover/e:flex z-20 whitespace-nowrap flex-col items-center pointer-events-none">
                            <div className="rounded px-2 py-1 text-[9px] font-mono"
                              style={{ background: 'rgba(10,10,10,0.95)', color: 'rgba(255,160,100,0.95)', border: '1px solid rgba(255,160,100,0.2)' }}>
                              {formatCurrency(expenses)}
                            </div>
                            <div className="w-px h-1.5" style={{ background: 'rgba(255,160,100,0.3)' }} />
                          </div>
                        )}
                        <div className="w-full rounded-t-md transition-all duration-700"
                          style={{
                            height: eH,
                            background: 'linear-gradient(to top, rgba(255,160,100,0.38), rgba(255,160,100,0.72))',
                          }} />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* X-axis month labels */}
          <div className="flex gap-2">
            {sorted.map((b) => {
              const d = new Date(b.month + 'T00:00:00');
              return (
                <div key={b.month} className="flex-1 text-center">
                  <span className="font-mono text-[9px] uppercase" style={{ color: 'rgba(255,255,255,0.35)' }}>
                    {MONTHS_SHORT[d.getMonth()]}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-5 justify-end pt-1">
        {([
          ['linear-gradient(to top, rgba(100,230,180,0.45), rgba(100,230,180,0.8))', 'Ingresos'],
          ['linear-gradient(to top, rgba(255,160,100,0.38), rgba(255,160,100,0.72))', 'Gastos'],
        ] as const).map(([bg, label]) => (
          <div key={label} className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-sm" style={{ background: bg }} />
            <span className="font-mono text-[9px] uppercase" style={{ color: 'rgba(255,255,255,0.4)' }}>{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Donut chart: spending by bucket ── */
function DonutChart({ budget }: { budget: MonthlyBudget | null }) {
  if (!budget) return <p className="text-sm text-center py-6" style={{ color: 'rgba(255,255,255,0.2)' }}>Sin datos</p>;

  const buckets = [
    { label: 'Necesidades', value: budget.actual_needs   ?? 0, color: 'rgba(100,180,255,0.85)' },
    { label: 'Gustos',      value: budget.actual_wants   ?? 0, color: 'rgba(255,160,100,0.85)' },
    { label: 'Ahorros',     value: budget.actual_savings ?? 0, color: 'rgba(100,230,180,0.85)' },
    { label: 'Deuda',       value: budget.actual_debt    ?? 0, color: 'rgba(255,100,100,0.85)' },
  ];
  const total = buckets.reduce((s, b) => s + b.value, 0);
  if (total === 0)
    return <p className="text-sm text-center py-6" style={{ color: 'rgba(255,255,255,0.2)' }}>Sin gastos este mes</p>;

  const r = 40;
  const circ = 2 * Math.PI * r;
  let offset = 0;

  return (
    <div className="flex items-center gap-4">
      <div className="shrink-0">
        <svg width="100" height="100" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r={r} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="14" />
          {buckets.map((b) => {
            const dash  = (b.value / total) * circ;
            const gap   = circ - dash;
            const off   = circ * 0.25 - offset;
            offset += dash;
            return (
              <circle key={b.label} cx="50" cy="50" r={r} fill="none"
                stroke={b.color} strokeWidth="14"
                strokeDasharray={`${dash} ${gap}`}
                strokeDashoffset={off}
                style={{ transition: 'stroke-dasharray 0.7s ease' }}
              />
            );
          })}
          <text x="50" y="53" textAnchor="middle" fill="rgba(255,255,255,0.7)"
            fontSize="10" fontFamily="monospace">
            {formatCurrency(total)}
          </text>
        </svg>
      </div>
      <div className="space-y-1.5 flex-1">
        {buckets.map((b) => (
          <div key={b.label} className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full shrink-0" style={{ background: b.color }} />
              <span className="text-[11px]" style={{ color: 'rgba(255,255,255,0.5)' }}>{b.label}</span>
            </div>
            <span className="font-mono text-[10px] font-semibold" style={{ color: b.color }}>
              {total > 0 ? ((b.value / total) * 100).toFixed(0) : 0}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Savings rate ring ── */
function SavingsRing({ income, savings }: { income: number; savings: number }) {
  const pct = income > 0 ? Math.min((savings / income) * 100, 100) : 0;
  const r = 28;
  const circ = 2 * Math.PI * r;
  const dash = (pct / 100) * circ;
  const color = pct >= 20 ? 'rgba(100,230,180,0.85)' : pct >= 10 ? 'rgba(255,200,80,0.85)' : 'rgba(255,100,100,0.85)';

  return (
    <div className="flex flex-col items-center gap-2">
      <svg width="72" height="72" viewBox="0 0 72 72">
        <circle cx="36" cy="36" r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="10" />
        <circle cx="36" cy="36" r={r} fill="none"
          stroke={color} strokeWidth="10"
          strokeDasharray={`${dash} ${circ - dash}`}
          strokeDashoffset={circ * 0.25}
          strokeLinecap="round"
          style={{ transition: 'stroke-dasharray 0.7s ease' }}
        />
        <text x="36" y="40" textAnchor="middle" fill={color} fontSize="11" fontFamily="monospace" fontWeight="bold">
          {pct.toFixed(0)}%
        </text>
      </svg>
      <span className="font-mono text-[9px] uppercase tracking-wider text-center" style={{ color: 'rgba(255,255,255,0.35)' }}>
        Tasa de<br />ahorro
      </span>
    </div>
  );
}

/* ── Net cash flow bar ── */
function NetFlowBar({ income, expenses }: { income: number; expenses: number }) {
  const maxVal = Math.max(income, expenses, 1);
  const iPct = (income   / maxVal) * 100;
  const ePct = (expenses / maxVal) * 100;
  const neto = income - expenses;

  return (
    <div className="space-y-3">
      <div className="space-y-2">
        {[
          { label: 'Ingresos',  value: income,   pct: iPct, color: 'rgba(100,230,180,0.7)' },
          { label: 'Gastos',    value: expenses, pct: ePct, color: 'rgba(255,160,100,0.65)' },
        ].map((row) => (
          <div key={row.label} className="space-y-1">
            <div className="flex justify-between text-[10px]">
              <span style={{ color: 'rgba(255,255,255,0.4)' }}>{row.label}</span>
              <span className="font-mono font-semibold" style={{ color: row.color }}>{formatCurrency(row.value)}</span>
            </div>
            <div className="w-full rounded-full h-1.5" style={{ background: 'rgba(255,255,255,0.06)' }}>
              <div className="h-1.5 rounded-full transition-all duration-700"
                style={{ width: `${row.pct}%`, background: row.color }} />
            </div>
          </div>
        ))}
      </div>
      <div className="flex items-center justify-between pt-1 border-t" style={{ borderColor: 'rgba(255,255,255,0.07)' }}>
        <span className="font-mono text-[9px] uppercase tracking-wider" style={{ color: 'rgba(255,255,255,0.35)' }}>Neto del mes</span>
        <span className="font-mono text-sm font-bold" style={{ color: neto >= 0 ? 'rgba(100,230,180,0.9)' : 'rgba(255,100,100,0.9)' }}>
          {neto >= 0 ? '+' : ''}{formatCurrency(neto)}
        </span>
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
        console.error('Dashboard load error:', err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) return (
    <DashboardLayout>
      <div className="flex items-center justify-center h-64"><Spinner size="lg" /></div>
    </DashboardLayout>
  );

  const income       = budget?.total_income ?? report?.total_ingresos ?? 0;
  const totalExpenses = budget
    ? ((budget.actual_needs ?? 0) + (budget.actual_wants ?? 0) + (budget.actual_savings ?? 0) + (budget.actual_debt ?? 0))
    : 0;
  const neto         = income - totalExpenses;
  const ahorros      = budget?.actual_savings ?? 0;
  const hasBudget    = budget && (budget.budgeted_needs > 0 || budget.budgeted_wants > 0 || budget.budgeted_savings > 0);
  const goalPct      = goal && goal.meta_ingresos > 0 ? Math.min((income / goal.meta_ingresos) * 100, 100) : 0;

  return (
    <DashboardLayout>
      <div className="space-y-6">

        {/* ── Header ── */}
        <div className="flex items-center justify-between">
          <div>
            <p className="font-mono text-[10px] tracking-[0.2em] uppercase mb-1"
               style={{ color: 'rgba(204,255,0,0.55)' }}>{MONTHS_FULL[mes - 1]} {ano}</p>
            <h1 className="text-2xl font-bold text-white">Dashboard</h1>
          </div>
          <Button variant="primary" onClick={() => router.push('/upload')}>+ Subir estado de cuenta</Button>
        </div>

        {/* ── 4 stat cards ── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard title="Ingresos del mes" value={formatCurrency(income)}        valueColor="text-vault-emerald" />
          <StatCard title="Gastos del mes"   value={formatCurrency(totalExpenses)} valueColor="text-vault-coral" />
          <StatCard title="Neto"             value={formatCurrency(neto)}
            valueColor={neto >= 0 ? 'text-vault-blue' : 'text-vault-coral'} />
          <StatCard title="Ahorros"          value={formatCurrency(ahorros)}       valueColor="text-vault-blue" />
        </div>

        {/* ── Row 2: Bar chart | Donut + Savings ring ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

          {/* Bar chart */}
          <div className="lg:col-span-2">
            <Card className="h-full" title="Ingresos vs Gastos — últimos 6 meses">
              <BarChart budgets={budgets} />
            </Card>
          </div>

          {/* Donut + savings ring (single tall card) */}
          <div className="lg:col-span-1">
            <Card className="h-full" title="Distribución de gastos">
              <DonutChart budget={budget} />
              <div className="mt-4 pt-4 flex items-center gap-4" style={{ borderTop: '1px solid rgba(255,255,255,0.07)' }}>
                <SavingsRing income={income} savings={ahorros} />
                <div className="flex-1 space-y-1">
                  <p className="text-sm font-semibold text-white">{formatCurrency(ahorros)}</p>
                  <p className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>
                    {income > 0
                      ? `Estás ahorrando el ${((ahorros / income) * 100).toFixed(1)}% de tus ingresos`
                      : 'Sin ingresos registrados este mes'}
                  </p>
                  {income > 0 && (
                    <p className="font-mono text-[9px]" style={{ color: 'rgba(255,255,255,0.25)' }}>
                      Meta recomendada: 20%
                    </p>
                  )}
                </div>
              </div>
            </Card>
          </div>
        </div>

        {/* ── Row 3: Net flow + Budget progress ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

          {/* Net flow bar */}
          <div className="lg:col-span-1">
            <Card className="h-full" title={`Flujo del mes — ${MONTHS_FULL[mes - 1]}`}>
              <NetFlowBar income={income} expenses={totalExpenses} />
            </Card>
          </div>

          {/* Budget 50-30-20 progress */}
          <div className="lg:col-span-2">
            <Card className="h-full" title="Presupuesto 50-30-20">
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
                            <span className="font-mono text-[11px]" style={{ color: sc }}>{formatCurrency(actual)}</span>
                            <span className="font-mono text-[10px]" style={{ color: 'rgba(255,255,255,0.2)' }}>/ {formatCurrency(budgeted)}</span>
                            <span className="font-mono text-[10px] w-7 text-right" style={{ color: sc }}>{pct.toFixed(0)}%</span>
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
                      Ingresos del mes: {formatCurrency(income)}
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
                    Registra ingresos para ver tu distribución 50-30-20.
                  </p>
                  <Button variant="secondary" onClick={() => router.push('/income')}>
                    Registrar ingreso
                  </Button>
                </div>
              )}
            </Card>
          </div>
        </div>

        {/* ── Row 4: Meta + Documentos ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

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
                <p className="text-sm" style={{ color: 'rgba(255,255,255,0.4)' }}>Sin meta configurada.</p>
                <Button variant="secondary" onClick={() => router.push('/settings')}>+ Configurar meta</Button>
              </div>
            )}
          </Card>

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
