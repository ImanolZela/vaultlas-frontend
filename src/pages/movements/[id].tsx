import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import DashboardLayout from '@/components/templates/DashboardLayout';
import { Card } from '@/components/atoms/Card';
import { Button } from '@/components/atoms/Button';
import { Badge } from '@/components/atoms/Badge';
import { Spinner } from '@/components/atoms/Spinner';
import { apiCall } from '@/lib/api';
import { formatCurrency, formatDate, getMovementColor } from '@/lib/utils';
import type { Movement, VaultDocument } from '@/types';

interface MovementsResponse {
  movements: Movement[];
  total: number;
}

export default function MovementsPage() {
  const router = useRouter();
  const { id } = router.query;
  const documentId = Number(id);

  const [doc, setDoc] = useState<VaultDocument | null>(null);
  const [movements, setMovements] = useState<Movement[]>([]);
  const [loading, setLoading] = useState(true);
  const [confirming, setConfirming] = useState(false);

  const loadData = async () => {
    if (!documentId) return;
    try {
      const [docData, movData] = await Promise.all([
        apiCall<VaultDocument>(`/api/documents/${documentId}`),
        apiCall<MovementsResponse>(`/api/movements/document/${documentId}?limit=200`),
      ]);
      setDoc(docData);
      setMovements(movData.movements ?? []);
    } catch (err) {
      console.error('Error cargando movimientos:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (documentId) loadData();
  }, [documentId]);

  const confirmAll = async () => {
    setConfirming(true);
    try {
      await apiCall(`/api/movements/confirm-all/${documentId}`, { method: 'POST' });
      await loadData();
    } catch (err) {
      console.error('Error confirmando:', err);
    } finally {
      setConfirming(false);
    }
  };

  const confirmOne = async (movId: number) => {
    try {
      await apiCall('/api/movements/confirm', {
        method: 'POST',
        body: JSON.stringify({ movement_ids: [movId] }),
      });
      await loadData();
    } catch (err) {
      console.error('Error confirmando movimiento:', err);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <Spinner size="lg" />
        </div>
      </DashboardLayout>
    );
  }

  const pending = movements.filter((m) => !m.confirmed).length;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <button
              onClick={() => router.push('/')}
              className="text-gray-500 hover:text-vault-neon text-sm mb-2 transition-colors"
            >
              ← Volver al dashboard
            </button>
            <h1 className="text-2xl font-bold text-white">{doc?.filename}</h1>
            {doc && <Badge status={doc.status} />}
          </div>
          {pending > 0 && (
            <Button variant="primary" onClick={confirmAll} loading={confirming}>
              Confirmar todos ({pending})
            </Button>
          )}
        </div>

        <Card>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-gray-500 border-b border-vault-dark text-left">
                  <th className="pb-3 pr-4">Fecha</th>
                  <th className="pb-3 pr-4">Descripción</th>
                  <th className="pb-3 pr-4">Código</th>
                  <th className="pb-3 pr-4 text-right">Monto</th>
                  <th className="pb-3 pr-4">Tipo</th>
                  <th className="pb-3 pr-4">Estado</th>
                  <th className="pb-3">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-vault-dark/50">
                {movements.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-gray-500">
                      No hay movimientos. El PDF puede estar en procesamiento.
                    </td>
                  </tr>
                ) : (
                  movements.map((mov) => (
                    <tr key={mov.id} className="hover:bg-vault-dark/30 transition-colors">
                      <td className="py-3 pr-4 text-gray-300 whitespace-nowrap">{mov.fecha}</td>
                      <td className="py-3 pr-4 text-white max-w-xs truncate">{mov.descripcion}</td>
                      <td className="py-3 pr-4 text-gray-500 font-mono text-xs">{mov.codigo_operacion ?? '—'}</td>
                      <td className={`py-3 pr-4 text-right font-bold ${getMovementColor(mov.tipo)}`}>
                        {mov.tipo === 'egreso' ? '-' : '+'}{formatCurrency(mov.monto)}
                      </td>
                      <td className="py-3 pr-4">
                        <span className={`text-xs font-medium ${getMovementColor(mov.tipo)}`}>
                          {mov.tipo === 'ingreso' ? 'Ingreso' : 'Egreso'}
                        </span>
                      </td>
                      <td className="py-3 pr-4">
                        {mov.confirmed ? (
                          <span className="text-vault-emerald text-xs">✓ Confirmado</span>
                        ) : (
                          <span className="text-vault-amber text-xs">Pendiente</span>
                        )}
                      </td>
                      <td className="py-3">
                        {!mov.confirmed && (
                          <button
                            onClick={() => confirmOne(mov.id)}
                            className="text-xs text-vault-neon hover:underline transition-colors"
                          >
                            Confirmar
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          <p className="text-gray-600 text-xs mt-4">{movements.length} movimientos · {pending} pendientes de confirmación</p>
        </Card>
      </div>
    </DashboardLayout>
  );
}
