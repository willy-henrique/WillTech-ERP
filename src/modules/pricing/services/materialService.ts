import { collection, getDocs, doc, getDoc, addDoc, updateDoc, orderBy, query } from 'firebase/firestore';
import { db } from '../../../lib/firebase';

export interface MaterialRecord {
  id: string;
  name: string;
  type: 'laminado' | 'convencional';
  costPerKg: number;
  unit: string;
  active?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

function mapDoc(id: string, data: Record<string, unknown>): MaterialRecord {
  const toStr = (v: unknown) => (v != null && typeof v === 'object' && 'toDate' in v ? (v as { toDate: () => Date }).toDate().toISOString() : (v as string) ?? '');
  return {
    id,
    name: (data.name as string) ?? '',
    type: (data.type as MaterialRecord['type']) ?? 'convencional',
    costPerKg: (data.costPerKg as number) ?? 0,
    unit: (data.unit as string) ?? 'kg',
    active: data.active !== false,
    createdAt: toStr(data.createdAt),
    updatedAt: toStr(data.updatedAt),
  };
}

export const materialService = {
  async getMaterials(): Promise<MaterialRecord[]> {
    const q = query(collection(db, 'materials'), orderBy('name'));
    const snap = await getDocs(q);
    return snap.docs.map((d) => mapDoc(d.id, d.data()));
  },

  async getMaterialById(id: string): Promise<MaterialRecord | undefined> {
    const d = await getDoc(doc(db, 'materials', id));
    if (!d.exists()) return undefined;
    return mapDoc(d.id, d.data());
  },

  async createMaterial(data: Omit<MaterialRecord, 'id'>): Promise<string> {
    const ref = await addDoc(collection(db, 'materials'), {
      ...data,
      createdAt: new Date().toISOString(),
    });
    return ref.id;
  },

  async updateMaterial(id: string, data: Partial<Omit<MaterialRecord, 'id'>>): Promise<void> {
    await updateDoc(doc(db, 'materials', id), { ...data, updatedAt: new Date().toISOString() });
  },
};
