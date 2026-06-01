'use client';
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { auth, User } from './api';

// ── Usuario demo hardcodeado (modo sin backend) ───────────────────────────────
const DEMO_USER: User = {
  id: 'demo-admin-001',
  email: 'admin@atomcapacitaciones.cl',
  name: 'Administrador ATOM',
  role: 'ADMIN',
};
const DEMO_PASSWORD = 'Atom2026!';
const DEMO_TOKEN    = 'demo-token-no-backend';

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
    // ── Modo demo: credenciales hardcodeadas ─────────────────────────────────
    if (email === DEMO_USER.email && password === DEMO_PASSWORD) {
      localStorage.setItem('atom_token', DEMO_TOKEN);
      localStorage.setItem('atom_user', JSON.stringify(DEMO_USER));
      setToken(DEMO_TOKEN);
      setUser(DEMO_USER);
      return;
    }

    // ── Modo real: llama al backend ──────────────────────────────────────────
    try {
      const res = await auth.login(email, password);
      localStorage.setItem('atom_token', res.access_token);
      localStorage.setItem('atom_user', JSON.stringify(res.user));
      setToken(res.access_token);
      setUser(res.user);
    } catch {
      throw new Error('Credenciales inválidas o servidor no disponible.');
    }
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
