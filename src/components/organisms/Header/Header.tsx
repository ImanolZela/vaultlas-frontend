import React from 'react';
import { Button } from '@/components/atoms/Button';
import { useAuth } from '@/hooks/useAuth';

export const Header: React.FC = () => {
  const { user, logout } = useAuth();

  return (
    <header
      className="border-b px-6 py-3 flex justify-between items-center"
      style={{ backgroundColor: '#1A1A1A', borderColor: 'rgba(204, 255, 0, 0.15)' }}
    >
      <span className="text-gradient-neon text-xl font-bold tracking-wide">Vaultlas</span>
      <div className="flex items-center gap-4">
        {user && <span className="text-gray-400 text-sm">{user.email}</span>}
        <Button variant="secondary" onClick={logout} className="text-sm px-3 py-1">
          Cerrar sesión
        </Button>
      </div>
    </header>
  );
};
