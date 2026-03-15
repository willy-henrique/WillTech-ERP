import { collection, query, where, getDocs, doc, getDoc, addDoc, updateDoc, orderBy } from 'firebase/firestore';
import { db } from '../../../lib/firebase';
import type { Customer, CustomerFilters } from '../types';

function mapDocToCustomer(id: string, data: Record<string, unknown>): Customer {
  return {
    id,
    name: (data.name as string) ?? '',
    email: (data.email as string) ?? '',
    phone: (data.phone as string) ?? '',
    document: (data.document as string) ?? '',
    status: (data.status as Customer['status']) ?? 'active',
    city: (data.city as string) ?? '',
    state: (data.state as string) ?? '',
    totalOrders: (data.totalOrders as number) ?? 0,
    lastOrderDate: data.lastOrderDate as string | undefined,
    createdAt: (data.createdAt as { toDate?: () => Date })?.toDate?.()?.toISOString?.() ?? (data.createdAt as string) ?? '',
  };
}

export const customerService = {
  async getCustomers(filters?: CustomerFilters): Promise<Customer[]> {
    const q = query(collection(db, 'customers'), orderBy('name'));
    const snap = await getDocs(q);
    let list = snap.docs.map((d) => mapDocToCustomer(d.id, d.data()));
    if (filters?.status) list = list.filter((c) => c.status === filters.status);
    if (filters?.state) list = list.filter((c) => c.state === filters.state);
    if (filters?.search) {
      const search = filters.search.toLowerCase();
      list = list.filter(
        (c) =>
          c.name.toLowerCase().includes(search) ||
          (c.document ?? '').includes(search) ||
          c.email.toLowerCase().includes(search)
      );
    }
    return list;
  },

  async getCustomerById(id: string): Promise<Customer | undefined> {
    const d = await getDoc(doc(db, 'customers', id));
    if (!d.exists()) return undefined;
    return mapDocToCustomer(d.id, d.data());
  },

  async createCustomer(data: Omit<Customer, 'id' | 'createdAt'>): Promise<string> {
    const ref = await addDoc(collection(db, 'customers'), {
      ...data,
      createdAt: new Date().toISOString(),
    });
    return ref.id;
  },

  async updateCustomer(id: string, data: Partial<Omit<Customer, 'id'>>): Promise<void> {
    await updateDoc(doc(db, 'customers', id), { ...data, updatedAt: new Date().toISOString() });
  },
};
