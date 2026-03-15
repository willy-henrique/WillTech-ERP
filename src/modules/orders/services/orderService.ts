import { collection, query, getDocs, doc, getDoc, addDoc, updateDoc, orderBy } from 'firebase/firestore';
import { db } from '../../../lib/firebase';
import type { Order, QuotationItem } from '../types';

function toDateStr(v: unknown): string {
  if (v == null) return '';
  if (typeof v === 'object' && v !== null && 'toDate' in v) return (v as { toDate: () => Date }).toDate().toISOString();
  return String(v);
}

function mapDocToOrder(id: string, data: Record<string, unknown>): Order {
  const items = (data.items as QuotationItem[] | undefined) ?? [];
  return {
    id,
    quotationId: data.quotationId as string | undefined,
    customerId: (data.customerId as string) ?? '',
    customerName: (data.customerName as string) ?? '',
    date: toDateStr(data.date ?? data.createdAt),
    deliveryDate: toDateStr(data.deliveryDate),
    totalAmount: (data.totalAmount as number) ?? 0,
    status: (data.status as Order['status']) ?? 'pending',
    items,
  };
}

export const orderService = {
  async getOrders(): Promise<Order[]> {
    const q = query(collection(db, 'orders'), orderBy('createdAt', 'desc'));
    const snap = await getDocs(q);
    return snap.docs.map((d) => mapDocToOrder(d.id, d.data()));
  },

  async getOrderById(id: string): Promise<Order | undefined> {
    const d = await getDoc(doc(db, 'orders', id));
    if (!d.exists()) return undefined;
    const data = d.data();
    return mapDocToOrder(d.id, { ...data, date: toDateStr(data?.date ?? data?.createdAt) });
  },

  async createOrder(data: Omit<Order, 'id' | 'date'>): Promise<string> {
    const ref = await addDoc(collection(db, 'orders'), {
      ...data,
      date: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    });
    return ref.id;
  },

  async updateOrder(id: string, data: Partial<Order>): Promise<void> {
    await updateDoc(doc(db, 'orders', id), { ...data });
  },
};
