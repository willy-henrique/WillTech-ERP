import { createContext, useContext, useEffect, useState, useCallback, useMemo, type ReactNode } from 'react';
import { onAuthStateChanged, signInWithEmailAndPassword, signOut as fbSignOut, type User } from 'firebase/auth';
import { auth } from '../lib/firebase';
import { getAllowedModuleIds, MODULES, type ModuleId } from '../lib/permissions';

export type Role = 'admin' | 'administrador' | 'comercial' | 'pcp' | 'estoque' | 'financeiro' | 'gerencia' | string;

const SUPER_ADMIN_UID = 'ihiEK5NmBhdCdgAoH8U22eFwPwZ2';

interface AuthState {
  user: User | null;
  role: Role | null;
  loading: boolean;
  error: string | null;
}

interface AuthContextValue extends AuthState {
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  setError: (err: string | null) => void;
  refreshRole: () => Promise<void>;
  /** IDs dos módulos que o usuário pode acessar (por perfil). */
  allowedModules: ModuleId[];
  /** True se o usuário é admin (acesso à rota /admin). */
  isAdmin: boolean;
  canAccessModule: (moduleId: ModuleId) => boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<Role | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      setUser(u ?? null);
      if (u) {
        try {
          const token = await u.getIdTokenResult();
          const r = (token.claims as { role?: string }).role ?? null;
          setRole(r ?? null);
        } catch {
          setRole(null);
        }
      } else {
        setRole(null);
      }
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    setError(null);
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Falha no login';
      setError(msg);
      throw e;
    }
  }, []);

  const signOut = useCallback(async () => {
    setError(null);
    await fbSignOut(auth);
  }, []);

  const refreshRole = useCallback(async () => {
    const u = auth.currentUser;
    if (!u) return;
    await u.getIdToken(true);
    const result = await u.getIdTokenResult();
    setRole((result.claims as { role?: string }).role ?? null);
  }, []);

  const allowedModules = useMemo(() => {
    const ids = getAllowedModuleIds(role);
    // Usuário logado sem role (claim não definido): mostra todos os módulos para não deixar o menu vazio
    if (user && ids.length === 0) return MODULES.map((m) => m.id);
    return ids;
  }, [role, user]);
  const isAdmin = Boolean(
    user?.uid === SUPER_ADMIN_UID || role === 'admin' || role === 'administrador'
  );
  const canAccessModule = useCallback(
    (moduleId: ModuleId) => allowedModules.includes(moduleId),
    [allowedModules]
  );

  const value: AuthContextValue = {
    user,
    role,
    loading,
    error,
    signIn,
    signOut,
    setError,
    refreshRole,
    allowedModules,
    isAdmin,
    canAccessModule,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
