export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  document: string; // CNPJ ou CPF
  status: 'active' | 'inactive' | 'blocked';
  city: string;
  state: string;
  totalOrders: number;
  lastOrderDate?: string;
  createdAt: string;
}

export interface CustomerFilters {
  search?: string;
  status?: string;
  state?: string;
}
