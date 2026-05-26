import React from 'react';
import { DocumentStatus } from '@/types';

interface BadgeProps {
  status: DocumentStatus | string;
  label?: string;
}

const statusStyles: Record<string, string> = {
  done: 'bg-vault-emerald/20 text-vault-emerald border-vault-emerald/30',
  pending: 'bg-vault-amber/20 text-vault-amber border-vault-amber/30',
  error: 'bg-vault-coral/20 text-vault-coral border-vault-coral/30',
};

const statusLabels: Record<string, string> = {
  done: 'Procesado',
  pending: 'Pendiente',
  error: 'Error',
};

export const Badge: React.FC<BadgeProps> = ({ status, label }) => {
  const style = statusStyles[status] || 'bg-gray-500/20 text-gray-400 border-gray-500/30';
  const text = label || statusLabels[status] || status;

  return (
    <span className={`inline-block px-2 py-0.5 text-xs font-semibold rounded border ${style}`}>
      {text}
    </span>
  );
};
