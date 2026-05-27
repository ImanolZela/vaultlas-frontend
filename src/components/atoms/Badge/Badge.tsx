import React from 'react';
import { DocumentStatus } from '@/types';

interface BadgeProps {
  status: DocumentStatus | string;
  label?: string;
}

const statusConfig: Record<string, { dot: string; text: string; bg: string; border: string }> = {
  done:    { dot: '#10B981', text: '#10B981', bg: 'rgba(16,185,129,0.08)',  border: 'rgba(16,185,129,0.25)' },
  pending: { dot: '#FBBF24', text: '#FBBF24', bg: 'rgba(251,191,36,0.08)',  border: 'rgba(251,191,36,0.25)' },
  error:   { dot: '#EF4444', text: '#EF4444', bg: 'rgba(239,68,68,0.08)',   border: 'rgba(239,68,68,0.25)' },
};

const statusLabels: Record<string, string> = {
  done:    'Procesado',
  pending: 'Pendiente',
  error:   'Error',
};

export const Badge: React.FC<BadgeProps> = ({ status, label }) => {
  const cfg = statusConfig[status] ?? {
    dot: '#6B7280', text: '#6B7280', bg: 'rgba(107,114,128,0.08)', border: 'rgba(107,114,128,0.25)',
  };
  const text = label || statusLabels[status] || status;

  return (
    <span
      className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-mono font-semibold rounded-md border tracking-wider uppercase"
      style={{ color: cfg.text, background: cfg.bg, borderColor: cfg.border }}
    >
      <span
        className="inline-block w-1.5 h-1.5 rounded-full animate-glow-pulse"
        style={{ backgroundColor: cfg.dot, boxShadow: `0 0 4px ${cfg.dot}` }}
      />
      {text}
    </span>
  );
};
