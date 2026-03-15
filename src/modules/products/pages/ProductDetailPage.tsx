import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Package, Maximize2, Layers, Printer, Palette, Edit2, AlertTriangle } from 'lucide-react';
import { productService } from '../services/productService';
import { Product } from '../types';
import { Button } from '../../../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '../../../components/ui/Card';
import { Badge } from '../../../components/ui/Badge';

export function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadProduct() {
      setLoading(true);
      try {
        const all = await productService.getProducts({});
        const found = all.find(p => p.id === id);
        setProduct(found || null);
      } finally {
        setLoading(false);
      }
    }
    loadProduct();
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-bold text-slate-800">Produto não encontrado</h2>
        <Button variant="ghost" onClick={() => navigate('/products')} className="mt-4">
          Voltar para o catálogo
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => navigate('/products')}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar
        </Button>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Left Column: Technical Info */}
        <div className="w-full lg:w-1/3 space-y-6">
          <Card>
            <CardContent className="pt-8">
              <div className="w-20 h-20 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600 mx-auto mb-6">
                <Package className="w-10 h-10" />
              </div>
              <div className="text-center mb-8">
                <h2 className="text-xl font-bold text-slate-900">{product.name}</h2>
                <p className="text-sm text-slate-500">Código: {product.id}</p>
                <div className="mt-3">
                  <Badge variant={product.status === 'active' ? 'success' : 'default'}>
                    {product.status === 'active' ? 'Ativo' : 'Inativo'}
                  </Badge>
                </div>
              </div>

              <div className="space-y-4">
                <TechnicalDetail icon={Maximize2} label="Dimensões" value={`${product.width} x ${product.length} cm`} />
                <TechnicalDetail icon={Layers} label="Material" value={product.material} />
                <TechnicalDetail icon={Printer} label="Impressão" value={product.printing} />
                <TechnicalDetail icon={Palette} label="Cor do Tecido" value={product.color} />
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full gap-2">
                <Edit2 className="w-4 h-4" />
                Editar Especificação
              </Button>
            </CardFooter>
          </Card>

          {product.stock <= 0 && (
            <Card className="bg-amber-50 border-amber-200">
              <CardContent className="p-4 flex gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
                <div>
                  <p className="text-sm font-bold text-amber-900">Estoque zerado</p>
                  <p className="text-xs text-amber-700">Este produto está sem saldo em estoque.</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right Column: Inventory & Production */}
        <div className="flex-1 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <StatCard title="Estoque Atual" value={product.stock.toLocaleString()} unit="un" color="emerald" />
            <StatCard title="Em Produção" value="—" unit="" color="blue" />
            <StatCard title="Preço Base" value={product.priceBase > 0 ? `R$ ${product.priceBase.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` : '—'} unit="/un" color="slate" />
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Movimentação de Estoque</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead className="bg-slate-50 border-b border-slate-200 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                    <tr>
                      <th className="px-6 py-3">Data</th>
                      <th className="px-6 py-3">Tipo</th>
                      <th className="px-6 py-3">Quantidade</th>
                      <th className="px-6 py-3">Origem/Destino</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    <tr>
                      <td colSpan={4} className="px-6 py-8 text-center text-slate-400 text-sm">Nenhuma movimentação registrada. Integre o módulo de estoque para exibir entradas e saídas.</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Ordens de Produção Recentes</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead className="bg-slate-50 border-b border-slate-200 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                    <tr>
                      <th className="px-6 py-3">OP</th>
                      <th className="px-6 py-3">Quantidade</th>
                      <th className="px-6 py-3">Status</th>
                      <th className="px-6 py-3">Término</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    <tr>
                      <td colSpan={4} className="px-6 py-8 text-center text-slate-400 text-sm">Nenhuma ordem de produção vinculada. Integre o módulo de produção para exibir.</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function TechnicalDetail({ icon: Icon, label, value }: any) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-slate-50 last:border-0">
      <div className="flex items-center gap-3">
        <Icon className="w-4 h-4 text-slate-400" />
        <span className="text-sm text-slate-500">{label}</span>
      </div>
      <span className="text-sm font-bold text-slate-800 capitalize">{value}</span>
    </div>
  );
}

function StatCard({ title, value, unit, color }: any) {
  const colors: any = {
    emerald: 'text-emerald-600',
    blue: 'text-blue-600',
    slate: 'text-slate-600',
  };

  return (
    <Card className="p-5">
      <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">{title}</p>
      <p className={`text-2xl font-black ${colors[color]}`}>
        {value} <span className="text-xs font-normal text-slate-400">{unit}</span>
      </p>
    </Card>
  );
}

