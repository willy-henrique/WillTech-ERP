import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus } from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { Card } from '../../../components/ui/Card';
import { customerService } from '../../customers/services/customerService';
import { productService } from '../../products/services/productService';
import { calculatePriceFromParams } from '../../pricing/services/pricingService';
import { createQuotationCallable } from '../services/quotationCallableService';
import type { Customer } from '../../customers/types';
import type { Product } from '../../products/types';
import type { QuotationItem } from '../types';

const printTypeToCloud = (p: string): 'liso' | 'frente' | 'frente_verso' =>
  p === 'frente' ? 'frente' : p === 'frente e verso' ? 'frente_verso' : 'liso';

export function NewQuotationPage() {
  const navigate = useNavigate();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [customerId, setCustomerId] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [items, setItems] = useState<QuotationItem[]>([]);
  const [addingProductId, setAddingProductId] = useState('');
  const [addingQty, setAddingQty] = useState(1000);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    customerService.getCustomers().then(setCustomers);
    productService.getProducts().then(setProducts);
  }, []);

  const handleAddItem = async () => {
    const product = products.find((p) => p.id === addingProductId);
    if (!product || !addingQty) return;
    try {
      const cloud = await calculatePriceFromParams({
        width: product.width,
        length: product.length,
        grammage: product.weight,
        materialType: product.material,
        printType: printTypeToCloud(product.printing),
        quantity: addingQty,
      });
      setItems((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          productId: product.id,
          productName: product.name,
          quantity: addingQty,
          unitPrice: cloud.unitPrice,
          totalPrice: cloud.totalPrice,
        },
      ]);
      setAddingProductId('');
      setAddingQty(1000);
    } catch (e) {
      console.error(e);
    }
  };

  const handleCreate = async () => {
    const name = customerName || customers.find((c) => c.id === customerId)?.name;
    if (!customerId || !name || !items.length) return;
    setSaving(true);
    try {
      const payload = {
        customerId,
        customerName: name,
        items: items.map((i) => ({
          productVariantId: i.productId ?? '',
          productName: i.productName,
          quantity: i.quantity,
          unitPrice: i.unitPrice,
          totalPrice: i.totalPrice,
        })),
      };
      await createQuotationCallable(payload);
      navigate('/quotations');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => navigate('/quotations')} className="gap-1">
          <ArrowLeft className="w-4 h-4" />
          Voltar
        </Button>
        <h1 className="text-2xl font-bold text-slate-900">Novo Orçamento</h1>
      </div>

      <Card className="p-6 space-y-4">
        <div>
          <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Cliente</label>
          <select
            value={customerId}
            onChange={(e) => {
              const id = e.target.value;
              setCustomerId(id);
              setCustomerName(customers.find((c) => c.id === id)?.name ?? '');
            }}
            className="w-full max-w-md px-3 py-2 border border-slate-200 rounded-lg text-sm"
          >
            <option value="">Selecione</option>
            {customers.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>

        <div className="border-t border-slate-100 pt-4">
          <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Itens</label>
          <div className="flex flex-wrap gap-2 mb-4">
            <select
              value={addingProductId}
              onChange={(e) => setAddingProductId(e.target.value)}
              className="px-3 py-2 border border-slate-200 rounded-lg text-sm"
            >
              <option value="">Produto</option>
              {products.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
            <input
              type="number"
              value={addingQty}
              onChange={(e) => setAddingQty(Number(e.target.value))}
              className="w-24 px-3 py-2 border border-slate-200 rounded-lg text-sm"
              placeholder="Qtd"
            />
            <Button size="sm" onClick={handleAddItem} disabled={!addingProductId}>
              <Plus className="w-4 h-4" />
              Adicionar (calcula preço)
            </Button>
          </div>
          <ul className="space-y-2">
            {items.map((i) => (
              <li key={i.id} className="flex justify-between text-sm py-2 border-b border-slate-100">
                <span>{i.productName} × {i.quantity}</span>
                <span>R$ {i.totalPrice.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="flex justify-end gap-2 pt-4">
          <Button variant="outline" onClick={() => navigate('/quotations')}>Cancelar</Button>
          <Button onClick={handleCreate} disabled={saving || !customerId || !items.length}>
            {saving ? 'Salvando...' : 'Criar orçamento'}
          </Button>
        </div>
      </Card>
    </div>
  );
}
