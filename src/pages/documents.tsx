import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { DashboardLayout } from '@/components/templates/DashboardLayout';
import { Card } from '@/components/atoms/Card';
import { Badge } from '@/components/atoms/Badge';
import { Button } from '@/components/atoms/Button';
import { Spinner } from '@/components/atoms/Spinner';
import { apiCall } from '@/lib/api';
import { formatDate } from '@/lib/utils';
import type { VaultDocument } from '@/types';

interface DocumentsResponse {
  documents: VaultDocument[];
  total: number;
}

export default function Documents() {
  const router = useRouter();
  const [documents, setDocuments] = useState<VaultDocument[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiCall<DocumentsResponse>('/api/documents?limit=50')
      .then((data) => setDocuments(data.documents ?? []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-white">Documentos</h1>
          <Button variant="primary" onClick={() => router.push('/upload')}>
            + Subir PDF
          </Button>
        </div>

        {loading ? (
          <div className="flex justify-center py-16"><Spinner size="lg" /></div>
        ) : documents.length === 0 ? (
          <Card>
            <p className="text-gray-500 text-center py-8">
              No has subido ningún estado de cuenta aún.
            </p>
          </Card>
        ) : (
          <Card>
            <div className="divide-y divide-vault-dark">
              {documents.map((doc) => (
                <div
                  key={doc.id}
                  className="flex items-center justify-between py-4 cursor-pointer hover:bg-vault-dark/30 px-2 rounded transition-colors"
                  onClick={() => router.push(`/movements/${doc.id}`)}
                >
                  <div className="min-w-0">
                    <p className="text-white font-medium truncate">{doc.filename}</p>
                    <p className="text-gray-500 text-sm">
                      {formatDate(doc.created_at)}
                      {doc.periodo ? ` · Período: ${doc.periodo}` : ''}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 ml-4">
                    <Badge status={doc.status} />
                    {doc.status === 'done' && (
                      <span className="text-vault-neon text-sm">Ver movimientos →</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
