import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Search, 
  Plus, 
  Filter, 
  Edit2, 
  Trash2,
  Package,
  Layers,
  Printer,
  Maximize2
} from 'lucide-react';
import { productService } from '../services/productService';
import { Product, ProductFilters } from '../types';
import { Button } from '../../../components/ui/Button';
import { Card, CardContent, CardFooter } from '../../../components/ui/Card';
import { Badge } from '../../../components/ui/Badge';
import { Input } from '../../../components/ui/Input';

export function ProductListPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<ProductFilters>({ search: '', material: '', printing: '' });

  useEffect(() => {
    loadProducts();
  }, [filters]);

  async function loadProducts() {
    setLoading(true);
    try {
      const data = await productService.getProducts(filters);
      setProducts(data);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Produtos / Modelos</h1>
          <p className="text-slate-500">Catálogo técnico de sacaria e modelos de ráfia.</p>
        </div>
        <Button className="gap-2">
          <Plus className="w-4 h-4" />
          Novo Produto
        </Button>
      </div>

      {/* Filters */}
      <Card className="p-4 grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="md:col-span-2 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input 
            type="text" 
            placeholder="Buscar por nome ou código..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
          />
        </div>
        <select 
          className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
          value={filters.material}
          onChange={(e) => setFilters({ ...filters, material: e.target.value })}
        >
          <option value="">Todos os Materiais</option>
          <option value="convencional">Convencional</option>
          <option value="laminado">Laminado</option>
        </select>
        <select 
          className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
          value={filters.printing}
          onChange={(e) => setFilters({ ...filters, printing: e.target.value })}
        >
          <option value="">Todas as Impressões</option>
          <option value="sem impressão">Sem Impressão</option>
          <option value="frente">Frente</option>
          <option value="frente e verso">Frente e Verso</option>
        </select>
      </Card>

      {/* Grid of Products */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="animate-pulse h-64"></Card>
          ))
        ) : products.length === 0 ? (
          <div className="col-span-full py-20 text-center bg-white rounded-xl border border-dashed border-slate-300 text-slate-500">
            Nenhum produto encontrado.
          </div>
        ) : (
          products.map((product) => (
            <Card key={product.id} className="hover:shadow-md transition-all group flex flex-col">
              <CardContent className="flex-1">
                <div className="flex items-start justify-between mb-4">
                  <div className="p-2 bg-emerald-50 rounded-lg text-emerald-600">
                    <Package className="w-6 h-6" />
                  </div>
                  <Badge variant={product.status === 'active' ? 'success' : 'default'}>
                    {product.status === 'active' ? 'Ativo' : 'Inativo'}
                  </Badge>
                </div>
                
                <Link to={`/products/${product.id}`}>
                  <h3 className="text-lg font-bold text-slate-900 mb-1 group-hover:text-emerald-600 transition-colors">
                    {product.name}
                  </h3>
                </Link>
                <p className="text-xs text-slate-400 mb-4">ID: {product.id}</p>

                <div className="grid grid-cols-2 gap-y-3 gap-x-4">
                  <div className="flex items-center gap-2 text-slate-600">
                    <Maximize2 className="w-4 h-4 text-slate-400" />
                    <span className="text-xs">{product.width}x{product.length} cm</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-600">
                    <Layers className="w-4 h-4 text-slate-400" />
                    <span className="text-xs capitalize">{product.material}</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-600">
                    <Printer className="w-4 h-4 text-slate-400" />
                    <span className="text-xs capitalize">{product.printing}</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-600">
                    <div className="w-4 h-4 rounded-full border border-slate-200" style={{ backgroundColor: product.color === 'Branco' ? '#fff' : '#fbbf24' }}></div>
                    <span className="text-xs">{product.color}</span>
                  </div>
                </div>
              </CardContent>

              <CardFooter className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] uppercase font-bold text-slate-400">Estoque</p>
                  <p className="text-sm font-bold text-slate-800">{product.stock.toLocaleString()} un</p>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm" className="p-2 h-8 w-8 hover:text-blue-600">
                    <Edit2 className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="sm" className="p-2 h-8 w-8 hover:text-red-600">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardFooter>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
