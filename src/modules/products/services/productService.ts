import { collection, query, getDocs, doc, getDoc, addDoc, updateDoc, orderBy } from 'firebase/firestore';
import { db } from '../../../lib/firebase';
import type { Product, ProductFilters } from '../types';

function mapDocToProduct(id: string, data: Record<string, unknown>): Product {
  const toStr = (v: unknown) => (v != null && typeof v === 'object' && 'toDate' in v ? (v as { toDate: () => Date }).toDate().toISOString() : (v as string) ?? '');
  return {
    id,
    name: (data.name as string) ?? '',
    width: (data.width as number) ?? 0,
    length: (data.length as number) ?? 0,
    weight: (data.weight as number) ?? 0,
    material: (data.material as Product['material']) ?? 'convencional',
    printing: (data.printing as Product['printing']) ?? 'sem impressão',
    color: (data.color as string) ?? '',
    stock: (data.stock as number) ?? 0,
    priceBase: (data.priceBase as number) ?? 0,
    status: (data.status as Product['status']) ?? 'active',
    createdAt: toStr(data.createdAt),
  };
}

export const productService = {
  async getProducts(filters?: ProductFilters): Promise<Product[]> {
    const q = query(collection(db, 'products'), orderBy('name'));
    const snap = await getDocs(q);
    let list = snap.docs.map((d) => mapDocToProduct(d.id, d.data()));
    if (filters?.search) {
      const search = filters.search.toLowerCase();
      list = list.filter((p) => p.name.toLowerCase().includes(search) || p.id.includes(search));
    }
    if (filters?.material) list = list.filter((p) => p.material === filters.material);
    if (filters?.printing) list = list.filter((p) => p.printing === filters.printing);
    return list;
  },

  async getProductById(id: string): Promise<Product | undefined> {
    const d = await getDoc(doc(db, 'products', id));
    if (!d.exists()) return undefined;
    return mapDocToProduct(d.id, d.data());
  },

  async createProduct(data: Omit<Product, 'id' | 'createdAt'>): Promise<string> {
    const ref = await addDoc(collection(db, 'products'), {
      ...data,
      createdAt: new Date().toISOString(),
    });
    return ref.id;
  },

  async updateProduct(id: string, data: Partial<Omit<Product, 'id'>>): Promise<void> {
    await updateDoc(doc(db, 'products', id), { ...data });
  },
};
