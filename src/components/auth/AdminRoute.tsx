import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const SUPER_ADMIN_UID = 'ihiEK5NmBhdCdgAoH8U22eFwPwZ2';

function isAdmin(uid: string | undefined, role: string | null | undefined): boolean {
  return uid === SUPER_ADMIN_UID || role === 'admin' || role === 'administrador';
}

interface AdminRouteProps {
  children: React.ReactNode;
}

export function AdminRoute({ children }: AdminRouteProps) {
  const { user, role, loading } = useAuth();
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

  if (!isAdmin(user.uid, role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}
