import React from 'react';
import { useAuth } from '@/hooks/useAuth';

interface HeaderProps {
  onMenuToggle?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onMenuToggle }) => {
  const { user, logout } = useAuth();

  return (
    <header
      className="flex-shrink-0 flex items-center justify-between px-4 sm:px-6 py-3"
      style={{
        background: 'var(--dark-0)',
        borderBottom: '1px solid rgba(255,255,255,0.04)',
        minHeight: '52px',
      }}
    >
      <div className="flex items-center gap-3">
        {/* Hamburger — mobile only */}
        <button
          onClick={onMenuToggle}
          className="lg:hidden flex flex-col justify-center items-center gap-1 w-8 h-8 rounded-md transition-colors"
          style={{
            background: 'transparent',
            border: '1px solid rgba(255,255,255,0.08)',
          }}
          aria-label="Abrir menú"
        >
          <span className="block w-4 h-px" style={{ background: 'var(--gray)' }} />
          <span className="block w-4 h-px" style={{ background: 'var(--gray)' }} />
          <span className="block w-4 h-px" style={{ background: 'var(--gray)' }} />
        </button>

        {/* Brand — mobile only, hidden on lg+ where sidebar shows it */}
        <div className="lg:hidden flex items-baseline gap-0.5">
          <span
            className="font-mono text-sm font-bold tracking-tight"
            style={{ color: 'var(--neon)', textShadow: '0 0 12px rgba(204,255,0,0.3)' }}
          >
            VAULT
          </span>
          <span
            className="font-mono text-sm font-light tracking-tight"
            style={{ color: 'rgba(255,255,255,0.4)' }}
          >
            LAS
          </span>
        </div>

        {/* LIVE indicator — hidden on mobile to save space */}
        <span
          className="hidden sm:block font-mono text-[10px] tracking-[0.2em] uppercase"
          style={{ color: 'rgba(204,255,0,0.3)' }}
        >
          ● LIVE
        </span>
      </div>

      <div className="flex items-center gap-3">
        {user && (
          <span
            className="hidden sm:block font-mono text-xs px-3 py-1 rounded-md"
            style={{
              color: 'var(--gray)',
              background: 'var(--dark-2)',
              border: '1px solid rgba(255,255,255,0.06)',
            }}
          >
            {user.email}
          </span>
        )}
        <button
          onClick={logout}
          className="font-mono text-xs font-semibold px-3 py-1.5 rounded-md transition-all duration-200"
          style={{
            color: 'var(--gray)',
            background: 'transparent',
            border: '1px solid rgba(255,255,255,0.08)',
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLButtonElement).style.color = '#EF4444';
            (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(239,68,68,0.3)';
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.color = 'var(--gray)';
            (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(255,255,255,0.08)';
          }}
        >
          Salir
        </button>
      </div>
    </header>
  );
};
