export function formatCurrency(amount) {
  return new Intl.NumberFormat('es-PE', {
    style: 'currency',
    currency: 'PEN',
    minimumFractionDigits: 2,
  }).format(amount);
}

export function formatDate(dateStr) {
  if (!dateStr) return '-';
  return dateStr;
}

export function getStatusColor(status) {
  switch (status) {
    case 'done': return 'text-vault-emerald';
    case 'pending': return 'text-vault-amber';
    case 'error': return 'text-vault-coral';
    default: return 'text-gray-400';
  }
}

export function getStatusLabel(status) {
  switch (status) {
    case 'done': return 'Procesado';
    case 'pending': return 'Pendiente';
    case 'error': return 'Error';
    default: return status;
  }
}
