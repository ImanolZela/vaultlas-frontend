import React, { createContext, useState, useEffect } from 'react';
import { AuthContextType, User } from '@/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000';

export const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedToken = localStorage.getItem('vaultlas_token');
    if (!savedToken) {
      setLoading(false);
      return;
    }
    fetch(`${API_URL}/api/auth/me`, {
      headers: { Authorization: `Bearer ${savedToken}` },
    })
      .then((res) => {
        if (res.ok) {
          setToken(savedToken);
        } else {
          localStorage.removeItem('vaultlas_token');
          setToken(null);
        }
      })
      .catch(() => {
        localStorage.removeItem('vaultlas_token');
        setToken(null);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const login = (userData: User, accessToken: string): void => {
    setUser(userData);
    setToken(accessToken);
    localStorage.setItem('vaultlas_token', accessToken);
  };

  const logout = (): void => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('vaultlas_token');
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
