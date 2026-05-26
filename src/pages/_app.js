import '../styles/globals.css';
import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { AuthProvider, AuthContext } from '../context/AuthContext';
import { useContext } from 'react';

const PUBLIC_ROUTES = ['/login'];

function AuthGuard({ children }) {
  const { token, loading } = useContext(AuthContext);
  const router = useRouter();

  useEffect(() => {
    if (!loading && !token && !PUBLIC_ROUTES.includes(router.pathname)) {
      router.push('/login');
    }
  }, [token, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#0F0F0F' }}>
        <div className="text-vault-neon text-xl font-semibold">Cargando...</div>
      </div>
    );
  }

  if (!token && !PUBLIC_ROUTES.includes(router.pathname)) {
    return null;
  }

  return children;
}

export default function App({ Component, pageProps }) {
  return (
    <AuthProvider>
      <AuthGuard>
        <Component {...pageProps} />
      </AuthGuard>
    </AuthProvider>
  );
}
