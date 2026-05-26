import React from 'react';
import { LoginForm } from '@/components/organisms/LoginForm';

export default function Login(): JSX.Element {
  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{ background: 'linear-gradient(135deg, #0F0F0F 0%, #1A1A1A 100%)' }}
    >
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold text-gradient-neon mb-2">Vaultlas</h1>
          <p className="text-gray-500 text-sm">Gestión Financiera Inteligente</p>
        </div>
        <div
          className="rounded-2xl p-8 border"
          style={{ backgroundColor: '#1A1A1A', borderColor: 'rgba(204, 255, 0, 0.25)' }}
        >
          <LoginForm />
        </div>
        <p className="text-center text-gray-600 text-xs mt-6">
          Vaultlas © 2026 — Datos procesados localmente
        </p>
      </div>
    </div>
  );
}
