import { useState, useRef } from 'react';
import { useRouter } from 'next/router';
import DashboardLayout from '@/components/templates/DashboardLayout';
import { Card } from '@/components/atoms/Card';
import { Button } from '@/components/atoms/Button';
import { Input } from '@/components/atoms/Input';
import { Spinner } from '@/components/atoms/Spinner';

type UploadState = 'idle' | 'loading' | 'success' | 'error';

export default function Upload() {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [password, setPassword] = useState('');
  const [state, setState] = useState<UploadState>('idle');
  const [message, setMessage] = useState('');
  const [fileName, setFileName] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const file = fileRef.current?.files?.[0];
    if (!file) {
      setMessage('Selecciona un archivo PDF.');
      setState('error');
      return;
    }

    setState('loading');
    setMessage('');

    const formData = new FormData();
    formData.append('file', file);
    formData.append('password', password);

    const token = localStorage.getItem('vaultlas_token');
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000'}/api/documents/upload`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.detail ?? `Error ${res.status}`);
      }

      setState('success');
      setMessage(data.message ?? 'PDF encolado para procesamiento.');
    } catch (err: unknown) {
      setState('error');
      setMessage(err instanceof Error ? err.message : 'Error inesperado.');
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-lg mx-auto space-y-6">
        <h1 className="text-3xl font-bold text-white">Subir estado de cuenta</h1>

        <Card neon>
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Área de archivo */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Archivo PDF del BCP
              </label>
              <div
                className="border-2 border-dashed border-vault-dark hover:border-vault-neon transition-colors rounded-lg p-6 text-center cursor-pointer"
                onClick={() => fileRef.current?.click()}
              >
                <input
                  ref={fileRef}
                  type="file"
                  accept=".pdf"
                  className="hidden"
                  onChange={(e) => setFileName(e.target.files?.[0]?.name ?? '')}
                />
                {fileName ? (
                  <p className="text-vault-neon font-medium">{fileName}</p>
                ) : (
                  <>
                    <p className="text-gray-400 text-sm">Haz clic para seleccionar un PDF</p>
                    <p className="text-gray-600 text-xs mt-1">Solo archivos .pdf</p>
                  </>
                )}
              </div>
            </div>

            <Input
              label="Contraseña del PDF (si aplica)"
              type="password"
              placeholder="Deja vacío si no tiene contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            {state === 'error' && (
              <div className="bg-vault-coral/10 border border-vault-coral rounded-lg p-3">
                <p className="text-vault-coral text-sm">{message}</p>
              </div>
            )}

            {state === 'success' && (
              <div className="bg-vault-emerald/10 border border-vault-emerald rounded-lg p-3">
                <p className="text-vault-emerald text-sm">{message}</p>
              </div>
            )}

            <div className="flex gap-3">
              <Button
                type="submit"
                variant="primary"
                loading={state === 'loading'}
                className="flex-1"
              >
                {state === 'loading' ? 'Procesando...' : 'Subir PDF'}
              </Button>
              {state === 'success' && (
                <Button variant="secondary" onClick={() => router.push('/')}>
                  Ver dashboard
                </Button>
              )}
            </div>
          </form>
        </Card>
      </div>
    </DashboardLayout>
  );
}
