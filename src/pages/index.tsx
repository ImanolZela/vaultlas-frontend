import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { Spinner } from '@/components/atoms/Spinner';

export default function Home(): JSX.Element {
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('vaultlas_token');
    router.replace(token ? '/dashboard' : '/login');
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#0F0F0F' }}>
      <Spinner size="lg" text="Cargando..." />
    </div>
  );
}
