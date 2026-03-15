import { collection, query, getDocs, orderBy } from 'firebase/firestore';
import { db } from '../../../lib/firebase';

export interface InventoryItemRecord {
  id: string;
  quantity: number;
  reservedQuantity: number;
  minQuantity: number;
  unit: string;
  updatedAt: string;
  name?: string;
}

function toStr(v: unknown): string {
  if (v == null) return '';
  if (typeof v === 'object' && 'toDate' in v) return (v as { toDate: () => Date }).toDate().toISOString();
  return String(v);
}

export async function getInventoryItems(): Promise<InventoryItemRecord[]> {
  const snap = await getDocs(collection(db, 'inventory_items'));
  const items = snap.docs.map((d) => {
    const data = d.data();
    return {
      id: d.id,
      quantity: (data.quantity as number) ?? 0,
      reservedQuantity: (data.reservedQuantity as number) ?? 0,
      minQuantity: (data.minQuantity as number) ?? 0,
      unit: (data.unit as string) ?? 'un',
      updatedAt: toStr(data.updatedAt),
      name: (data.name as string) ?? d.id,
    };
  });
  return items;
}
