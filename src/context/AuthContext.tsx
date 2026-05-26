import React, { createContext, useState, useEffect } from 'react';
import { AuthContextType, User } from '@/types';

export const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedToken = localStorage.getItem('vaultlas_token');
    if (savedToken) {
      setToken(savedToken);
    }
    setLoading(false);
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
