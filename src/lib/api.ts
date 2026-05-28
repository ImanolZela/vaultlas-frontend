const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000';

export async function apiCall<T = unknown>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = localStorage.getItem('vaultlas_token');

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers as Record<string, string> ?? {}),
  };

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (response.status === 401) {
    localStorage.removeItem('vaultlas_token');
    window.location.href = '/login';
    throw new Error('Session expired');
  }

  if (!response.ok) {
    const error = await response.json().catch(() => ({})) as { detail?: string };
    throw new Error(error.detail ?? `Error ${response.status}`);
  }

  return response.json() as Promise<T>;
}

export async function apiDownload(endpoint: string, filename: string): Promise<void> {
  const token = typeof window !== 'undefined' ? localStorage.getItem('vaultlas_token') : null;
  const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000';

  const response = await fetch(`${API_URL}${endpoint}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });

  if (response.status === 401) {
    localStorage.removeItem('vaultlas_token');
    window.location.href = '/login';
    throw new Error('Session expired');
  }

  if (!response.ok) {
    const text = await response.text();
    let message = `Error ${response.status}`;
    try { message = JSON.parse(text).detail ?? message; } catch { /* */ }
    throw new Error(message);
  }

  const blob = await response.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
