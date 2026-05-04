import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { api, clearStoredAuth, getStoredToken, getStoredUser, setStoredAuth } from '../services/api';
import type { AuthResponse, User } from '../types';

interface AuthCtx {
  user: User | null;
  isAuthenticated: boolean;
  isReady: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const Ctx = createContext<AuthCtx | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const token = getStoredToken();
    const u = getStoredUser<User>();
    if (token && u) setUser(u);
    setIsReady(true);
  }, []);

  const login: AuthCtx['login'] = async (email, password) => {
    const { data } = await api.post<AuthResponse>('/auth/login', { email, password });
    setStoredAuth(data.token, data.user);
    setUser(data.user);
  };

  const logout = () => {
    clearStoredAuth();
    setUser(null);
  };

  return (
    <Ctx.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isReady,
        login,
        logout,
      }}
    >
      {children}
    </Ctx.Provider>
  );
}

export function useAuth() {
  const v = useContext(Ctx);
  if (!v) throw new Error('useAuth must be used within AuthProvider');
  return v;
}
