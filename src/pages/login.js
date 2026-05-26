import { useState } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../hooks/useAuth';
import { apiCall } from '../lib/api';

export default function Login() {
  const [mode, setMode] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e) => {
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

      const data = await apiCall('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });

      login({ email }, data.access_token);
      router.push('/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{ background: 'linear-gradient(135deg, #0F0F0F 0%, #1A1A1A 100%)' }}
    >
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold text-gradient-neon mb-2">Vaultlas</h1>
          <p className="text-gray-500 text-sm">Gestión Financiera Inteligente</p>
        </div>

        {/* Card */}
        <div
          className="rounded-2xl p-8 border"
          style={{ backgroundColor: '#1A1A1A', borderColor: 'rgba(204, 255, 0, 0.25)' }}
        >
          <h2 className="text-vault-white text-lg font-semibold mb-6">
            {mode === 'login' ? 'Iniciar Sesión' : 'Crear Cuenta'}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-gray-400 text-sm font-medium mb-1">
                Correo electrónico
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-dark"
                placeholder="tu@email.com"
                required
              />
            </div>

            <div>
              <label className="block text-gray-400 text-sm font-medium mb-1">
                Contraseña
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-dark"
                placeholder="••••••••"
                required
              />
            </div>

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

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-3 text-base"
            >
              {loading
                ? 'Procesando...'
                : mode === 'login'
                ? 'Ingresar'
                : 'Crear Cuenta'}
            </button>
          </form>

          <div className="mt-6 text-center text-sm">
            {mode === 'login' ? (
              <p className="text-gray-500">
                ¿No tienes cuenta?{' '}
                <button
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
                  onClick={() => { setMode('login'); setError(''); }}
                  className="text-vault-neon hover:text-vault-lime font-semibold transition-colors"
                >
                  Inicia sesión
                </button>
              </p>
            )}
          </div>
        </div>

        <p className="text-center text-gray-600 text-xs mt-6">
          Vaultlas © 2026 — Datos procesados localmente
        </p>
      </div>
    </div>
  );
}
