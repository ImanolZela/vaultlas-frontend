import '../styles/globals.css';
import React, { useContext, useEffect } from 'react';
import type { AppProps } from 'next/app';
import { useRouter } from 'next/router';
import { AuthProvider, AuthContext } from '@/context/AuthContext';
import { Spinner } from '@/components/atoms/Spinner';

const PUBLIC_ROUTES = ['/login'];

function AuthGuard({ children }: { children: React.ReactNode }): JSX.Element {
  const context = useContext(AuthContext);
  const router = useRouter();

  useEffect(() => {
    if (!context?.loading && !context?.token && !PUBLIC_ROUTES.includes(router.pathname)) {
      router.push('/login');
    }
  }, [context?.token, context?.loading, router]);

  if (context?.loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#0F0F0F' }}>
        <Spinner size="lg" text="Cargando Vaultlas..." />
      </div>
    );
  }

  if (!context?.token && !PUBLIC_ROUTES.includes(router.pathname)) {
    return <></>;
  }

  return <>{children}</>;
}

export default function App({ Component, pageProps }: AppProps): JSX.Element {
  return (
    <AuthProvider>
      <AuthGuard>
        <Component {...pageProps} />
      </AuthGuard>
    </AuthProvider>
  );
}
