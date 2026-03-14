import { Customer, CustomerFilters } from '../types';
import { MOCK_CUSTOMERS } from '../mocks';

export const customerService = {
  getCustomers: async (filters?: CustomerFilters): Promise<Customer[]> => {
    // Simula latência de rede
    await new Promise(resolve => setTimeout(resolve, 800));

    let filtered = [...MOCK_CUSTOMERS];

    if (filters?.search) {
      const search = filters.search.toLowerCase();
      filtered = filtered.filter(c => 
        c.name.toLowerCase().includes(search) || 
        c.document.includes(search) ||
        c.email.toLowerCase().includes(search)
      );
    }

    if (filters?.status) {
      filtered = filtered.filter(c => c.status === filters.status);
    }

    if (filters?.state) {
      filtered = filtered.filter(c => c.state === filters.state);
    }

    return filtered;
  },

  getCustomerById: async (id: string): Promise<Customer | undefined> => {
    await new Promise(resolve => setTimeout(resolve, 400));
    return MOCK_CUSTOMERS.find(c => c.id === id);
  }
};
