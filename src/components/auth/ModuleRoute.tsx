import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import type { ModuleId } from '../../lib/permissions';

interface ModuleRouteProps {
  moduleId: ModuleId;
  children: React.ReactNode;
}

/**
 * Protege rotas por módulo: só renderiza children se o usuário tiver permissão.
 * Redireciona para /dashboard se não tiver acesso.
 */
export function ModuleRoute({ moduleId, children }: ModuleRouteProps) {
  const { user, loading, canAccessModule } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100">
        <div className="text-slate-600">Carregando...</div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!canAccessModule(moduleId)) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}
