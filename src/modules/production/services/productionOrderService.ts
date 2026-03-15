import { collection, query, getDocs, orderBy } from 'firebase/firestore';
import { db } from '../../../lib/firebase';

export interface ProductionOrderRecord {
  id: string;
  orderId: string | null;
  productVariantId: string;
  productSnapshot: Record<string, unknown>;
  quantity: number;
  status: string;
  createdAt: string;
}

function toStr(v: unknown): string {
  if (v == null) return '';
  if (typeof v === 'object' && 'toDate' in v) return (v as { toDate: () => Date }).toDate().toISOString();
  return String(v);
}

export async function getProductionOrders(): Promise<ProductionOrderRecord[]> {
  const q = query(collection(db, 'production_orders'), orderBy('createdAt', 'desc'));
  const snap = await getDocs(q);
  return snap.docs.map((d) => {
    const data = d.data();
    return {
      id: d.id,
      orderId: (data.orderId as string) ?? null,
      productVariantId: (data.productVariantId as string) ?? '',
      productSnapshot: (data.productSnapshot as Record<string, unknown>) ?? {},
      quantity: (data.quantity as number) ?? 0,
      status: (data.status as string) ?? 'open',
      createdAt: toStr(data.createdAt),
    };
  });
}
