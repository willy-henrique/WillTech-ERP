import { useState, type FormEvent } from 'react';
import { Modal } from '../../../components/ui/Modal';
import { Button } from '../../../components/ui/Button';
import { adminUserService, ROLES_OPTIONS } from '../services/adminUserService';

interface AddUserModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function AddUserModal({ open, onClose, onSuccess }: AddUserModalProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [role, setRole] = useState<string>('usuario');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    if (!email.trim()) {
      setError('Informe o e-mail.');
      return;
    }
    if (!password || password.length < 6) {
      setError('A senha deve ter no mínimo 6 caracteres.');
      return;
    }
    setLoading(true);
    try {
      await adminUserService.createEmployee({
        email: email.trim(),
        password,
        displayName: displayName.trim() || email.trim(),
        role,
      });
      setEmail('');
      setPassword('');
      setDisplayName('');
      setRole('usuario');
      onSuccess();
      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Erro ao criar usuário.';
      setError(String(msg));
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="Adicionar funcionário">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-bold text-slate-500 uppercase mb-1">E-mail</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm outline-none focus:border-emerald-500"
            placeholder="funcionario@empresa.com"
            required
          />
        </div>
        <div>
          <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Nome</label>
          <input
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm outline-none focus:border-emerald-500"
            placeholder="Nome completo"
          />
        </div>
        <div>
          <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Senha</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm outline-none focus:border-emerald-500"
            placeholder="Mínimo 6 caracteres"
            minLength={6}
            required
          />
        </div>
        <div>
          <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Perfil</label>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm outline-none focus:border-emerald-500"
          >
            {ROLES_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
        {error && (
          <p className="text-sm text-red-600 bg-red-50 p-3 rounded-lg">{error}</p>
        )}
        <div className="flex gap-3 pt-2">
          <Button type="button" variant="outline" onClick={onClose} className="flex-1">
            Cancelar
          </Button>
          <Button type="submit" disabled={loading} className="flex-1">
            {loading ? 'Criando...' : 'Adicionar usuário'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
