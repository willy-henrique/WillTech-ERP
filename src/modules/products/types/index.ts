export interface Product {
  id: string;
  name: string;
  width: number; // cm
  length: number; // cm
  weight: number; // gramatura g/m2
  material: 'convencional' | 'laminado';
  printing: 'sem impressão' | 'frente' | 'frente e verso';
  color: string;
  stock: number;
  priceBase: number;
  status: 'active' | 'inactive';
  createdAt: string;
}

export interface ProductFilters {
  search?: string;
  material?: string;
  printing?: string;
}
