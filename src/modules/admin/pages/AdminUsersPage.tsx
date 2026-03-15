import { useState, useEffect } from 'react';
import { Shield, Plus, UserCog, Loader2 } from 'lucide-react';
import { useAuth } from '../../../contexts/AuthContext';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '../../../components/ui/Table';
import {
  adminUserService,
  getRoleLabel,
  ROLES_OPTIONS,
  type AppUser,
} from '../services/adminUserService';
import { AddUserModal } from '../components/AddUserModal';

const SUPER_ADMIN_UID = 'ihiEK5NmBhdCdgAoH8U22eFwPwZ2';

function isAdmin(uid: string | undefined, role: string | null | undefined): boolean {
  return uid === SUPER_ADMIN_UID || role === 'admin' || role === 'administrador';
}

export function AdminUsersPage() {
  const { user, role, refreshRole } = useAuth();
  const [users, setUsers] = useState<AppUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const list = await adminUserService.getUsers();
      setUsers(list);
    } catch (e) {
      setError('Falha ao carregar usuários.');
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  useEffect(() => {
    if (!user || !isAdmin(user.uid, role)) return;
    adminUserService
      .ensureCurrentUserDoc(
        user.uid,
        user.email ?? '',
        user.displayName ?? '',
        role ?? 'administrador'
      )
      .then(() => loadUsers())
      .catch(console.error);
  }, [user?.uid, user?.email, user?.displayName, role]);

  useEffect(() => {
    if (user?.uid !== SUPER_ADMIN_UID || role) return;
    adminUserService
      .ensureAdminClaim()
      .then(() => refreshRole())
      .catch(console.error);
  }, [user?.uid, role, refreshRole]);

  const handleRoleChange = async (targetUser: AppUser, newRole: string) => {
    if (targetUser.role === newRole) return;
    setUpdatingId(targetUser.id);
    setError(null);
    try {
      await adminUserService.setUserRole(targetUser.id, newRole);
      await loadUsers();
    } catch (e) {
      setError('Falha ao atualizar perfil.');
      console.error(e);
    } finally {
      setUpdatingId(null);
    }
  };

  if (!user || !isAdmin(user.uid, role)) {
    return null;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Shield className="w-6 h-6 text-amber-600" />
            Administração — Funcionários
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Cadastre funcionários e classifique o perfil de acesso. O perfil define quais módulos cada usuário pode acessar. <strong>Administrador</strong> tem acesso a todos os módulos do sistema.
          </p>
        </div>
        <Button onClick={() => setAddModalOpen(true)} className="gap-2 shrink-0">
          <Plus className="w-4 h-4" />
          Adicionar funcionário
        </Button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
          {error}
        </div>
      )}

      <Card>
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
          </div>
        ) : users.length === 0 ? (
          <div className="py-16 text-center text-slate-500">
            <UserCog className="w-12 h-12 mx-auto mb-3 text-slate-300" />
            <p className="font-medium">Nenhum funcionário cadastrado</p>
            <p className="text-sm mt-1">Use o botão acima para adicionar o primeiro usuário.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50">
                  <TableHead>Nome</TableHead>
                  <TableHead>E-mail</TableHead>
                  <TableHead className="hidden sm:table-cell">Perfil</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((u) => (
                  <TableRow key={u.id}>
                    <TableCell className="font-medium">{u.displayName || '—'}</TableCell>
                    <TableCell className="text-slate-600">{u.email}</TableCell>
                    <TableCell className="hidden sm:table-cell">
                      <span
                        className={
                          u.role === 'administrador' || u.role === 'admin'
                            ? 'text-amber-700 font-medium'
                            : u.role === 'comercial'
                              ? 'text-blue-700'
                              : 'text-slate-600'
                        }
                      >
                        {getRoleLabel(u.role)}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <select
                          value={u.role}
                          onChange={(e) => handleRoleChange(u, e.target.value)}
                          disabled={updatingId === u.id}
                          className="text-sm border border-slate-200 rounded-lg px-2 py-1.5 outline-none focus:border-emerald-500 disabled:opacity-50"
                        >
                          {ROLES_OPTIONS.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                              {opt.label}
                            </option>
                          ))}
                        </select>
                        {updatingId === u.id && (
                          <Loader2 className="w-4 h-4 animate-spin text-slate-400" />
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </Card>

      <AddUserModal
        open={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        onSuccess={loadUsers}
      />
    </div>
  );
}
