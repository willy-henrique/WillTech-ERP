import { collection, query, getDocs, doc, getDoc, addDoc, updateDoc, orderBy } from 'firebase/firestore';
import { db } from '../../../lib/firebase';
import type { Quotation, QuotationItem } from '../types';

function toDateStr(v: unknown): string {
  if (v == null) return '';
  if (typeof v === 'object' && v !== null && 'toDate' in v) return (v as { toDate: () => Date }).toDate().toISOString();
  return String(v);
}

function mapDocToQuotation(id: string, data: Record<string, unknown>): Quotation {
  const items = (data.items as QuotationItem[] | undefined) ?? [];
  return {
    id,
    customerId: (data.customerId as string) ?? '',
    customerName: (data.customerName as string) ?? '',
    date: toDateStr(data.date ?? data.createdAt),
    validUntil: toDateStr(data.validUntil),
    items: items.map((i) => ({ ...i, id: (i as QuotationItem & { id?: string }).id ?? '' })),
    totalAmount: (data.totalAmount as number) ?? 0,
    status: (data.status as Quotation['status']) ?? 'draft',
    margin: (data.margin as number) ?? 0,
  };
}

export const quotationService = {
  async getQuotations(): Promise<Quotation[]> {
    const q = query(collection(db, 'quotations'), orderBy('createdAt', 'desc'));
    const snap = await getDocs(q);
    return snap.docs.map((d) => mapDocToQuotation(d.id, { ...d.data(), number: (d.data() as { number?: number }).number ?? d.id })) as Quotation[];
  },

  async getQuotationById(id: string): Promise<Quotation | undefined> {
    const d = await getDoc(doc(db, 'quotations', id));
    if (!d.exists()) return undefined;
    const data = d.data();
    return mapDocToQuotation(d.id, { ...data, date: toDateStr(data?.date ?? data?.createdAt) }) as Quotation;
  },

  async createQuotation(data: Omit<Quotation, 'id' | 'date'>): Promise<string> {
    const ref = await addDoc(collection(db, 'quotations'), {
      ...data,
      date: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    });
    return ref.id;
  },

  async updateQuotation(id: string, data: Partial<Quotation>): Promise<void> {
    await updateDoc(doc(db, 'quotations', id), { ...data });
  },
};
