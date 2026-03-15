import {
  collection,
  getDocs,
  doc,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  Timestamp,
} from 'firebase/firestore';
import { db } from '../../../lib/firebase';
import { getAuth } from 'firebase/auth';

function auditLog(action: string, entityId: string, details?: string) {
  const user = getAuth().currentUser;
  addDoc(collection(db, 'audit_logs'), {
    action,
    entityType: 'rafia_size',
    entityId,
    userId: user?.uid ?? '',
    userEmail: user?.email ?? '',
    details: details ?? '',
    timestamp: Timestamp.now(),
  }).catch(console.error);
}

export interface RafiaSize {
  id: string;
  label: string;
  widthCm: number;
  lengthCm: number;
  material: 'LAMINADO' | 'CONVENCIONAL';
  grammage: number;
  active: boolean;
  order: number;
  createdAt?: string;
  updatedAt?: string;
}

const COL = 'rafia_sizes';

function toStr(v: unknown): string {
  if (v == null) return '';
  if (typeof v === 'object' && 'toDate' in v)
    return (v as { toDate: () => Date }).toDate().toISOString();
  return String(v);
}

function mapDoc(id: string, data: Record<string, unknown>): RafiaSize {
  return {
    id,
    label: (data.label as string) ?? '',
    widthCm: (data.widthCm as number) ?? 0,
    lengthCm: (data.lengthCm as number) ?? 0,
    material: (data.material as RafiaSize['material']) ?? 'LAMINADO',
    grammage: (data.grammage as number) ?? 60,
    active: data.active !== false,
    order: (data.order as number) ?? 0,
    createdAt: toStr(data.createdAt),
    updatedAt: toStr(data.updatedAt),
  };
}

export const rafiaSizeService = {
  async getAll(): Promise<RafiaSize[]> {
    const q = query(collection(db, COL), where('active', '==', true), orderBy('order'));
    const snap = await getDocs(q);
    return snap.docs.map((d) => mapDoc(d.id, d.data()));
  },

  async getById(id: string): Promise<RafiaSize | undefined> {
    const d = await getDoc(doc(db, COL, id));
    if (!d.exists()) return undefined;
    return mapDoc(d.id, d.data());
  },

  async create(data: Omit<RafiaSize, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    const ref = await addDoc(collection(db, COL), {
      ...data,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });
    auditLog('rafia_size_created', ref.id, `${data.label} ${data.material}`);
    return ref.id;
  },

  async update(id: string, data: Partial<Omit<RafiaSize, 'id'>>): Promise<void> {
    await updateDoc(doc(db, COL, id), {
      ...data,
      updatedAt: Timestamp.now(),
    });
    auditLog('rafia_size_updated', id, JSON.stringify(data));
  },

  async softDelete(id: string): Promise<void> {
    await updateDoc(doc(db, COL, id), {
      active: false,
      updatedAt: Timestamp.now(),
    });
    auditLog('rafia_size_deleted', id);
  },

  async hardDelete(id: string): Promise<void> {
    await deleteDoc(doc(db, COL, id));
  },

  async bulkCreate(sizes: Omit<RafiaSize, 'id' | 'createdAt' | 'updatedAt'>[]): Promise<number> {
    let count = 0;
    for (const size of sizes) {
      await addDoc(collection(db, COL), {
        ...size,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      });
      count++;
    }
    return count;
  },
};
