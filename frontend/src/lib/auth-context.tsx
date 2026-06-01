'use client';
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { auth, User } from './api';

interface AuthCtx {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  loading: boolean;
}

const Ctx = createContext<AuthCtx>({} as AuthCtx);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser]   = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const t = localStorage.getItem('atom_token');
    const u = localStorage.getItem('atom_user');
    if (t && u) { setToken(t); setUser(JSON.parse(u)); }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    const res = await auth.login(email, password);
    localStorage.setItem('atom_token', res.access_token);
    localStorage.setItem('atom_user', JSON.stringify(res.user));
    setToken(res.access_token);
    setUser(res.user);
  };

  const logout = () => {
    localStorage.removeItem('atom_token');
    localStorage.removeItem('atom_user');
    setToken(null);
    setUser(null);
  };

  return <Ctx.Provider value={{ user, token, login, logout, loading }}>{children}</Ctx.Provider>;
}

export const useAuth = () => useContext(Ctx);
