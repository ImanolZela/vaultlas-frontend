import React from 'react';
import { LoginForm } from '@/components/organisms/LoginForm';

export default function Login(): JSX.Element {
  return (
    <div
      className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden"
      style={{ background: 'var(--dark-0)' }}
    >
      {/* Dot grid */}
      <div
        className="absolute inset-0 bg-dot-grid"
        style={{ opacity: 0.6 }}
      />

      {/* Radial glow from bottom-center */}
      <div
        className="absolute bottom-0 left-1/2 -translate-x-1/2"
        style={{
          width: '800px',
          height: '400px',
          background: 'radial-gradient(ellipse at bottom, rgba(204,255,0,0.08) 0%, transparent 70%)',
          pointerEvents: 'none',
        }}
      />

      {/* Corner accents */}
      <div
        className="absolute top-0 left-0 w-24 h-24"
        style={{
          background: 'linear-gradient(135deg, rgba(204,255,0,0.07) 0%, transparent 60%)',
          borderRight: '1px solid rgba(204,255,0,0.08)',
          borderBottom: '1px solid rgba(204,255,0,0.08)',
        }}
      />
      <div
        className="absolute bottom-0 right-0 w-24 h-24"
        style={{
          background: 'linear-gradient(315deg, rgba(204,255,0,0.07) 0%, transparent 60%)',
          borderLeft: '1px solid rgba(204,255,0,0.08)',
          borderTop: '1px solid rgba(204,255,0,0.08)',
        }}
      />

      {/* Content */}
      <div className="relative w-full max-w-sm animate-slide-up">

        {/* Brand block */}
        <div className="mb-10 text-center">
          <div className="flex items-baseline justify-center gap-1 mb-2">
            <span
              className="font-display text-6xl leading-none"
              style={{
                fontWeight: 800,
                color: 'var(--neon)',
                textShadow: '0 0 40px rgba(204,255,0,0.4), 0 0 80px rgba(204,255,0,0.15)',
              }}
            >
              VAULT
            </span>
            <span
              className="font-display text-6xl leading-none"
              style={{ fontWeight: 300, color: 'rgba(255,255,255,0.35)' }}
            >
              LAS
            </span>
          </div>
          <p
            className="font-mono text-[10px] tracking-[0.35em] uppercase"
            style={{ color: 'rgba(204,255,0,0.35)' }}
          >
            Finance Terminal
          </p>
        </div>

        {/* Form card */}
        <div
          className="rounded-2xl p-8"
          style={{
            background: 'var(--dark-2)',
            border: '1px solid rgba(204,255,0,0.12)',
            boxShadow: '0 0 0 1px rgba(204,255,0,0.06), 0 40px 80px rgba(0,0,0,0.6)',
          }}
        >
          <LoginForm />
        </div>

        <p
          className="text-center font-mono text-[10px] mt-6 tracking-wider"
          style={{ color: 'rgba(255,255,255,0.15)' }}
        >
          Vaultlas © 2026 — Datos procesados localmente
        </p>
      </div>
    </div>
  );
}
