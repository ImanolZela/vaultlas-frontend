import { DocumentStatus, MovementType } from '@/types';

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('es-PE', {
    style: 'currency',
    currency: 'PEN',
    minimumFractionDigits: 2,
  }).format(amount);
}

export function formatDate(dateStr: string | null): string {
  if (!dateStr) return '-';
  return dateStr;
}

export function getStatusColor(status: DocumentStatus | string): string {
  const colors: Record<string, string> = {
    done: 'text-vault-emerald',
    pending: 'text-vault-amber',
    error: 'text-vault-coral',
  };
  return colors[status] ?? 'text-gray-400';
}

export function getStatusLabel(status: DocumentStatus | string): string {
  const labels: Record<string, string> = {
    done: 'Procesado',
    pending: 'Pendiente',
    error: 'Error',
  };
  return labels[status] ?? status;
}

export function getMovementColor(tipo: MovementType): string {
  return tipo === 'ingreso' ? 'text-vault-emerald' : 'text-vault-coral';
}
