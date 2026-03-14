import { Product, ProductFilters } from '../types';
import { MOCK_PRODUCTS } from '../mocks';

export const productService = {
  getProducts: async (filters?: ProductFilters): Promise<Product[]> => {
    await new Promise(resolve => setTimeout(resolve, 600));

    let filtered = [...MOCK_PRODUCTS];

    if (filters?.search) {
      const search = filters.search.toLowerCase();
      filtered = filtered.filter(p => 
        p.name.toLowerCase().includes(search) || 
        p.id.includes(search)
      );
    }

    if (filters?.material) {
      filtered = filtered.filter(p => p.material === filters.material);
    }

    if (filters?.printing) {
      filtered = filtered.filter(p => p.printing === filters.printing);
    }

    return filtered;
  },

  getProductById: async (id: string): Promise<Product | undefined> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    return MOCK_PRODUCTS.find(p => p.id === id);
  }
};
