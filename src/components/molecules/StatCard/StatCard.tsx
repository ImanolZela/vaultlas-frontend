import React from 'react';

interface StatCardProps {
  title: string;
  value: string;
  valueColor?: string;
  subtitle?: string;
}

const glowMap: Record<string, string> = {
  'text-vault-neon':    'neon-text',
  'text-vault-emerald': 'emerald-text',
  'text-vault-coral':   'coral-text',
  'text-vault-blue':    '',
  'text-white':         '',
  'text-vault-white':   '',
};

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  valueColor = 'text-vault-white',
  subtitle,
}) => {
  const glowClass = glowMap[valueColor] ?? '';

  return (
    <div className="card group">
      <p
        className="font-mono text-[10px] tracking-[0.2em] uppercase mb-3"
        style={{ color: 'rgba(204,255,0,0.5)', letterSpacing: '0.18em' }}
      >
        {title}
      </p>
      <p
        className={`font-mono text-3xl font-semibold leading-none ${glowClass} ${!glowClass ? valueColor : ''}`}
        style={{ letterSpacing: '-0.02em' }}
      >
        {value}
      </p>
      {subtitle && (
        <p className="text-xs mt-2" style={{ color: 'var(--gray-dim)' }}>
          {subtitle}
        </p>
      )}
    </div>
  );
};
