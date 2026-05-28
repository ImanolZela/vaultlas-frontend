import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { FormField } from '@/components/molecules/FormField';
import { Button } from '@/components/atoms/Button';
import { useAuth } from '@/hooks/useAuth';
import { apiCall } from '@/lib/api';

type AuthMode = 'login' | 'register';

export const LoginForm: React.FC = () => {
  const [mode, setMode] = useState<AuthMode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (mode === 'register') {
        await apiCall('/api/auth/register', {
          method: 'POST',
          body: JSON.stringify({ email, password }),
        });
        setMode('login');
        setPassword('');
        return;
      }

      const data = await apiCall<{ access_token: string }>('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });

      login({ id: 0, email }, data.access_token);
      router.push('/dashboard');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error inesperado');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <FormField
        label="Correo electrónico"
        name="email"
        type="email"
        placeholder="tu@email.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />
      <FormField
        label="Contraseña"
        name="password"
        type="password"
        placeholder="••••••••"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
      />

      {error && (
        <div
          className="text-sm px-4 py-3 rounded-lg border"
          style={{
            backgroundColor: 'rgba(239, 68, 68, 0.1)',
            borderColor: 'rgba(239, 68, 68, 0.4)',
            color: '#EF4444',
          }}
        >
          {error}
        </div>
      )}

      <Button type="submit" variant="primary" fullWidth disabled={loading}>
        {loading
          ? 'Procesando...'
          : mode === 'login'
          ? 'Ingresar'
          : 'Crear Cuenta'}
      </Button>

      <div className="text-center text-sm mt-4">
        {mode === 'login' ? (
          <p className="text-gray-500">
            ¿No tienes cuenta?{' '}
            <button
              type="button"
              onClick={() => { setMode('register'); setError(''); }}
              className="text-vault-neon hover:text-vault-lime font-semibold transition-colors"
            >
              Regístrate
            </button>
          </p>
        ) : (
          <p className="text-gray-500">
            ¿Ya tienes cuenta?{' '}
            <button
              type="button"
              onClick={() => { setMode('login'); setError(''); }}
              className="text-vault-neon hover:text-vault-lime font-semibold transition-colors"
            >
              Inicia sesión
            </button>
          </p>
        )}
      </div>
    </form>
  );
};
