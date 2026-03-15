import { collection, getDocs, doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { httpsCallable } from 'firebase/functions';
import { db, functions } from '../../../lib/firebase';

export type UserRole = 'administrador' | 'admin' | 'comercial' | 'usuario';

export interface AppUser {
  id: string;
  email: string;
  displayName: string;
  role: UserRole;
  createdAt?: string;
  updatedAt?: string;
  createdBy?: string;
  updatedBy?: string;
}

const ROLES_LABEL: Record<string, string> = {
  administrador: 'Administrador',
  admin: 'Administrador',
  comercial: 'Vendedor',
  vendedor: 'Vendedor',
  usuario: 'Usuário',
  user: 'Usuário',
};

export function getRoleLabel(role: string): string {
  return ROLES_LABEL[role] ?? role;
}

export const ROLES_OPTIONS: { value: UserRole; label: string }[] = [
  { value: 'administrador', label: 'Administrador' },
  { value: 'comercial', label: 'Vendedor' },
  { value: 'usuario', label: 'Usuário' },
];

function toStr(v: unknown): string {
  if (v == null) return '';
  if (typeof v === 'object' && 'toDate' in v)
    return (v as { toDate: () => Date }).toDate().toISOString();
  return String(v);
}

function mapDoc(id: string, data: Record<string, unknown>): AppUser {
  return {
    id,
    email: (data.email as string) ?? '',
    displayName: (data.displayName as string) ?? '',
    role: (data.role as UserRole) ?? 'usuario',
    createdAt: toStr(data.createdAt),
    updatedAt: toStr(data.updatedAt),
    createdBy: data.createdBy as string | undefined,
    updatedBy: data.updatedBy as string | undefined,
  };
}

export const adminUserService = {
  async getUsers(): Promise<AppUser[]> {
    const snap = await getDocs(collection(db, 'users'));
    const list = snap.docs.map((d) => mapDoc(d.id, d.data()));
    list.sort((a, b) => (a.displayName || a.email).localeCompare(b.displayName || b.email));
    return list;
  },

  async ensureCurrentUserDoc(uid: string, email: string, displayName: string, role: string): Promise<void> {
    const ref = doc(db, 'users', uid);
    const snap = await getDoc(ref);
    if (!snap.exists()) {
      await setDoc(ref, {
        email,
        displayName: displayName || email,
        role: role || 'administrador',
        updatedAt: serverTimestamp(),
      });
    }
  },

  async createEmployee(data: {
    email: string;
    password: string;
    displayName: string;
    role: string;
  }): Promise<{ uid: string; email: string; displayName: string; role: string }> {
    const fn = httpsCallable<
      { email: string; password: string; displayName: string; role: string },
      { uid: string; email: string; displayName: string; role: string }
    >(functions, 'createEmployee');
    const res = await fn(data);
    return res.data as { uid: string; email: string; displayName: string; role: string };
  },

  async setUserRole(targetUserId: string, role: string): Promise<void> {
    const fn = httpsCallable<{ targetUserId: string; role: string }, { success: boolean }>(
      functions,
      'setUserRole'
    );
    await fn({ targetUserId, role });
  },

  async ensureAdminClaim(): Promise<{ role: string }> {
    const fn = httpsCallable<unknown, { success: boolean; role: string }>(functions, 'ensureAdminClaim');
    const res = await fn({});
    return { role: res.data.role };
  },
};
